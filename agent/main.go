package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("CPaaS AI Agent Service Starting...")

	lkUrl := os.Getenv("LIVEKIT_URL")
	lkKey := os.Getenv("LIVEKIT_API_KEY")
	lkSecret := os.Getenv("LIVEKIT_API_SECRET")
	aiProvider := os.Getenv("AI_PROVIDER") // "gemini" or "alibaba"
	aiKey := os.Getenv("AI_API_KEY")

	if lkUrl != "" && aiKey != "" {
		bridge := NewAudioBridge()

		if aiProvider == "alibaba" {
			aliConn := ConnectToAlibabaOmni(aiKey, bridge)
			if aliConn != nil {
				defer aliConn.Close()
			}
		} else {
			geminiConn := ConnectToGeminiLive(aiKey, bridge)
			if geminiConn != nil {
				defer geminiConn.Close()
			}
		}

		room := ConnectToLiveKit(lkUrl, lkKey, lkSecret, "test-room", bridge)
		defer room.Disconnect()

		// Block forever
		select {}
	} else {
		fmt.Println("Missing Environment Variables. Required: LIVEKIT_URL, AI_API_KEY")
	}
}
