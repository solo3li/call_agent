package main

import (
	"encoding/json"
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

func ConnectToAlibabaOmni(apiKey string, bridge *AudioBridge) *websocket.Conn {
	u := url.URL{Scheme: "wss", Host: "dashscope.aliyuncs.com", Path: "/api-ws/v1/inference/audio"}
	q := u.Query()
	q.Set("api_key", apiKey) 
	u.RawQuery = q.Encode()

	log.Printf("Connecting to Alibaba Omni Live API...")
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Printf("Dial error to Alibaba: %v", err)
		return nil
	}

	log.Println("Connected to Alibaba WebSockets!")

	go func() {
		for pcm := range bridge.PCMOut {
			_ = pcm
			// Placeholder: send PCM to Alibaba (Binary or Base64 JSON)
		}
	}()

	go func() {
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("Alibaba read error:", err)
				break
			}
			var resp map[string]interface{}
			if err := json.Unmarshal(message, &resp); err == nil {
				// Scaffold logic: extract PCM
			}
		}
	}()

	return c
}
