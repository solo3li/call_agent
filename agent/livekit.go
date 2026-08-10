package main

import (
	"context"
	"log"
	"time"
	"fmt"

	lksdk "github.com/livekit/server-sdk-go"
	"github.com/livekit/protocol/livekit"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

func ConnectToLiveKit(url, apiKey, apiSecret, roomName string, bridge *AudioBridge) (*lksdk.Room, <-chan struct{}) {
	done := make(chan struct{})

	outTrack, err := lksdk.NewLocalSampleTrack(webrtc.RTPCodecCapability{
		MimeType:  webrtc.MimeTypeOpus,
		ClockRate: 48000,
		Channels:  1,
	})
	if err != nil {
		log.Fatalf("Could not create local track: %v", err)
	}

	var room *lksdk.Room

	room, err = lksdk.ConnectToRoom(url, lksdk.ConnectInfo{
		APIKey:              apiKey,
		APISecret:           apiSecret,
		RoomName:            roomName,
		ParticipantIdentity: "ai-agent",
	}, &lksdk.RoomCallback{
		OnDisconnected: func() {
			log.Printf("LiveKit Room %s disconnected", roomName)
			close(done)
		},
		OnParticipantDisconnected: func(rp *lksdk.RemoteParticipant) {
			log.Printf("User participant %s left. Disconnecting AI...", rp.Identity())
			if room != nil {
				room.Disconnect()
			}
		},
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
		log.Printf("Could not connect to LiveKit: %v", err)
		return nil, nil
	}

	log.Printf("AI Agent successfully joined LiveKit room: %s", roomName)

	// Start Egress Recording
	go func() {
		egressClient := lksdk.NewEgressClient(url, apiKey, apiSecret)
		req := &livekit.RoomCompositeEgressRequest{
			RoomName: roomName,
			FileOutputs: []*livekit.EncodedFileOutput{
				{
					FileType: livekit.EncodedFileType_MP4,
					Filepath: fmt.Sprintf("recordings/%s.mp4", roomName),
				},
			},
		}
		info, err := egressClient.StartRoomCompositeEgress(context.Background(), req)
		if err != nil {
			log.Printf("Failed to start LiveKit Egress for room %s: %v", roomName, err)
		} else {
			log.Printf("Started LiveKit Egress recording: %s", info.EgressId)
		}
	}()

	_, err = room.LocalParticipant.PublishTrack(outTrack, &lksdk.TrackPublicationOptions{
		Name: "ai-response",
	})
	if err != nil {
		log.Printf("Could not publish local track: %v", err)
	}

	go func() {
		for {
			select {
			case <-done:
				return
			case pcm, ok := <-bridge.PCMIn:
				if !ok {
					return
				}
				packets := bridge.EncodeOutgoingPCM(pcm)
				for _, pkt := range packets {
					err = outTrack.WriteSample(media.Sample{
						Data:     pkt,
						Duration: 20 * time.Millisecond,
					}, nil)
					if err != nil {
						log.Printf("Error writing sample: %v", err)
					}
				}
			}
		}
	}()

	return room, done
}
