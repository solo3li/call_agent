"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CPaaSClient = void 0;
const axios_1 = __importDefault(require("axios"));
class CPaaSClient {
    client;
    constructor(config) {
        this.client = axios_1.default.create({
            baseURL: config.baseUrl || 'https://api.yourcpaas.com',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }
    async createConnectionToken(request) {
        try {
            const response = await this.client.post('/api/Connection/token', {
                agentId: request.agentId,
                participantName: request.participantName || 'user',
                metadata: request.metadata || {}
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new Error(`CPaaS API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}
exports.CPaaSClient = CPaaSClient;
