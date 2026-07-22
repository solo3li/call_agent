package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/url"
	"strings"

	"github.com/gorilla/websocket"
)

// ===========================================================
// Gemini Flash Live API — Full Implementation
// Supports:
//   - Bidirectional audio streaming (PCM 16kHz → PCM 24kHz)
//   - Function Calling: transfer_to_sip, transfer_to_webrtc
//   - Interruption detection
//   - Sentiment analysis
// ===========================================================

// GeminiResponse represents the full structure from Gemini Live API
type GeminiResponse struct {
	SetupComplete interface{} `json:"setupComplete"`
	ServerContent *struct {
		Interrupted   bool `json:"interrupted"`
		TurnComplete  bool `json:"turnComplete"`
		ModelTurn     *struct {
			Parts []struct {
				Text       string `json:"text"`
				InlineData *struct {
					MimeType string `json:"mimeType"`
					Data     string `json:"data"`
				} `json:"inlineData"`
				FunctionCall *struct {
					Name string                 `json:"name"`
					Args map[string]interface{} `json:"args"`
				} `json:"functionCall"`
			} `json:"parts"`
		} `json:"modelTurn"`
	} `json:"serverContent"`
	ToolCall *struct {
		FunctionCalls []struct {
			ID   string                 `json:"id"`
			Name string                 `json:"name"`
			Args map[string]interface{} `json:"args"`
		} `json:"functionCalls"`
	} `json:"toolCall"`
}

// GeminiLiveConn holds the connection and session reference
type GeminiLiveConn struct {
	conn    *websocket.Conn
	session *CallSession
	bridge  *AudioBridge
}

func ConnectToGeminiLive(apiKey string, systemPrompt string, bridge *AudioBridge, session *CallSession) *websocket.Conn {
	u := url.URL{
		Scheme: "wss",
		Host:   "generativelanguage.googleapis.com",
		Path:   "/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent",
	}
	q := u.Query()
	q.Set("key", apiKey)
	u.RawQuery = q.Encode()

	log.Printf("Gemini: Connecting to Live API for room %s...", session.RoomName)
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Printf("Gemini: Dial error: %v", err)
		return nil
	}
	log.Printf("Gemini: Connected for room %s", session.RoomName)

	// ---- Send Setup Message ----
	setupMsg := buildGeminiSetupMessage(systemPrompt)
	if err := c.WriteJSON(setupMsg); err != nil {
		log.Printf("Gemini: Error sending setup: %v", err)
	} else {
		log.Printf("Gemini: Setup sent (prompt length: %d chars)", len(systemPrompt))
	}

	glc := &GeminiLiveConn{conn: c, session: session, bridge: bridge}

	// Goroutine 1: Stream audio FROM user TO Gemini
	go glc.streamOutgoing()

	// Goroutine 2: Receive responses FROM Gemini (audio + function calls)
	go glc.handleIncoming()

	return c
}

