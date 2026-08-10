package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// ===========================================================
// CDR Reporter — Sends call records to ASP.NET backend
// ===========================================================

type CDRReport struct {
	FreeSwitchUUID string    `json:"freeSwitchUUID"`
	RoomName       string    `json:"roomName"`
	TenantID       string    `json:"tenantId"`
	AgentID        string    `json:"agentId"`
	CallerNumber   string    `json:"callerNumber"`
	StartTime      time.Time `json:"startTime"`
	EndTime        time.Time `json:"endTime"`
	DurationSecs   int       `json:"durationSecs"`
	HangupCause    string    `json:"hangupCause"`
	TransferredTo  string    `json:"transferredTo,omitempty"`
	Sentiment      string    `json:"sentiment,omitempty"`
}

func ReportCDR(backendURL string, cdr CDRReport) {
	data, err := json.Marshal(cdr)
	if err != nil {
		log.Printf("CDR: Failed to marshal CDR: %v", err)
		return
	}

	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		req, err := http.NewRequestWithContext(
			context.Background(),
			"POST",
			backendURL+"/api/internal/cdr",
			bytes.NewReader(data),
		)
		if err != nil {
			log.Printf("CDR: Failed to create request: %v", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Internal-Key", os.Getenv("INTERNAL_API_KEY"))

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				log.Printf("CDR: Reported for call %s (status: %d)", cdr.FreeSwitchUUID, resp.StatusCode)
				return
			}
			log.Printf("CDR: Report failed with status %d (Attempt %d/%d)", resp.StatusCode, i+1, maxRetries)
		} else {
			log.Printf("CDR: Failed to send CDR: %v (Attempt %d/%d)", err, i+1, maxRetries)
		}

		if i < maxRetries-1 {
			time.Sleep(time.Duration(1<<i) * time.Second)
			// Reset reader for next attempt
			data, _ = json.Marshal(cdr)
		}
	}
	log.Printf("CDR: Exhausted all retries for call %s. Data lost.", cdr.FreeSwitchUUID)
}

// ===========================================================
// Session represents one complete call session
// ===========================================================

type CallSession struct {
	RoomName       string
	FreeSwitchUUID string
	TenantID       string
	AgentID        string
	CallerNumber   string
	Provider       string
	SystemPrompt   string
	StartTime      time.Time
	TransferredTo  string
	Sentiment      string
	Disconnect     func()
}

func NewCallSession(req JoinRequest) *CallSession {
	return &CallSession{
		RoomName:       req.RoomName,
		FreeSwitchUUID: req.Metadata["freeswitch_uuid"],
		TenantID:       req.Metadata["tenant_id"],
		AgentID:        req.Metadata["agent_id"],
		CallerNumber:   req.Metadata["caller_number"],
		Provider:       req.AIProvider,
		SystemPrompt:   req.SystemPrompt,
		StartTime:      time.Now(),
	}
}

// HandleHumanTransfer initiates a transfer to a human agent
func (s *CallSession) HandleHumanTransfer(sipURI string) {
	s.TransferredTo = sipURI
	log.Printf("Session %s: SIP Transfer to %s requested, but PBX routing is removed. Assuming SIP handoff or graceful closure via LiveKit.", s.RoomName, sipURI)
    // Note: LiveKit SIP 1.5 allows transferring by bridging, but here we simply end or log it as unsupported without FreeSWITCH PBX.
    if s.Disconnect != nil {
        log.Printf("Session %s: Disconnecting LiveKit room to end session.", s.RoomName)
        s.Disconnect()
    }
}

// Report generates and sends a CDR record to the backend
func (s *CallSession) Report(backendURL string) {
	endTime := time.Now()
	duration := int(endTime.Sub(s.StartTime).Seconds())

	cdr := CDRReport{
		FreeSwitchUUID: s.FreeSwitchUUID, // Still kept in DTOs, may be empty or populated by LiveKit SIP metadata
		RoomName:       s.RoomName,
		TenantID:       s.TenantID,
		AgentID:        s.AgentID,
		CallerNumber:   s.CallerNumber,
		StartTime:      s.StartTime,
		EndTime:        endTime,
		DurationSecs:   duration,
		HangupCause:    "NORMAL_CLEARING",
		TransferredTo:  s.TransferredTo,
		Sentiment:      s.Sentiment,
	}

	go ReportCDR(backendURL, cdr)
}
