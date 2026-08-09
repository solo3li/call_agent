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
    isActive: true
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    // In a real app, POST to /api/personas
    console.log("Saving persona:", formData);
    alert("Persona Created!");
    router.push('/personas');
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
