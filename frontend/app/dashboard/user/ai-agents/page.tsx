'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  InlineNotification,
  Loading,
  Grid,
  Column,
  Tile,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Accordion,
  AccordionItem
} from '@carbon/react';
import { Checkmark, Edit, Save, AudioConsole } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Voice Options based on Google Cloud TTS & Gemini
const VOICE_PROFILES = [
  { id: 'Nova', name: 'Nova (Google Gemini)' },
  { id: 'Ursa', name: 'Ursa (Google Gemini)' },
  { id: 'Vega', name: 'Vega (Google Gemini)' },
  { id: 'Pegasus', name: 'Pegasus (Google Gemini)' },
  { id: 'Lyra', name: 'Lyra (Google Gemini)' },
  { id: 'Kore', name: 'Kore (Google Gemini)' },
  { id: 'Journey-F', name: 'Journey Female (Google Cloud)' },
  { id: 'Journey-M', name: 'Journey Male (Google Cloud)' },
  { id: 'Neural2-F', name: 'Neural2 Female (Google Cloud)' },
  { id: 'Neural2-M', name: 'Neural2 Male (Google Cloud)' },
  { id: 'WaveNet-F', name: 'WaveNet Female (Google Cloud)' },
];

const LANGUAGES = [
  { id: 'Arabic', name: 'Arabic' },
  { id: 'English', name: 'English' },
  { id: 'Spanish', name: 'Spanish' },
  { id: 'French', name: 'French' },
];

const DIALECTS = {
  Arabic: [
    { id: 'ar-EG', name: 'Egyptian (ar-EG)' },
    { id: 'ar-SA', name: 'Saudi (ar-SA)' },
    { id: 'ar-AE', name: 'UAE (ar-AE)' },
    { id: 'ar-LB', name: 'Lebanese (ar-LB)' },
    { id: 'ar-MA', name: 'Moroccan (ar-MA)' },
    { id: 'ar-XA', name: 'Standard Arabic (ar-XA)' }
  ],
  English: [
    { id: 'en-US', name: 'US English (en-US)' },
    { id: 'en-GB', name: 'British English (en-GB)' },
    { id: 'en-AU', name: 'Australian English (en-AU)' },
  ],
  Spanish: [
    { id: 'es-ES', name: 'Spain (es-ES)' },
    { id: 'es-MX', name: 'Mexico (es-MX)' }
  ],
  French: [
    { id: 'fr-FR', name: 'France (fr-FR)' },
    { id: 'fr-CA', name: 'Canada (fr-CA)' }
  ]
};

const EMOTIONS = [
  { id: 'Professional', name: 'Professional & Clear' },
  { id: 'Empathetic', name: 'Empathetic & Caring' },
  { id: 'Enthusiastic', name: 'Enthusiastic & Energetic' },
  { id: 'Calm', name: 'Calm & Reassuring' },
];