// buildGeminiSetupMessage constructs the initial setup payload
func buildGeminiSetupMessage(systemPrompt string) map[string]interface{} {
	return map[string]interface{}{
		"setup": map[string]interface{}{
			"model": "models/gemini-2.0-flash-exp",
			"generationConfig": map[string]interface{}{
				"responseModalities": []string{"AUDIO"},
				"speechConfig": map[string]interface{}{
					"voiceConfig": map[string]interface{}{
						"prebuiltVoiceConfig": map[string]interface{}{
							// Aoede = natural, conversational voice
							"voiceName": "Aoede",
						},
					},
				},
			},
			"systemInstruction": map[string]interface{}{
				"parts": []map[string]interface{}{
					{"text": systemPrompt},
				},
			},
			"tools": []map[string]interface{}{
				{
					"functionDeclarations": []map[string]interface{}{
						{
							"name":        "transfer_to_sip",
							"description": "Transfer the current call to a human agent via SIP. Use this when the user is angry, frustrated, or explicitly requests a human. Inform the user first before calling this function.",
							"parameters": map[string]interface{}{
								"type": "object",
								"properties": map[string]interface{}{
									"sip_uri": map[string]interface{}{
										"type":        "string",
										"description": "The SIP URI of the human agent, e.g. sip:agent@company.com",
									},
									"reason": map[string]interface{}{
										"type":        "string",
										"description": "Reason for transfer (e.g. user_request, complexity, sentiment)",
									},
								},
								"required": []string{"sip_uri"},
							},
						},
						{
							"name":        "transfer_to_webrtc",
							"description": "Transfer the call to a human agent via WebRTC browser call. Use when the user prefers web-based support.",
						},
						{
							"name":        "end_call",
							"description": "End the call gracefully after completing the conversation. Always say goodbye before calling this.",
						},
						{
							"name":        "webhook_action",
							"description": "Execute a business action by calling the customer's webhook (e.g., book appointment, check order, update record).",
							"parameters": map[string]interface{}{
								"type": "object",
								"properties": map[string]interface{}{
									"action": map[string]interface{}{
										"type":        "string",
										"description": "The action to perform (e.g., book_appointment, check_order_status, cancel_reservation)",
									},
									"params": map[string]interface{}{
										"type":        "object",
										"description": "Key-value parameters for the action",
									},
								},
								"required": []string{"action"},
							},
						},
					},
				},
			},
		},
	}
}

// streamOutgoing sends audio from user to Gemini
func (g *GeminiLiveConn) streamOutgoing() {
	for pcm := range g.bridge.PCMOut {
		// Convert int16 PCM to bytes (little-endian)
		pcmBytes := make([]byte, len(pcm)*2)
		for i, sample := range pcm {
			pcmBytes[i*2] = byte(sample)
			pcmBytes[i*2+1] = byte(sample >> 8)
		}

		b64 := base64.StdEncoding.EncodeToString(pcmBytes)
		msg := map[string]interface{}{
			"realtimeInput": map[string]interface{}{
				"mediaChunks": []map[string]string{
					// Gemini expects PCM at 16kHz, 16-bit, mono
					{"mimeType": "audio/pcm;rate=16000", "data": b64},
				},
			},
		}

		if err := g.conn.WriteJSON(msg); err != nil {
			log.Printf("Gemini: Error sending audio for room %s: %v", g.session.RoomName, err)
			break
		}
	}
}

// handleIncoming processes all responses from Gemini
func (g *GeminiLiveConn) handleIncoming() {
	backendURL := getEnv("BACKEND_API_URL", "http://backend-api:8080")

	for {
		_, message, err := g.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("Gemini: Connection closed for room %s: %v", g.session.RoomName, err)
			}
			break
		}

		var resp GeminiResponse
		if err := json.Unmarshal(message, &resp); err != nil {
			log.Printf("Gemini: Failed to parse response: %v", err)
			continue
		}

		// ---- Handle setup confirmation ----
		if resp.SetupComplete != nil {
			log.Printf("Gemini: Setup complete for room %s ✓", g.session.RoomName)
			continue
		}

		// ---- Handle server content (audio + text) ----
		if resp.ServerContent != nil {
			sc := resp.ServerContent

			// Handle interruption (user cut off the bot)
			if sc.Interrupted {
				log.Printf("Gemini: Interrupted by user in room %s", g.session.RoomName)
				// Drain the PCMIn buffer to stop current audio playback
				for len(g.bridge.PCMIn) > 0 {
					<-g.bridge.PCMIn
				}
				continue
			}

			if sc.ModelTurn != nil {
				for _, part := range sc.ModelTurn.Parts {
					// ---- Audio response → send to LiveKit ----
					if part.InlineData != nil &&
						strings.HasPrefix(part.InlineData.MimeType, "audio/pcm") {

						audioBytes, err := base64.StdEncoding.DecodeString(part.InlineData.Data)
						if err != nil {
							log.Printf("Gemini: Failed to decode audio: %v", err)
							continue
						}

						// Convert raw bytes back to int16 PCM samples
						pcm := make([]int16, len(audioBytes)/2)
						for i := range pcm {
							pcm[i] = int16(audioBytes[i*2]) | int16(audioBytes[i*2+1])<<8
						}

						// Send to bridge → LiveKit → User's phone
						select {
						case g.bridge.PCMIn <- pcm:
						default:
							// Drop if buffer full (prevents latency buildup)
						}
					}

					// ---- Text response (for logging/transcription) ----
					if part.Text != "" {
						log.Printf("Gemini [%s] Text: %s", g.session.RoomName, part.Text)
						// Analyze sentiment from text
						g.analyzeSentiment(part.Text)
					}

					// ---- Inline function call ----
					if part.FunctionCall != nil {
						g.handleFunctionCall(
							part.FunctionCall.Name,
							part.FunctionCall.Args,
							backendURL,
						)
					}
				}
			}
		}

		// ---- Handle tool calls (function calling) ----
		if resp.ToolCall != nil {
			for _, fc := range resp.ToolCall.FunctionCalls {
				log.Printf("Gemini: Function call [%s] in room %s", fc.Name, g.session.RoomName)
				result := g.handleFunctionCall(fc.Name, fc.Args, backendURL)

				// Send function response back to Gemini
				funcResponse := map[string]interface{}{
					"toolResponse": map[string]interface{}{
						"functionResponses": []map[string]interface{}{
							{
								"id":       fc.ID,
								"name":     fc.Name,
								"response": map[string]interface{}{"result": result},
							},
						},
					},
				}
				if err := g.conn.WriteJSON(funcResponse); err != nil {
					log.Printf("Gemini: Failed to send function response: %v", err)
				}
			}
		}
	}
}

