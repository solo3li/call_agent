package main

import (
	"log"
	"time"

	lksdk "github.com/livekit/server-sdk-go"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

func ConnectToLiveKit(url, apiKey, apiSecret, roomName string, bridge *AudioBridge) *lksdk.Room {
	outTrack, err := lksdk.NewLocalSampleTrack(webrtc.RTPCodecCapability{
		MimeType:  webrtc.MimeTypeOpus,
		ClockRate: 48000,
		Channels:  1,
	})
	if err != nil {
		log.Fatalf("Could not create local track: %v", err)
	}

	room, err := lksdk.ConnectToRoom(url, lksdk.ConnectInfo{
		APIKey:              apiKey,
		APISecret:           apiSecret,
		RoomName:            roomName,
		ParticipantIdentity: "ai-agent",
	}, &lksdk.RoomCallback{
		ParticipantCallback: lksdk.ParticipantCallback{
			OnTrackSubscribed: func(track *webrtc.TrackRemote, publication *lksdk.RemoteTrackPublication, rp *lksdk.RemoteParticipant) {
				log.Printf("Track subscribed: %s", track.ID())
				if track.Kind() == webrtc.RTPCodecTypeAudio {
					go func() {
						for {
							rtpPacket, _, err := track.ReadRTP()
							if err != nil {
								log.Printf("Error reading RTP: %v", err)
								break
							}
							bridge.DecodeIncomingRTP(rtpPacket.Payload)
						}
					}()
				}
			},
		},
	})

	if err != nil {
		log.Fatalf("could not connect to LiveKit: %v", err)
	}

	log.Println("Connected to LiveKit room!")

	_, err = room.LocalParticipant.PublishTrack(outTrack, &lksdk.TrackPublicationOptions{
		Name: "ai-response",
	})
	if err != nil {
		log.Fatalf("Could not publish local track: %v", err)
	}

	go func() {
		for pcm := range bridge.PCMIn {
			encodedBytes := bridge.EncodeOutgoingPCM(pcm)
			if encodedBytes != nil {
				err = outTrack.WriteSample(media.Sample{
					Data:     encodedBytes,
					Duration: 20 * time.Millisecond,
				}, nil)
				if err != nil {
					log.Printf("Error writing sample: %v", err)
				}
			}
		}
	}()

	return room
}
