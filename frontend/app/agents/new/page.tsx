'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Button,
  InlineNotification
} from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';

export default function CreateAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'alibaba',
    modelName: 'qwen-omni-turbo',
    promptContext: '',
    welcomeMessage: '',
    voiceId: 'default-voice'
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/Agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create agent');
      router.push('/agents');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <Button 
        kind="ghost" 
        renderIcon={ArrowLeft} 
        onClick={() => router.push('/agents')}
        style={{ marginBottom: '1rem' }}
      >
        Back to Agents
      </Button>

      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>Create AI Agent</h1>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <TextInput
          id="agent-name"
          name="name"
          labelText="Agent Name"
          placeholder="e.g. Sales Representative"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Select
          id="agent-provider"
          name="provider"
          labelText="AI Provider"
          value={formData.provider}
          onChange={handleChange}
        >
          <SelectItem value="alibaba" text="Alibaba Qwen Omni" />
          <SelectItem value="google" text="Google Gemini Live" />
        </Select>

        <TextInput
          id="agent-model"
          name="modelName"
          labelText="Model Name"
          placeholder="e.g. qwen-omni-turbo or gemini-2.0-flash-exp"
          value={formData.modelName}
          onChange={handleChange}
          required
        />

        <TextArea
          id="agent-prompt"
          name="promptContext"
          labelText="System Prompt / Persona"
          helperText="Define how the AI should behave, what its goals are, and how it should respond."
          placeholder="You are a helpful sales representative for..."
          rows={6}
          value={formData.promptContext}
          onChange={handleChange}
          required
        />

        <TextInput
          id="agent-welcome"
          name="welcomeMessage"
          labelText="Welcome Message (Optional)"
          helperText="The first thing the AI will say when the user connects."
          placeholder="Hello! How can I help you today?"
          value={formData.welcomeMessage}
          onChange={handleChange}
        />

        <Select
          id="agent-voice"
          name="voiceId"
          labelText="Voice"
          value={formData.voiceId}
          onChange={handleChange}
        >
          <SelectItem value="default-voice" text="Default Female (English)" />
          <SelectItem value="male-1" text="Male 1 (English)" />
          <SelectItem value="arabic-female" text="Female (Arabic)" />
        </Select>

        <div style={{ marginTop: '1rem' }}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}
