# @solo3li/backend-node

The official Node.js Server SDK for the **Voice AI CPaaS**. 
This library allows SaaS backends to securely authenticate with the CPaaS API and generate short-lived LiveKit access tokens for their front-end users.

## Installation

```bash
npm install @solo3li/backend-node
```

## Usage

**Security Warning:** This SDK must **ONLY** be used on your secure backend server. Never expose your `apiKey` in a client-side application (React, Angular, iOS, etc.).

### 1. Initialize the Client

```typescript
import { CPaaSClient } from '@solo3li/backend-node';

// Initialize the client with your secret API Key from the Dashboard
const cpaas = new CPaaSClient({
    apiKey: 'sk_1234567890abcdef...', // Your Secret API Key
    baseUrl: 'https://api.yourcpaas.com' // Optional: Custom CPaaS URL
});
```

### 2. Generate a Connection Token

When a user on your frontend clicks "Call AI", your frontend should make a REST request to your backend. Your backend then uses this SDK to generate a secure token.

```typescript
import express from 'express';
const app = express();

app.post('/api/get-voice-token', async (req, res) => {
    try {
        // Generate a token for the AI Agent
        const connection = await cpaas.createConnectionToken({
            agentId: '550e8400-e29b-41d4-a716-446655440000', // The ID of the Agent from your Dashboard
            participantName: 'Ahmed (Premium User)',        // Name of the end-user
            metadata: {
                'StoreName': 'Noon E-commerce',             // Dynamic context to inject into the AI's prompt
                'Language': 'Arabic'
            }
        });

        // Send the token and URL back to your Frontend (React/iOS)
        res.json({
            token: connection.token,
            livekitUrl: connection.livekitUrl
        });

    } catch (error) {
        console.error('Failed to generate CPaaS token:', error);
        res.status(500).json({ error: 'Failed to connect to AI' });
    }
});
```

## Response Object

The `createConnectionToken` method returns an object containing:
- `token`: A secure JWT access token valid for this specific session.
- `roomName`: The unique ID of the generated voice room.
- `livekitUrl`: The WebSocket URL that the Client SDK should connect to.

## License
MIT