const SPEAKING_STYLES = [
  { id: 'Conversational', name: 'Conversational' },
  { id: 'NewsReading', name: 'News Reading' },
  { id: 'CustomerService', name: 'Customer Service' },
  { id: 'Storytelling', name: 'Storytelling' }
];

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{kind: 'success'|'error', text: string} | null>(null);
  
  // Selected Agent State
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (data.length > 0) setSelectedAgent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedAgent)
      });
      
      if (res.ok) {
        setNotification({ kind: 'success', text: 'AI Agent updated successfully' });
        fetchAgents();
      } else {
        setNotification({ kind: 'error', text: 'Failed to update agent' });
      }
    } catch (error) {
      setNotification({ kind: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = async () => {
    const newAgent = {
      name: 'New Agent',
      provider: 'google',
      modelName: 'gemini-1.5-pro',
      promptContext: 'You are a helpful AI assistant.',
      welcomeMessage: 'Hello, how can I help you today?',
      voiceId: 'Nova',
      language: 'Arabic',
      dialect: 'ar-EG',
      emotion: 'Professional',
      speakingStyle: 'CustomerService',
      fallbackNumber: ''
    };
    
    setSaving(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAgent)
      });
      if (res.ok) {
        fetchAgents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading description="Loading AI Agents..." withOverlay={true} />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>AI Agent Configuration</h1>
          <p style={{ color: '#525252' }}>Design and customize your AI Voice Agents with advanced Gemini & Google Cloud TTS capabilities.</p>
        </div>
        <Button onClick={handleCreateNew}>Create New Agent</Button>
      </div>

      {notification && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <InlineNotification
            kind={notification.kind}
            title={notification.kind === 'success' ? 'Success' : 'Error'}
            subtitle={notification.text}
            onClose={() => setNotification(null)}
            style={{ marginBottom: '2rem' }}
          />
        </motion.div>
      )}

      {agents.length === 0 ? (
        <Tile>No AI Agents found. Create one to get started.</Tile>
      ) : (
        <Grid fullWidth style={{ padding: 0 }}>
          <Column lg={4} md={3} sm={4}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {agents.map((agent) => (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={agent.id}>
                  <Tile 
                    onClick={() => setSelectedAgent(agent)}
                    style={{ 
                      cursor: 'pointer', 
                      border: selectedAgent?.id === agent.id ? '2px solid #0f62fe' : '1px solid #e0e0e0',
                      backgroundColor: selectedAgent?.id === agent.id ? '#f4f4f4' : '#ffffff',
                      boxShadow: selectedAgent?.id === agent.id ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <AudioConsole size={24} color={selectedAgent?.id === agent.id ? '#0f62fe' : '#525252'} />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{agent.name}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#525252' }}>{agent.language} - {agent.voiceId}</p>
                      </div>
                    </div>
                  </Tile>
                </motion.div>
              ))}
            </div>
          </Column>

          <Column lg={12} md={5} sm={4}>
            <AnimatePresence mode="wait">
              {selectedAgent && (
                <motion.div 
                  key={selectedAgent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Tile style={{ padding: '2rem', backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Tabs>
                      <TabList aria-label="Agent Configuration">
                        <Tab>General</Tab>
                        <Tab>Voice & Persona</Tab>
                        <Tab>Behavior & Routing</Tab>
                      </TabList>
                      <TabPanels>
                        
                        {/* General Tab */}
                        <TabPanel style={{ paddingTop: '2rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <TextInput
                              id="agent-name"
                              labelText="Agent Name"
                              value={selectedAgent.name}
                              onChange={(e) => setSelectedAgent({...selectedAgent, name: e.target.value})}
                            />
                            
                            <TextArea
                              id="agent-instructions"
                              labelText="Custom Instructions (System Prompt)"
                              helperText="Provide deep contextual instructions for how the AI should behave, handle objections, and gather information."
                              rows={8}
                              value={selectedAgent.promptContext}
                              onChange={(e) => setSelectedAgent({...selectedAgent, promptContext: e.target.value})}
                            />

                            <TextArea
                              id="agent-welcome"
                              labelText="Welcome Message"
                              helperText="The first sentence the AI will say when the call connects."
                              rows={3}
                              value={selectedAgent.welcomeMessage || ''}
                              onChange={(e) => setSelectedAgent({...selectedAgent, welcomeMessage: e.target.value})}
                            />
                          </div>
                        </TabPanel>

                        {/* Voice & Persona Tab */}
                        <TabPanel style={{ paddingTop: '2rem' }}>
                          <Grid fullWidth style={{ padding: 0 }}>
                            <Column lg={8} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              
                              <Select
                                id="language-select"
                                labelText="Language"
                                value={selectedAgent.language || 'Arabic'}
                                onChange={(e) => setSelectedAgent({...selectedAgent, language: e.target.value, dialect: DIALECTS[e.target.value as keyof typeof DIALECTS]?.[0].id || ''})}
                              >
                                {LANGUAGES.map(lang => (
                                  <SelectItem key={lang.id} value={lang.id} text={lang.name} />
                                ))}
                              </Select>

                              <Select
                                id="dialect-select"
                                labelText="Dialect & Region"
                                value={selectedAgent.dialect}
                                onChange={(e) => setSelectedAgent({...selectedAgent, dialect: e.target.value})}
                              >
                                {(DIALECTS[selectedAgent.language as keyof typeof DIALECTS] || []).map((dialect: any) => (
                                  <SelectItem key={dialect.id} value={dialect.id} text={dialect.name} />
                                ))}
                              </Select>

                              <Select
                                id="voice-select"
                                labelText="Voice Profile"
                                helperText="Select from Google Gemini or Google Cloud TTS voices."
                                value={selectedAgent.voiceId}
                                onChange={(e) => setSelectedAgent({...selectedAgent, voiceId: e.target.value})}
                              >
                                {VOICE_PROFILES.map(voice => (
                                  <SelectItem key={voice.id} value={voice.id} text={voice.name} />
                                ))}
                              </Select>
                              
                              <Select
                                id="emotion-select"
                                labelText="Primary Emotion"
                                value={selectedAgent.emotion || 'Professional'}
                                onChange={(e) => setSelectedAgent({...selectedAgent, emotion: e.target.value})}
                              >
                                {EMOTIONS.map(emo => (
                                  <SelectItem key={emo.id} value={emo.id} text={emo.name} />
                                ))}
                              </Select>

                              <Select
                                id="style-select"
                                labelText="Speaking Style"
                                value={selectedAgent.speakingStyle || 'Conversational'}
                                onChange={(e) => setSelectedAgent({...selectedAgent, speakingStyle: e.target.value})}
                              >
                                {SPEAKING_STYLES.map(style => (
                                  <SelectItem key={style.id} value={style.id} text={style.name} />
                                ))}
                              </Select>

                            </Column>
                          </Grid>
                        </TabPanel>

                        {/* Behavior & Routing Tab */}
                        <TabPanel style={{ paddingTop: '2rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                             <Accordion>
                                <AccordionItem title="Fallback Routing (Transfer Call)">
                                  <p style={{ marginBottom: '1rem', color: '#525252' }}>
                                    If the AI is unable to answer a question or encounters a complex scenario, it can gracefully transfer the call to a human agent.
                                  </p>
                                  <TextInput
                                    id="fallback-number"
                                    labelText="Transfer Number or SIP Extension"
                                    placeholder="e.g. +1234567890 or SIP/100"
                                    value={selectedAgent.fallbackNumber || ''}
                                    onChange={(e) => setSelectedAgent({...selectedAgent, fallbackNumber: e.target.value})}
                                  />
                                </AccordionItem>
                             </Accordion>
                          </div>
                        </TabPanel>

                      </TabPanels>
                    </Tabs>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={handleSave} disabled={saving} renderIcon={Save}>
                        {saving ? 'Saving...' : 'Save Configuration'}
                      </Button>
                    </div>
                  </Tile>
                </motion.div>
              )}
            </AnimatePresence>
          </Column>
        </Grid>
      )}
    </div>
  );
}
