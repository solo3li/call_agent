"use client";

import React, { useState } from 'react';
import { Phone, Close, Chat } from '@carbon/icons-react';
import './cpaas-theme.css'; // Will be created

interface CpaasPanelProps {
  apiKey: string;
  theme?: Record<string, string>;
  mode?: 'floating' | 'embedded' | 'fullpage';
}

export const CpaasPanel: React.FC<CpaasPanelProps> = ({ apiKey, theme = {}, mode = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(mode !== 'floating');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

  // Apply custom theme CSS variables to the wrapper
  const style = {
    ...theme,
  } as React.CSSProperties;

  const toggleOpen = () => setIsOpen(!isOpen);

  const startCall = () => {
    setCallStatus('calling');
    setTimeout(() => setCallStatus('connected'), 2000); // Simulate connection
  };

  const endCall = () => {
    setCallStatus('idle');
  };

  const renderPanel = () => (
    <div className={`cpaas-panel ${mode === 'floating' ? 'cpaas-floating-panel' : 'cpaas-embedded-panel'}`} style={style}>
      <div className="cpaas-header">
        <h3>Support Center</h3>
        {mode === 'floating' && (
          <button className="cpaas-icon-btn" onClick={toggleOpen}>
            <Close size={20} />
          </button>
        )}
      </div>
      
      <div className="cpaas-body">
        {callStatus === 'idle' ? (
          <div className="cpaas-start-screen">
            <p>How can we help you today?</p>
            <button className="cpaas-btn cpaas-btn-primary" onClick={startCall}>
              <Phone size={20} className="mr-2" /> Start Voice Call
            </button>
          </div>
        ) : (
          <div className="cpaas-call-screen">
            <div className={`cpaas-avatar ${callStatus === 'connected' ? 'pulsing' : ''}`}>
              <Chat size={40} color="var(--cpaas-primary)" />
            </div>
            <p>{callStatus === 'calling' ? 'Connecting to Agent...' : 'Connected with AI Agent'}</p>
            <p className="cpaas-timer">00:15</p>
            <button className="cpaas-btn cpaas-btn-danger" onClick={endCall}>
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'floating') {
    return (
      <div className="cpaas-widget-container" style={style}>
        {isOpen && renderPanel()}
        {!isOpen && (
          <button className="cpaas-fab" onClick={toggleOpen}>
            <Phone size={24} color="white" />
          </button>
        )}
      </div>
    );
  }

  return renderPanel();
};
