package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// ===========================================================
// FreeSWITCH ESL (Event Socket Layer) Client
// Allows the Go Agent to:
//   1. Receive call events from FreeSWITCH
//   2. Execute commands: transfer, hangup, playback
// ===========================================================

// ESLClient represents a connection to FreeSWITCH ESL
type ESLClient struct {
	conn     net.Conn
	mu       sync.Mutex
	password string
	host     string
}

// ESLEvent represents a parsed FreeSWITCH event
type ESLEvent struct {
	EventName   string
	UniqueID    string
	ChannelVars map[string]string
	RawBody     string
}

// NewESLClient creates and authenticates an ESL connection
func NewESLClient(host, password string) (*ESLClient, error) {
	conn, err := net.DialTimeout("tcp", host, 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("ESL: failed to connect to FreeSWITCH at %s: %w", host, err)
	}

	client := &ESLClient{
		conn:     conn,
		password: password,
		host:     host,
	}

	// Read auth/request prompt
	resp := client.readResponse()
	if !strings.Contains(resp, "auth/request") {
		conn.Close()
		return nil, fmt.Errorf("ESL: unexpected greeting: %s", resp)
	}

	// Authenticate
	client.send("auth " + password + "\n\n")
	resp = client.readResponse()
	if !strings.Contains(resp, "Reply-Text: +OK") {
		conn.Close()
		return nil, fmt.Errorf("ESL: authentication failed: %s", resp)
	}

	// Subscribe to events
	client.send("event plain CHANNEL_HANGUP_COMPLETE CUSTOM\n\n")
	client.readResponse()

	log.Printf("ESL: Connected and authenticated to FreeSWITCH at %s", host)
	return client, nil
}

func (e *ESLClient) send(cmd string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.conn.Write([]byte(cmd))
}

func (e *ESLClient) readResponse() string {
	buf := make([]byte, 4096)
	n, _ := e.conn.Read(buf)
	return string(buf[:n])
}

// ExecuteAPI executes a FreeSWITCH API command
func (e *ESLClient) ExecuteAPI(cmd string) string {
	e.send(fmt.Sprintf("api %s\n\n", cmd))
	return e.readResponse()
}

// TransferCall transfers a call to a new destination
func (e *ESLClient) TransferCall(uuid, destination, context, dialplan string) error {
	cmd := fmt.Sprintf("uuid_transfer %s %s %s %s", uuid, destination, context, dialplan)
	resp := e.ExecuteAPI(cmd)
	if strings.Contains(resp, "-ERR") {
		return fmt.Errorf("ESL: transfer failed: %s", resp)
	}
	log.Printf("ESL: Call %s transferred to %s", uuid, destination)
	return nil
}

// HangupCall terminates a call
func (e *ESLClient) HangupCall(uuid, cause string) error {
	cmd := fmt.Sprintf("uuid_kill %s %s", uuid, cause)
	resp := e.ExecuteAPI(cmd)
	if strings.Contains(resp, "-ERR") {
		return fmt.Errorf("ESL: hangup failed: %s", resp)
	}
	log.Printf("ESL: Call %s hung up with cause: %s", uuid, cause)
	return nil
}

// PlaySound plays an audio file on a call
func (e *ESLClient) PlaySound(uuid, soundFile string) error {
	cmd := fmt.Sprintf("uuid_broadcast %s %s both", uuid, soundFile)
	e.ExecuteAPI(cmd)
	return nil
}

// Close closes the ESL connection
func (e *ESLClient) Close() {
	if e.conn != nil {
		e.conn.Close()
	}
}

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
	if err != nil {
		log.Printf("CDR: Failed to send CDR: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("CDR: Reported for call %s (status: %d)", cdr.FreeSwitchUUID, resp.StatusCode)
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
	ESLClient      *ESLClient
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

// HandleHumanTransfer initiates a transfer to a human agent via FreeSWITCH ESL
func (s *CallSession) HandleHumanTransfer(sipURI string) {
	if s.ESLClient == nil || s.FreeSwitchUUID == "" {
		log.Printf("Session %s: Cannot transfer — no ESL connection or UUID", s.RoomName)
		return
	}

	s.TransferredTo = sipURI
	log.Printf("Session %s: Initiating human transfer to %s", s.RoomName, sipURI)

	// Use FreeSWITCH ESL to transfer the call
	// Format: transfer-human-<sipURI> routes to the human_transfer extension in dialplan
	destination := fmt.Sprintf("transfer-human-%s", sipURI)
	if err := s.ESLClient.TransferCall(s.FreeSwitchUUID, destination, "cpaas_inbound", "XML"); err != nil {
		log.Printf("Session %s: ESL transfer failed: %v", s.RoomName, err)
	}
}

// Report generates and sends a CDR record to the backend
func (s *CallSession) Report(backendURL string) {
	endTime := time.Now()
	duration := int(endTime.Sub(s.StartTime).Seconds())

	cdr := CDRReport{
		FreeSwitchUUID: s.FreeSwitchUUID,
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
