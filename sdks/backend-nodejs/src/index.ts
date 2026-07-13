import axios, { AxiosInstance } from 'axios';

export interface CPaaSConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface CreateTokenRequest {
    agentId: string;
    participantName?: string;
    metadata?: Record<string, string>;
}

export interface CreateTokenResponse {
    token: string;
    roomName: string;
    livekitUrl: string;
}

export class CPaaSClient {
    private client: AxiosInstance;

    constructor(config: CPaaSConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://api.yourcpaas.com',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    public async createConnectionToken(request: CreateTokenRequest): Promise<CreateTokenResponse> {
        try {
            const response = await this.client.post('/api/Connection/token', {
                agentId: request.agentId,
                participantName: request.participantName || 'user',
                metadata: request.metadata || {}
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`CPaaS API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    public async createTransferToken(roomId: string, agentName: string): Promise<{ token: string, livekitUrl: string }> {
        try {
            const response = await this.client.post('/api/Connection/transfer-token', {
                roomId,
                participantName: agentName
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`CPaaS API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    public async initiateSipTransfer(roomId: string, sipUri: string): Promise<{ success: boolean }> {
        try {
            const response = await this.client.post('/api/Connection/sip-transfer', {
                roomId,
                sipUri
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`CPaaS API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}
