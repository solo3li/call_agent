import { useState } from 'react';
import { useOmniAgent } from '@solo3li/client-react';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      // Calls the customer backend (which we built in demo-app/backend)
      const response = await fetch('http://localhost:4000/api/get-voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName: 'Ahmed (Demo)' })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get token');

      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Voice AI CPaaS Demo</h1>
      <p>This is a simulated SaaS application using your SDKs.</p>

      {!token ? (
        <button onClick={fetchToken} disabled={isConnecting} className="start-btn">
          {isConnecting ? 'Connecting to AI...' : 'Start Voice AI Call'}
        </button>
      ) : (
        <CallScreen 
          token={token} 
          livekitUrl={livekitUrl!} 
          onEnd={() => setToken(null)} 
        />
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

function CallScreen({ token, livekitUrl, onEnd }: { token: string, livekitUrl: string, onEnd: () => void }) {
  const { isConnected, isAgentSpeaking, disconnect } = useOmniAgent({
    token,
    livekitUrl
  });

  return (
    <div className="call-screen">
      <div className="status-badge">
        {isConnected ? '🟢 Connected to LiveKit' : '🟡 Establishing connection...'}
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

export default App;
