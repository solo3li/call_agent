#!/bin/bash

# Start C# Backend
echo "Starting C# Backend..."
cd /root/call_agent/backend
export $(grep -v '^#' /root/call_agent/.env | xargs)
dotnet run > /root/call_agent/backend.log 2>&1 &

# Start Golang Agent
echo "Starting Golang Agent..."
cd /root/call_agent/agent
export LIVEKIT_URL=ws://127.0.0.1:7880
export LIVEKIT_API_KEY=devkey
export LIVEKIT_API_SECRET=secret
export AI_API_KEY=dummy_key_for_test # We'll put a real one if needed, or it connects but fails API calls
./cpaas-agent > /root/call_agent/agent.log 2>&1 &

# Start Node Backend
echo "Starting Node Backend..."
cd /root/call_agent/demo-app/backend
npm start > /root/call_agent/node_backend.log 2>&1 &

# Start React Frontend
echo "Starting React Frontend..."
cd /root/call_agent/demo-app/frontend
npm start > /root/call_agent/react_frontend.log 2>&1 &

echo "All services started in background. Logs are in /root/call_agent/*.log"
