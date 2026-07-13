export interface OmniAgentOptions {
    token: string;
    livekitUrl: string;
    onAgentConnected?: () => void;
    onAgentDisconnected?: () => void;
    onAgentSpeaking?: (isSpeaking: boolean) => void;
}
export declare const useOmniAgent: (options: OmniAgentOptions) => {
    isConnected: boolean;
    isAgentSpeaking: boolean;
    disconnect: () => void;
};
