"use client";

import React, { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  FormGroup,
  Checkbox
} from '@carbon/react';
import { Save } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

export default function NewPersonaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    provider: 'google',
    modelName: 'gemini-1.5-pro',
    voiceId: 'Nova',
    systemPrompt: '',
    language: 'ar',
    isActive: true,
    tone: 'professional',
    speed: 'normal',
    enthusiasm: 'medium',
    knowledgeBaseFile: null as File | null,
    knowledgeBaseUrl: ''
  });

  const handleChange = (field: string, value: string | boolean | File | null) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    let knowledgeBaseId = null;

    if (formData.knowledgeBaseFile || formData.knowledgeBaseUrl) {
      const kbData = new FormData();
      kbData.append('name', formData.name + ' KB');
      kbData.append('sourceType', formData.knowledgeBaseFile ? 'pdf' : 'website');
      if (formData.knowledgeBaseUrl) kbData.append('sourceUrl', formData.knowledgeBaseUrl);
      
      const kbRes = await fetch('http://localhost:5000/api/knowledgebases/upload', {
        method: 'POST',
        headers: { 'Authorization': `ApiKey ${localStorage.getItem('token')}` },
        body: kbData
      });
      if (kbRes.ok) {
        const kb = await kbRes.json();
        knowledgeBaseId = kb.id;
      }
    }

    const payload = {
      name: formData.name,
      provider: formData.provider,
      modelName: formData.modelName,
      voiceId: formData.voiceId,
      systemPrompt: formData.systemPrompt,
      language: formData.language,
      isActive: formData.isActive,
      knowledgeBaseId: knowledgeBaseId,
      personalityJson: JSON.stringify({
        tone: formData.tone,
        speed: formData.speed,
        enthusiasm: formData.enthusiasm
      })
    };

    const res = await fetch('http://localhost:5000/api/personas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Persona Created!");
      router.push('/personas');
    } else {
      alert("Failed to create persona.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Breadcrumb>
        <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/personas">Personas Engine</BreadcrumbItem>
        <BreadcrumbItem href="/personas/new">Create From Zero</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center mt-4 mb-8">
        <h1 className="text-3xl font-bold text-[var(--cds-text-01)]">Create New Persona</h1>
        <Button renderIcon={Save} onClick={handleSave}>Save Persona</Button>
      </div>

      <div className="bg-[var(--cds-layer-01)] p-6 shadow-sm border border-[var(--cds-ui-03)] space-y-6">
        <FormGroup legendText="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              id="name" 
              labelText="Persona Name" 
              placeholder="e.g. Sales Expert, Support Guru"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Select 
              id="language" 
              labelText="Language" 
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <SelectItem value="ar" text="Arabic" />
              <SelectItem value="en" text="English" />
            </Select>
          </div>
        </FormGroup>

        <FormGroup legendText="AI Brain Configuration">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              id="provider" 
              labelText="AI Provider" 
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
            >
              <SelectItem value="google" text="Google Gemini" />
              <SelectItem value="openai" text="OpenAI" />
              <SelectItem value="anthropic" text="Anthropic Claude" />
            </Select>

            <TextInput 
              id="modelName" 
              labelText="Model Name" 
              value={formData.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
            />
          </div>
          
          <div className="mt-4">
            <TextArea
              id="systemPrompt"
              labelText="System Prompt (The Agent's Core Rules & Instructions)"
              rows={8}
              placeholder="You are a helpful customer support agent..."
              value={formData.systemPrompt}
              onChange={(e) => handleChange('systemPrompt', e.target.value)}
            />
          </div>
        </FormGroup>

        <FormGroup legendText="Voice & Personality">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select 
              id="voiceId" 
              labelText="Voice ID (ElevenLabs / Picsart)" 
              value={formData.voiceId}
              onChange={(e) => handleChange('voiceId', e.target.value)}
            >
              <SelectItem value="Nova" text="Nova (Female, Professional)" />
              <SelectItem value="Alloy" text="Alloy (Neutral, Friendly)" />
              <SelectItem value="Onyx" text="Onyx (Male, Deep)" />
            </Select>
            <Select 
              id="tone" 
              labelText="Tone" 
              value={formData.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
            >
              <SelectItem value="professional" text="Professional" />
              <SelectItem value="casual" text="Casual" />
              <SelectItem value="empathetic" text="Empathetic" />
              <SelectItem value="aggressive" text="Aggressive (Sales)" />
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select 
              id="speed" 
              labelText="Speaking Speed" 
              value={formData.speed}
              onChange={(e) => handleChange('speed', e.target.value)}
            >
              <SelectItem value="slow" text="Slow" />
              <SelectItem value="normal" text="Normal" />
              <SelectItem value="fast" text="Fast" />
            </Select>
            <Select 
              id="enthusiasm" 
              labelText="Enthusiasm Level" 
              value={formData.enthusiasm}
              onChange={(e) => handleChange('enthusiasm', e.target.value)}
            >
              <SelectItem value="low" text="Low (Calm)" />
              <SelectItem value="medium" text="Medium (Balanced)" />
              <SelectItem value="high" text="High (Energetic)" />
            </Select>
          </div>
        </FormGroup>

        <FormGroup legendText="Knowledge Base (RAG Integration)">
          <div className="text-sm text-gray-600 mb-4">
            Provide a document or website for the AI to extract knowledge from. This context will be injected automatically during calls.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput 
              id="knowledgeBaseUrl" 
              labelText="Website URL" 
              placeholder="https://example.com/faq"
              value={formData.knowledgeBaseUrl}
              onChange={(e) => handleChange('knowledgeBaseUrl', e.target.value)}
            />
            <div className="cds--form-item">
              <label className="cds--label">Upload PDF Document</label>
              <input 
                type="file" 
                accept=".pdf"
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[var(--cds-button-primary)] file:text-white hover:file:bg-[var(--cds-button-primary-hover)] cursor-pointer"
                onChange={(e) => handleChange('knowledgeBaseFile', e.target.files ? e.target.files[0] : null)}
              />
            </div>
          </div>
        </FormGroup>
        
        <FormGroup legendText="Status">
          <Checkbox 
            id="isActive" 
            labelText="Active" 
            checked={formData.isActive}
            onChange={(e, { checked }) => handleChange('isActive', checked)}
          />
        </FormGroup>
      </div>
    </div>
  );
}
