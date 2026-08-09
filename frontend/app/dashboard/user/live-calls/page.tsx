'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Loading,
  Grid,
  Column,
  Tile,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  Modal
} from '@carbon/react';
import { PhoneFilled, StopFilled, MicrophoneFilled, VolumeUpFilled } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LiveKitRoom,
  AudioConference,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function LiveCallsPage() {
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Monitoring State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoredCall, setMonitoredCall] = useState<any>(null);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string | null>(null);
  const [isTakeover, setIsTakeover] = useState(false);

  useEffect(() => {
    // Mock fetching active calls for now until WebRTC/Asterisk is fully integrated
    setTimeout(() => {
      setActiveCalls([
        {
          id: 'call-1',
          roomName: 'room_mock_123',
          agentName: 'Nova - Sales',
          clientNumber: '+20 100 123 4567',
          status: 'In Progress',
          duration: '02:15',
          emotion: 'Professional'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleListenIn = async (call: any) => {
    setMonitoredCall(call);
    setIsMonitoring(true);
    setIsTakeover(false);
    
    try {
      const res = await fetch('http://localhost:5000/api/connection/observer-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          roomId: call.roomName,
          participantName: 'supervisor'
        })
      });
      const data = await res.json();
      setLiveKitToken(data.token);
      setLiveKitUrl(data.liveKitUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setLiveKitToken(null);
    setLiveKitUrl(null);
    setIsTakeover(false);
    setTimeout(() => setMonitoredCall(null), 300);
  };

  const handleTakeover = async () => {
    setIsTakeover(true);
    try {
      const res = await fetch('http://localhost:5000/api/connection/takeover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          roomId: monitoredCall.roomName,
          participantName: 'supervisor'
        })
      });
      const data = await res.json();
      setLiveKitToken(data.token);
      setLiveKitUrl(data.liveKitUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const headers = [
    { key: 'agentName', header: 'AI Agent' },
    { key: 'clientNumber', header: 'Client Number' },
    { key: 'status', header: 'Status' },
    { key: 'duration', header: 'Duration' },
    { key: 'actions', header: 'Actions' },
  ];

  if (loading) return <Loading description="Loading active calls..." withOverlay={true} />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>Live Call Monitoring</h1>
          <p style={{ color: '#525252' }}>Listen to active AI conversations in real-time and take over if necessary.</p>
        </div>
      </div>

      <Grid fullWidth style={{ padding: 0 }}>
        <Column lg={16}>
          <Tile style={{ padding: '0', backgroundColor: '#ffffff' }}>
            <DataTable rows={activeCalls} headers={headers}>
              {({ rows, headers, getHeaderProps, getTableProps }: any) => (
                <TableContainer>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header: any) => (
                          <TableHeader key={header.key} {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.cells[0].value}</TableCell>
                          <TableCell>{row.cells[1].value}</TableCell>
                          <TableCell>
                            <Tag type="green" renderIcon={PhoneFilled}>
                              {row.cells[2].value}
                            </Tag>
                          </TableCell>
                          <TableCell>
                             <div className="pulsing-duration" style={{ color: '#0f62fe', fontWeight: 600 }}>
                               {row.cells[3].value}
                             </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              kind="tertiary" 
                              size="sm" 
                              renderIcon={VolumeUpFilled}
                              onClick={() => handleListenIn(activeCalls.find(c => c.id === row.id))}
                            >
                              Listen In
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </Tile>
        </Column>
      </Grid>

      {/* Monitoring Modal / Overlay */}
      <Modal
        open={isMonitoring}
        onRequestClose={handleStopMonitoring}
        modalHeading="Live Monitoring Mode"
        primaryButtonText="Takeover Call"
        secondaryButtonText="Stop Listening"
        onRequestSubmit={handleTakeover}
        danger
      >
        {monitoredCall && (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{monitoredCall.agentName} ↔ Client</h3>
              <p style={{ color: '#525252' }}>Number: {monitoredCall.clientNumber}</p>
            </div>
            
            {liveKitToken && liveKitUrl && (
              <LiveKitRoom
                video={false}
                audio={true}
                token={liveKitToken}
                serverUrl={liveKitUrl}
                connect={true}
              >
                <RoomAudioRenderer />
                {isTakeover && <TakeoverMicManager />}
              </LiveKitRoom>
            )}

            {/* Audio visualization animation using framer-motion */}
            <div style={{ display: 'flex', gap: '8px', height: '60px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['20%', '80%', '40%', '100%', '20%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  style={{
                    width: '12px',
                    backgroundColor: isTakeover ? '#da1e28' : '#0f62fe',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </div>

            <p style={{ color: '#525252', fontSize: '0.875rem', textAlign: 'center' }}>
              {isTakeover 
                ? "You are now speaking directly to the client. The AI agent has been disconnected."
                : "You are secretly listening to this call. The client and AI cannot hear you. Click 'Takeover Call' to disconnect the AI and speak to the client yourself."}
            </p>
          </div>
        )}
      </Modal>
      
      {/* CSS for pulsing duration */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .pulsing-duration {
          animation: pulse 2s infinite;
        }
      `}} />
    </div>
  );
}

// Component to handle mic enablement when takeover happens
function TakeoverMicManager() {
  const { localParticipant } = useLocalParticipant();
  
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant]);
  
  return null;
}
