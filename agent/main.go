package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
)

type JoinRequest struct {
	RoomName     string            `json:"room_name"`
	AIProvider   string            `json:"ai_provider"`
	SystemPrompt string            `json:"system_prompt"`
	Metadata     map[string]string `json:"metadata"`
}

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

	if lkUrl == "" || aiKey == "" {
		log.Fatal("Missing Environment Variables. Required: LIVEKIT_URL, AI_API_KEY")
	}

	var wg sync.WaitGroup

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

		finalPrompt := injectContext(req.SystemPrompt, req.Metadata)
		log.Printf("Starting Agent for Room: %s, Provider: %s", req.RoomName, req.AIProvider)
		
		// Spin up a new isolated Goroutine for this call session
		wg.Add(1)
		go func(roomName, provider, prompt string) {
			defer wg.Done()

			bridge := NewAudioBridge()
			// Do NOT defer bridge.Close() here, because bridge.Close() will be called when LiveKit room disconnects. Wait, actually we DO want to close it if the room disconnects.
			// Let's rely on LiveKit's disconnection to trigger everything.
			
			if provider == "alibaba" {
				aliConn := ConnectToAlibabaOmni(aiKey, prompt, bridge)
				if aliConn != nil {
					defer aliConn.Close()
				}
			} else {
				geminiConn := ConnectToGeminiLive(aiKey, prompt, bridge)
				if geminiConn != nil {
					defer geminiConn.Close()
				}
			}

			// Connect to LiveKit and block until room is disconnected
			room, done := ConnectToLiveKit(lkUrl, lkKey, lkSecret, roomName, bridge)
			if room != nil {
				<-done
				log.Printf("Room %s closed. Tearing down Goroutine.", roomName)
			}
		}(req.RoomName, req.AIProvider, finalPrompt)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{"status": "Agent successfully joined", "room_name": req.RoomName})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("CPaaS AI Auto-Scaling Worker listening on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}

	wg.Wait()
}
