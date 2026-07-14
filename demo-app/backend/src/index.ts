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
const cpaasBaseUrl = process.env.CPAAS_BASE_URL || 'http://localhost:5246';

const client = new CPaaSClient({
    apiKey: cpaasApiKey,
    baseUrl: cpaasBaseUrl
});

app.post('/api/get-voice-token', async (req, res) => {
    try {
        console.log('Generating voice token via CPaaS...');
        // Request a token for an agent
        const result = await client.createConnectionToken({
            agentId: '00000000-0000-0000-0000-000000000001',
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

app.post('/api/get-transfer-token', async (req, res) => {
    try {
        const { roomId, agentName } = req.body;
        if (!roomId) {
            return res.status(400).json({ error: 'roomId is required' });
        }
        
        console.log(`Generating transfer token for room ${roomId}...`);
        const result = await client.createTransferToken(roomId, agentName || 'Human Agent');
        
        console.log('Transfer Token generated successfully!');
        res.json(result);
    } catch (error: any) {
        console.error('Failed to generate transfer token:', error?.message || error);
        res.status(500).json({ error: 'Failed to generate transfer token' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Customer Backend is running on port ${port}`);
    console.log(`🔑 Connected to CPaaS at: ${cpaasBaseUrl}`);
});
