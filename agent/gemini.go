package main

import (
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

func ConnectToGeminiLive(apiKey string) *websocket.Conn {
	u := url.URL{Scheme: "wss", Host: "generativelanguage.googleapis.com", Path: "/v1alpha/models/gemini-1.5-flash:streamGenerateContent"}
	q := u.Query()
	q.Set("key", apiKey)
	u.RawQuery = q.Encode()

	log.Printf("Connecting to Gemini Live API...")
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatalf("dial error to Gemini: %v", err)
	}

	log.Println("Connected to Gemini WebSockets!")
	return c
}
