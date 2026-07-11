'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Button,
  InlineNotification,
  Loading
} from '@carbon/react';
import { ArrowLeft, TrashCan } from '@carbon/icons-react';

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    promptContext: '',
    welcomeMessage: '',
    voiceId: 'default-voice'
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch('/api/Agents');
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        const agent = data.find((a: any) => a.id === id);
        if (!agent) throw new Error('Agent not found');
        
        setFormData({
          name: agent.name,
          promptContext: agent.promptContext,
          welcomeMessage: agent.welcomeMessage || '',
          voiceId: agent.voiceId
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/Agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update agent');
      router.push('/agents');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/Agents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete agent');
      router.push('/agents');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <Loading description="Loading agent" withOverlay={false} />;

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>Edit AI Agent</h1>
        <Button kind="danger" renderIcon={TrashCan} onClick={handleDelete} disabled={saving}>
          Delete Agent
        </Button>
      </div>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <TextInput
          id="agent-name"
          name="name"
          labelText="Agent Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <TextArea
          id="agent-prompt"
          name="promptContext"
          labelText="System Prompt / Persona"
          rows={6}
          value={formData.promptContext}
          onChange={handleChange}
          required
        />

        <TextInput
          id="agent-welcome"
          name="welcomeMessage"
          labelText="Welcome Message (Optional)"
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
