'use client';
import { Form, FormGroup, TextInput, TextArea, Button, InlineNotification } from '@carbon/react';
import { useState } from 'react';
import Link from 'next/link';

export default function CreateAgent() {
  const [name, setName] = useState('');
  const [promptContext, setPromptContext] = useState('');
  const [voiceId, setVoiceId] = useState('default-voice');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '00000000-0000-0000-0000-000000000001',
          name,
          promptContext,
          voiceId
        })
      });
      if (res.ok) {
        setStatus('success');
        setName('');
        setPromptContext('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Create New AI Agent</h1>
      
      {status === 'success' && (
        <InlineNotification 
          kind="success" 
          title="Success" 
          subtitle="Agent created successfully." 
          style={{ marginBottom: '1rem' }} 
        />
      )}
      
      {status === 'error' && (
        <InlineNotification 
          kind="error" 
          title="Error" 
          subtitle="Failed to create agent." 
          style={{ marginBottom: '1rem' }} 
        />
      )}

      <Form onSubmit={handleSubmit}>
        <FormGroup legendText="Agent Configuration">
          <TextInput 
            id="agent-name" 
            labelText="Agent Name" 
            placeholder="e.g. Clinic Receptionist" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ marginBottom: '1rem' }}
          />
          <TextArea 
            id="prompt-context" 
            labelText="System Prompt (Context)" 
            placeholder="You are a helpful assistant for a dental clinic..." 
            value={promptContext}
            onChange={(e) => setPromptContext(e.target.value)}
            required
            rows={6}
            style={{ marginBottom: '1rem' }}
          />
          <TextInput 
            id="voice-id" 
            labelText="Voice ID" 
            placeholder="default-voice" 
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
        </FormGroup>
        <Button type="submit" style={{ marginRight: '1rem' }}>Create Agent</Button>
        <Button kind="secondary" as={Link} href="/">Back to Dashboard</Button>
      </Form>
    </div>
  );
}