// handleFunctionCall executes Gemini's function calls
func (g *GeminiLiveConn) handleFunctionCall(name string, args map[string]interface{}, backendURL string) string {
	log.Printf("Gemini: Executing function '%s' for room %s with args: %v", name, g.session.RoomName, args)

	switch name {

	case "transfer_to_sip":
		sipURI, _ := args["sip_uri"].(string)
		reason, _ := args["reason"].(string)
		if sipURI == "" {
			return "error: sip_uri is required"
		}
		log.Printf("Gemini: Initiating SIP transfer to %s (reason: %s)", sipURI, reason)
		g.session.HandleHumanTransfer(sipURI)
		return "transfer_initiated"

	case "transfer_to_webrtc":
		log.Printf("Gemini: WebRTC transfer requested for room %s", g.session.RoomName)
		// Notify backend to prepare WebRTC handoff
		go notifyBackend(backendURL+"/api/internal/transfer", map[string]interface{}{
			"roomName": g.session.RoomName,
			"type":     "webrtc",
			"tenantId": g.session.TenantID,
		})
		return "webrtc_transfer_initiated"

	case "end_call":
		log.Printf("Gemini: Ending call for room %s", g.session.RoomName)
		if g.session.ESLClient != nil && g.session.FreeSwitchUUID != "" {
			go g.session.ESLClient.HangupCall(g.session.FreeSwitchUUID, "NORMAL_CLEARING")
		}
		return "call_ended"

	case "webhook_action":
		action, _ := args["action"].(string)
		params, _ := args["params"].(map[string]interface{})
		log.Printf("Gemini: Webhook action '%s' for tenant %s", action, g.session.TenantID)

		result := executeWebhookAction(backendURL, g.session.TenantID, action, params)
		return result

	default:
		log.Printf("Gemini: Unknown function '%s'", name)
		return "unknown_function"
	}
}

// analyzeSentiment detects anger/frustration from text to trigger human transfer
func (g *GeminiLiveConn) analyzeSentiment(text string) {
	text = strings.ToLower(text)
	angerKeywords := []string{"غاضب", "محبط", "مشكلة", "سيئ", "فظيع", "angry", "frustrated", "terrible", "horrible"}
	for _, kw := range angerKeywords {
		if strings.Contains(text, kw) {
			g.session.Sentiment = "negative"
			return
		}
	}
}

func getEnv(key, fallback string) string {
	if val := getEnvVar(key); val != "" {
		return val
	}
	return fallback
}
