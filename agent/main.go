package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type JoinRequest struct {
	RoomName     string            `json:"room_name"`
	AIProvider   string            `json:"ai_provider"`
	SystemPrompt string            `json:"system_prompt"`
	Metadata     map[string]string `json:"metadata"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Version   string `json:"version"`
	Uptime    string `json:"uptime"`
	Sessions  int    `json:"active_sessions"`
	Timestamp string `json:"timestamp"`
}

var (
	startTime      = time.Now()
	activeSessions sync.Map
	sessionCount   int
	sessionMu      sync.Mutex
)

func injectContext(prompt string, metadata map[string]string) string {
	for k, v := range metadata {
		placeholder := fmt.Sprintf("{{%s}}", k)
		prompt = strings.ReplaceAll(prompt, placeholder, v)
	}
	return prompt
}

func main() {
	lkUrl := os.Getenv("LIVEKIT_URL")
	lkKey := os.Getenv("LIVEKIT_API_KEY")
	lkSecret := os.Getenv("LIVEKIT_API_SECRET")
	aiKey := os.Getenv("AI_API_KEY")
	eslHost := os.Getenv("FREESWITCH_ESL_HOST") // e.g. freeswitch-svc.voip-core.svc.cluster.local:8021
	eslPass := os.Getenv("FREESWITCH_ESL_PASS")
	backendURL := os.Getenv("BACKEND_API_URL")

	if lkUrl == "" || aiKey == "" {
		log.Fatal("Missing required env vars: LIVEKIT_URL, AI_API_KEY")
	}

	log.Printf("CPaaS AI Agent starting...")
	log.Printf("  LiveKit: %s", lkUrl)
	log.Printf("  ESL Host: %s", eslHost)
	log.Printf("  Backend: %s", backendURL)

	// ---- HTTP Routes ----

	// Worker join endpoint — called by ASP.NET when a call comes in
	http.HandleFunc("/worker/join", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req JoinRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		if req.RoomName == "" {
			http.Error(w, "room_name is required", http.StatusBadRequest)
			return
		}

		if req.Metadata == nil {
			req.Metadata = make(map[string]string)
		}

		// Inject context into prompt
		finalPrompt := injectContext(req.SystemPrompt, req.Metadata)

		log.Printf("Agent: Starting session for room=%s provider=%s caller=%s",
			req.RoomName, req.AIProvider, req.Metadata["caller_number"])

		// Create call session
		session := NewCallSession(req)
		if backendURL != "" {
			session.FreeSwitchUUID = req.Metadata["freeswitch_uuid"]
		}

		// Connect to FreeSWITCH ESL for call control
		if eslHost != "" && req.Metadata["freeswitch_uuid"] != "" {
			eslClient, err := NewESLClient(eslHost, eslPass)
			if err != nil {
				log.Printf("Agent: ESL connection failed (non-fatal): %v", err)
			} else {
				session.ESLClient = eslClient
			}
		}

		// Track active session
		activeSessions.Store(req.RoomName, session)
		sessionMu.Lock()
		sessionCount++
		sessionMu.Unlock()

		// Respond immediately (async call setup)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{
			"status":    "accepted",
			"room_name": req.RoomName,
		})

		// Start call session in a goroutine
		go runCallSession(session, req.AIProvider, finalPrompt, lkUrl, lkKey, lkSecret, aiKey, backendURL)
	})

	// Health endpoint — used by K8s liveness/readiness probes
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		sessionMu.Lock()
		count := sessionCount
		sessionMu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{
			Status:    "ok",
			Version:   "2.0.0",
			Uptime:    time.Since(startTime).String(),
			Sessions:  count,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	})

	// Metrics endpoint — for Prometheus scraping
	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		sessionMu.Lock()
		count := sessionCount
		sessionMu.Unlock()

		fmt.Fprintf(w, "# HELP cpaas_active_sessions Number of active AI call sessions\n")
		fmt.Fprintf(w, "# TYPE cpaas_active_sessions gauge\n")
		fmt.Fprintf(w, "cpaas_active_sessions %d\n", count)
		fmt.Fprintf(w, "# HELP cpaas_uptime_seconds Agent uptime in seconds\n")
		fmt.Fprintf(w, "# TYPE cpaas_uptime_seconds counter\n")
		fmt.Fprintf(w, "cpaas_uptime_seconds %.0f\n", time.Since(startTime).Seconds())
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("CPaaS AI Agent listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// runCallSession manages the complete lifecycle of one call
func runCallSession(
	session *CallSession,
	provider, prompt string,
	lkUrl, lkKey, lkSecret, aiKey, backendURL string,
) {
	defer func() {
		// Cleanup on session end
		activeSessions.Delete(session.RoomName)
		sessionMu.Lock()
		sessionCount--
		sessionMu.Unlock()

		if session.ESLClient != nil {
			session.ESLClient.Close()
		}

		// Report CDR for billing
		if backendURL != "" {
			session.Report(backendURL)
		}

		log.Printf("Agent: Session ended for room=%s (duration=%s)",
			session.RoomName, time.Since(session.StartTime).String())
	}()

	// Create audio bridge (Opus encoder/decoder)
	bridge := NewAudioBridge()

	// Connect to AI provider
	switch strings.ToLower(provider) {
	case "alibaba":
		aliConn := ConnectToAlibabaOmni(aiKey, prompt, bridge)
		if aliConn != nil {
			defer aliConn.Close()
		}
	default: // gemini
		geminiConn := ConnectToGeminiLive(aiKey, prompt, bridge, session)
		if geminiConn != nil {
			defer geminiConn.Close()
		}
	}

	// Connect to LiveKit and block until room is disconnected
	room, done := ConnectToLiveKit(lkUrl, lkKey, lkSecret, session.RoomName, bridge)
	if room != nil {
		<-done
		log.Printf("Agent: LiveKit room %s closed", session.RoomName)
	}
}
