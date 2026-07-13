import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CPaaSClient } from '@solo3li/backend-node';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize CPaaS Client with API Key
// In production, this comes from environment variables
const cpaasApiKey = process.env.CPAAS_API_KEY || 'sk_test_123';
const cpaasBaseUrl = process.env.CPAAS_BASE_URL || 'http://host.docker.internal:5000';

const client = new CPaaSClient({
    apiKey: cpaasApiKey,
    baseUrl: cpaasBaseUrl
});

app.post('/api/get-voice-token', async (req, res) => {
    try {
        console.log('Generating voice token via CPaaS...');
        // Request a token for an agent
        const result = await client.createConnectionToken({
            agentId: 'demo-agent-123',
            participantName: req.body.participantName || 'Guest User',
            metadata: {
                context: 'SaaS Demo Application'
            }
        });
        
        console.log('Token generated successfully!');
        res.json(result);
    } catch (error: any) {
        console.error('Failed to generate token:', error?.message || error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Customer Backend is running on port ${port}`);
    console.log(`🔑 Connected to CPaaS at: ${cpaasBaseUrl}`);
});
