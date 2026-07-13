import { useState, useCallback, useEffect } from 'react';
import { Room, RoomEvent } from 'livekit-client';
export function useAiAgent({ wsUrl, token, autoConnect = false }) {
    const [room, setRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const connect = useCallback(async () => {
        const newRoom = new Room();
        newRoom.on(RoomEvent.Connected, () => setIsConnected(true));
        newRoom.on(RoomEvent.Disconnected, () => setIsConnected(false));
        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            // Check if AI agent is speaking
            setIsAgentSpeaking(speakers.some(s => !s.isLocal));
        });
        await newRoom.connect(wsUrl, token);
        // Automatically publish microphone
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        setRoom(newRoom);
    }, [wsUrl, token]);
    const disconnect = useCallback(() => {
        if (room) {
            room.disconnect();
            setRoom(null);
        }
    }, [room]);
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);
    return {
        isConnected,
        isAgentSpeaking,
        connect,
        disconnect,
        room
    };
}
