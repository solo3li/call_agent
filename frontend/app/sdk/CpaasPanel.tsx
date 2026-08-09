"use client";

import React, { useState } from 'react';
import { Phone, Close, Chat } from '@carbon/icons-react';
import './cpaas-theme.css'; // Will be created

interface CpaasPanelProps {
  apiKey: string;
  theme?: Record<string, string>;
  mode?: 'floating' | 'embedded' | 'fullpage' | 'agent';
  agentExtension?: string;
}

export const CpaasPanel: React.FC<CpaasPanelProps> = ({ apiKey, theme = {}, mode = 'floating', agentExtension }) => {
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

  const renderPanel = () => {
    if (mode === 'agent') {
      return (
        <div className="cpaas-panel cpaas-embedded-panel" style={style}>
          <div className="cpaas-header bg-red-600">
            <h3>Agent Workspace - Ext {agentExtension || '101'}</h3>
          </div>
          <div className="cpaas-body justify-start">
            <div className="p-4 bg-gray-100 rounded mb-4">
              <h4 className="font-bold text-lg mb-2">📞 Incoming Call</h4>
              <p><strong>Caller:</strong> +20 100 123 4567</p>
              <p><strong>Sentiment:</strong> 😤 Angry</p>
            </div>
            <div className="p-4 border border-gray-200 rounded flex-1 overflow-y-auto mb-4 text-sm text-left">
              <h4 className="font-bold mb-2">AI Conversation Summary:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Caller asked about order status for #456</li>
                <li>AI confirmed order was shipped</li>
                <li>Caller requested to speak with a human manager for compensation</li>
              </ul>
            </div>
            <div className="flex gap-2 mt-auto">
              <button className="cpaas-btn cpaas-btn-primary flex-1" style={{ backgroundColor: 'var(--cpaas-success, #24a148)' }}>Accept</button>
              <button className="cpaas-btn cpaas-btn-danger flex-1">Reject</button>
            </div>
          </div>
        </div>
      );
    }

    return (
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
  };

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
