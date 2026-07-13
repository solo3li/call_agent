package main

import (
	"encoding/base64"
	"encoding/json"
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

func ConnectToGeminiLive(apiKey string, systemPrompt string, bridge *AudioBridge) *websocket.Conn {
	u := url.URL{Scheme: "wss", Host: "generativelanguage.googleapis.com", Path: "/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"}
	q := u.Query()
	q.Set("key", apiKey)
	u.RawQuery = q.Encode()

	log.Printf("Connecting to Gemini Live API...")
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Printf("dial error to Gemini: %v", err)
		return nil
	}

	log.Println("Connected to Gemini WebSockets!")

	// Send Setup message with System Prompt
	if systemPrompt != "" {
		setupMsg := map[string]interface{}{
			"setup": map[string]interface{}{
				"model": "models/gemini-2.0-flash-exp",
				"systemInstruction": map[string]interface{}{
					"parts": []map[string]interface{}{
						{"text": systemPrompt},
					},
				},
			},
		}
		if err := c.WriteJSON(setupMsg); err != nil {
			log.Printf("Error sending setup message to Gemini: %v", err)
		} else {
			log.Printf("Sent Setup message with System Prompt length: %d", len(systemPrompt))
		}
	}

	go func() {
		for pcm := range bridge.PCMOut {
			pcmBytes := make([]byte, len(pcm)*2)
			for i, sample := range pcm {
				pcmBytes[i*2] = byte(sample)
				pcmBytes[i*2+1] = byte(sample >> 8)
			}
			b64 := base64.StdEncoding.EncodeToString(pcmBytes)
			msg := map[string]interface{}{
				"realtimeInput": map[string]interface{}{
					"mediaChunks": []map[string]string{
						{"mimeType": "audio/pcm", "data": b64},
					},
				},
			}
			err := c.WriteJSON(msg)
			if err != nil {
				log.Printf("Error sending audio to Gemini: %v", err)
				break
			}
		}
	}()

	go func() {
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("Gemini read error:", err)
				break
			}
			var resp map[string]interface{}
			if err := json.Unmarshal(message, &resp); err == nil {
				// Scaffold logic: parse serverContent -> modelTurn -> parts -> inlineData
			}
		}
	}()

	return c
}
