import { useState } from 'react';
import { useOmniAgent, useHumanAgent } from '@solo3li/client-react';
import './App.css';

function App() {
  const [view, setView] = useState<'customer' | 'agent'>('customer');

  return (
    <div className="app-container">
      <h1>Voice AI CPaaS Demo</h1>
      <p>This is a simulated SaaS application using your SDKs.</p>

      <div className="view-switcher">
        <button 
          className={view === 'customer' ? 'active' : ''} 
          onClick={() => setView('customer')}
        >
          Customer Interface
        </button>
        <button 
          className={view === 'agent' ? 'active' : ''} 
          onClick={() => setView('agent')}
        >
          Human Agent Dashboard
        </button>
      </div>

      <hr />

      {view === 'customer' ? <CustomerView /> : <AgentDashboard />}
    </div>
  );
}

function CustomerView() {
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const response = await fetch('http://178.62.192.74:4000/api/get-voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName: 'Ahmed (Demo)' })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get token');

      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
      setRoomId(data.roomId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <h2>📞 Customer View</h2>
      {!token ? (
        <button onClick={fetchToken} disabled={isConnecting} className="start-btn">
          {isConnecting ? 'Connecting to AI...' : 'Start Voice AI Call'}
        </button>
      ) : (
        <CallScreen 
          token={token} 
          livekitUrl={livekitUrl!} 
          roomId={roomId!}
          onEnd={() => setToken(null)} 
        />
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function CallScreen({ token, livekitUrl, roomId, onEnd }: { token: string, livekitUrl: string, roomId: string, onEnd: () => void }) {
  const { isConnected, isAgentSpeaking, disconnect } = useOmniAgent({
    token,
    livekitUrl
  });

  return (
    <div className="call-screen">
      <div className="status-badge">
        {isConnected ? '🟢 Connected to LiveKit' : '🟡 Establishing connection...'}
      </div>
      
      <div className="room-info" style={{ marginTop: '10px', padding: '10px', background: '#eee', borderRadius: '5px', fontSize: '12px' }}>
        <strong>Room ID (Copy for Agent Transfer):</strong> {roomId}
      </div>

      {isConnected && (
        <div className={`agent-avatar ${isAgentSpeaking ? 'speaking' : ''}`}>
          <div className="avatar-circle">🤖</div>
          <p>{isAgentSpeaking ? 'Agent is speaking...' : 'Agent is listening...'}</p>
        </div>
      )}

      {isConnected && (
        <button 
          onClick={() => {
            disconnect();
            onEnd();
          }} 
          className="end-btn"
        >
          End Call
        </button>
      )}
    </div>
  );
}

function AgentDashboard() {
  const [roomId, setRoomId] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = async () => {
    if (!roomId) return;
    try {
      setIsConnecting(true);
      setError(null);
      const response = await fetch('http://178.62.192.74:4000/api/get-transfer-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, agentName: 'Support Agent' })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get transfer token');

      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  if (token && livekitUrl) {
    return <HumanCallScreen token={token} livekitUrl={livekitUrl} onEnd={() => setToken(null)} />;
  }

  return (
    <div>
      <h2>👨‍💻 Human Agent Dashboard</h2>
      <p>Enter the Room ID to join an active call (e.g. after AI Handover):</p>
      <input 
        type="text" 
        value={roomId} 
        onChange={(e) => setRoomId(e.target.value)} 
        placeholder="Enter Room ID"
        style={{ padding: '8px', width: '250px', marginRight: '10px' }}
      />
      <button onClick={joinRoom} disabled={isConnecting || !roomId} className="start-btn">
        {isConnecting ? 'Joining...' : 'Join Call'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function HumanCallScreen({ token, livekitUrl, onEnd }: { token: string, livekitUrl: string, onEnd: () => void }) {
  const { isConnected, isCustomerSpeaking, disconnect } = useHumanAgent({
    token,
    livekitUrl
  });

  return (
    <div className="call-screen">
      <div className="status-badge">
        {isConnected ? '🟢 Joined as Human Agent' : '🟡 Connecting...'}
      </div>

      {isConnected && (
        <div className={`agent-avatar ${isCustomerSpeaking ? 'speaking' : ''}`}>
          <div className="avatar-circle">👤</div>
          <p>{isCustomerSpeaking ? 'Customer is speaking...' : 'Customer is quiet...'}</p>
        </div>
      )}

      {isConnected && (
        <button 
          onClick={() => {
            disconnect();
            onEnd();
          }} 
          className="end-btn"
        >
          Leave Room
        </button>
      )}
    </div>
  );
}

export default App;
