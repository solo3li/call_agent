import { Room } from 'livekit-client';
export interface UseAiAgentOptions {
    wsUrl: string;
    token: string;
    autoConnect?: boolean;
}
export declare function useAiAgent({ wsUrl, token, autoConnect }: UseAiAgentOptions): {
    isConnected: boolean;
    isAgentSpeaking: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    room: Room | null;
};
