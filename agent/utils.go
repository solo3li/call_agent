package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// notifyBackend sends a JSON payload to the ASP.NET backend
func notifyBackend(url string, payload map[string]interface{}) string {
	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Backend notify: marshal error: %v", err)
		return "error"
	}

	req, err := http.NewRequestWithContext(context.Background(), "POST", url, bytes.NewReader(data))
	if err != nil {
		log.Printf("Backend notify: request error: %v", err)
		return "error"
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Key", os.Getenv("INTERNAL_API_KEY"))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Backend notify: send error: %v", err)
		return "error"
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return "success"
	}
	return fmt.Sprintf("error:http_%d", resp.StatusCode)
}

// executeWebhookAction calls the backend which then proxies to the tenant's webhook
func executeWebhookAction(backendURL, tenantID, action string, params map[string]interface{}) string {
	payload := map[string]interface{}{
		"tenantId": tenantID,
		"action":   action,
		"params":   params,
	}

	result := notifyBackend(backendURL+"/api/internal/webhook-action", payload)
	log.Printf("Webhook action '%s' for tenant %s: %s", action, tenantID, result)
	return result
}

// getEnvVar gets an environment variable (helper used by multiple files)
func getEnvVar(key string) string {
	return os.Getenv(key)
}
