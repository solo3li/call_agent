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
	geminiKey := os.Getenv("GEMINI_API_KEY")

	if lkUrl != "" && geminiKey != "" {
		// Initialize connections
		geminiConn := ConnectToGeminiLive(geminiKey)
		defer geminiConn.Close()

		room := ConnectToLiveKit(lkUrl, lkKey, lkSecret, "test-room")
		defer room.Disconnect()

		// Block forever
		select {}
	} else {
		fmt.Println("Missing Environment Variables. Skipping actual connection. Required: LIVEKIT_URL, GEMINI_API_KEY")
	}
}
