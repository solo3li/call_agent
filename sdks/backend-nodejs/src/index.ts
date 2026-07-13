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
}
