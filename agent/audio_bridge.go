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
	
	// Downsample from 48kHz to 16kHz (factor of 3)
	downsampled := make([]int16, n/3)
	for i := 0; i < len(downsampled); i++ {
		sum := int32(pcm[i*3]) + int32(pcm[i*3+1]) + int32(pcm[i*3+2])
		downsampled[i] = int16(sum / 3)
	}

	// Send to AI channel
	select {
	case b.PCMOut <- downsampled:
	default:
		// Drop frame if channel is full
	}
}

func (b *AudioBridge) EncodeOutgoingPCM(pcm []int16) []byte {
	// Upsample from 24kHz to 48kHz (factor of 2)
	upsampled := make([]int16, len(pcm)*2)
	for i := 0; i < len(pcm); i++ {
		// Linear interpolation for smoother audio
		upsampled[i*2] = pcm[i]
		if i < len(pcm)-1 {
			upsampled[i*2+1] = int16((int32(pcm[i]) + int32(pcm[i+1])) / 2)
		} else {
			upsampled[i*2+1] = pcm[i]
		}
	}

	out := make([]byte, 1000)
	n, err := b.encoder.Encode(upsampled, out)
	if err != nil {
		log.Printf("Opus encode error: %v", err)
		return nil
	}
	return out[:n]
}
