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
export declare class CPaaSClient {
    private client;
    constructor(config: CPaaSConfig);
    createConnectionToken(request: CreateTokenRequest): Promise<CreateTokenResponse>;
}
