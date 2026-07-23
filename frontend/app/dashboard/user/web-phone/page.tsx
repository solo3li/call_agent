'use client';

import { Grid, Column, Tile, TextInput, Button } from '@carbon/react';
import { Phone, PhoneOff, Microphone, VolumeMute } from '@carbon/icons-react';
import { useState } from 'react';

export default function WebPhonePage() {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState('Ready to call');
  const [inCall, setInCall] = useState(false);

  const handleDial = (digit: string) => {
    setNumber(prev => prev + digit);
  };

  const handleCall = () => {
    if (!number) return;
    setStatus(`Calling ${number}...`);
    setInCall(true);
    setTimeout(() => {
      setStatus('Connected - 00:01');
    }, 2000);
  };

  const handleHangup = () => {
    setStatus('Call ended');
    setInCall(false);
    setTimeout(() => {
      setStatus('Ready to call');
      setNumber('');
    }, 2000);
  };

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Web Phone</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Make and receive calls directly from your browser.
        </p>
      </Column>
      
      <Column lg={6} md={6} sm={4}>
        <Tile style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#262626', borderRadius: '16px' }}>
          <div style={{ marginBottom: '1rem', color: inCall ? '#24a148' : '#c6c6c6', fontWeight: 600 }}>
            {status}
          </div>
          
          <TextInput 
            id="dialer-input" 
            labelText="" 
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.5rem' }}
            disabled={inCall}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
              <Button 
                key={digit} 
                kind="ghost" 
                onClick={() => handleDial(digit)}
                disabled={inCall}
                style={{ fontSize: '1.5rem', width: '100%', height: '60px', display: 'flex', justifyContent: 'center', backgroundColor: '#393939' }}
              >
                {digit}
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {!inCall ? (
              <Button 
                renderIcon={Phone} 
                kind="primary" 
                onClick={handleCall}
                style={{ backgroundColor: '#24a148', width: '100%', justifyContent: 'center' }}
              >
                Call
              </Button>
            ) : (
              <>
                <Button renderIcon={Microphone} kind="secondary" hasIconOnly iconDescription="Mute" />
                <Button renderIcon={VolumeMute} kind="secondary" hasIconOnly iconDescription="Hold" />
                <Button 
                  renderIcon={PhoneOff} 
                  kind="danger" 
                  onClick={handleHangup}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  End Call
                </Button>
              </>
            )}
          </div>
        </Tile>
      </Column>
    </Grid>
  );
}
