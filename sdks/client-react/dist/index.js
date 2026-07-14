import { useEffect, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
export const useOmniAgent = (options) => {
    const [room, setRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    useEffect(() => {
        if (!options.token || !options.livekitUrl)
            return;
        const newRoom = new Room({
            adaptiveStream: true,
            dynacast: true,
        });
        newRoom.on(RoomEvent.Connected, () => {
            setIsConnected(true);
            options.onAgentConnected?.();
        });
        newRoom.on(RoomEvent.Disconnected, () => {
            setIsConnected(false);
            options.onAgentDisconnected?.();
        });
        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            const agentSpeaking = speakers.some(s => s.identity === 'ai-agent');
            setIsAgentSpeaking(agentSpeaking);
            options.onAgentSpeaking?.(agentSpeaking);
        });
        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === Track.Kind.Audio) {
                const element = track.attach();
                document.body.appendChild(element);
            }
        });
        const connect = async () => {
            try {
                await newRoom.connect(options.livekitUrl, options.token);
                // Publish microphone
                await newRoom.localParticipant.enableCameraAndMicrophone();
                setRoom(newRoom);
            }
            catch (error) {
                console.error('Failed to connect to OmniAgent:', error);
            }
        };
        connect();
        return () => {
            newRoom.disconnect();
        };
    }, [options.token, options.livekitUrl]);
    const disconnect = () => {
        if (room) {
            room.disconnect();
            setRoom(null);
            setIsConnected(false);
        }
    };
    return {
        isConnected,
        isAgentSpeaking,
        disconnect
    };
};
export const useHumanAgent = (options) => {
    const [room, setRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);
    useEffect(() => {
        if (!options.token || !options.livekitUrl)
            return;
        const newRoom = new Room({
            adaptiveStream: true,
            dynacast: true,
        });
        newRoom.on(RoomEvent.Connected, () => {
            setIsConnected(true);
        });
        newRoom.on(RoomEvent.Disconnected, () => {
            setIsConnected(false);
        });
        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            // Anyone who is not the local participant is assumed to be the customer
            const customerSpeaking = speakers.some(s => s.identity !== newRoom.localParticipant.identity);
            setIsCustomerSpeaking(customerSpeaking);
        });
        newRoom.on(RoomEvent.TrackSubscribed, (track) => {
            if (track.kind === Track.Kind.Audio) {
                const element = track.attach();
                document.body.appendChild(element);
            }
        });
        const connect = async () => {
            try {
                await newRoom.connect(options.livekitUrl, options.token);
                await newRoom.localParticipant.enableCameraAndMicrophone();
                setRoom(newRoom);
            }
            catch (error) {
                console.error('Failed to connect Human Agent:', error);
            }
        };
        connect();
        return () => {
            newRoom.disconnect();
        };
    }, [options.token, options.livekitUrl]);
    const disconnect = () => {
        if (room) {
            room.disconnect();
            setRoom(null);
            setIsConnected(false);
        }
    };
    return {
        isConnected,
        isCustomerSpeaking,
        disconnect
    };
};
