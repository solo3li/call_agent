package main

import (
	"log"

	"gopkg.in/hraban/opus.v2"
)

type AudioBridge struct {
	decoder *opus.Decoder
	encoder *opus.Encoder
	PCMOut  chan []int16 // Audio coming from User, going to AI
	PCMIn   chan []int16 // Audio coming from AI, going to User
}

func NewAudioBridge() *AudioBridge {
	// Standard WebRTC Opus is 48kHz Mono
	dec, err := opus.NewDecoder(48000, 1)
	if err != nil {
		log.Fatalf("Failed to create Opus Decoder: %v", err)
	}

	enc, err := opus.NewEncoder(48000, 1, opus.AppVoIP)
	if err != nil {
		log.Fatalf("Failed to create Opus Encoder: %v", err)
	}

	return &AudioBridge{
		decoder: dec,
		encoder: enc,
		PCMOut:  make(chan []int16, 500),
		PCMIn:   make(chan []int16, 500),
	}
}

func (b *AudioBridge) DecodeIncomingRTP(payload []byte) {
	pcm := make([]int16, 1920) // Max 20ms frame at 48kHz
	n, err := b.decoder.Decode(payload, pcm)
	if err != nil {
		log.Printf("Opus decode error: %v", err)
		return
	}
	// Send to AI channel
	select {
	case b.PCMOut <- pcm[:n]:
	default:
		// Drop frame if channel is full
	}
}

func (b *AudioBridge) EncodeOutgoingPCM(pcm []int16) []byte {
	out := make([]byte, 1000)
	n, err := b.encoder.Encode(pcm, out)
	if err != nil {
		log.Printf("Opus encode error: %v", err)
		return nil
	}
	return out[:n]
}
