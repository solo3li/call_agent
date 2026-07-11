package main

import (
	"log"

	lksdk "github.com/livekit/server-sdk-go"
)

func ConnectToLiveKit(url, apiKey, apiSecret, roomName string) *lksdk.Room {
	room, err := lksdk.ConnectToRoom(url, lksdk.ConnectInfo{
		APIKey:              apiKey,
		APISecret:           apiSecret,
		RoomName:            roomName,
		ParticipantIdentity: "ai-agent",
	}, &lksdk.RoomCallback{
		ParticipantCallback: lksdk.ParticipantCallback{
			OnTrackSubscribed: func(track *lksdk.RemoteTrack, publication *lksdk.RemoteTrackPublication, rp *lksdk.RemoteParticipant) {
				log.Printf("Track subscribed: %s", track.SID())
				// Here we would route the audio track to Gemini API
			},
		},
	})

	if err != nil {
		log.Fatalf("could not connect to LiveKit: %v", err)
	}

	log.Println("Connected to LiveKit room!")
	return room
}
