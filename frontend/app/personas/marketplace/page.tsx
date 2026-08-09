"use client";

import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Loading
} from '@carbon/react';
import { Copy } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/personas/templates');
        const data = await res.json();
        setTemplates(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);
  
  const handleClone = async (template: any) => {
    try {
      const res = await fetch('http://localhost:5000/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: template.name + ' (Clone)',
          avatarUrl: template.avatar,
          description: template.description,
          voiceId: template.voiceId,
          language: 'en',
          provider: 'google',
          modelName: 'gemini-1.5-pro',
          systemPrompt: template.systemPrompt,
          isActive: true
        })
      });
      if (res.ok) {
        alert(`Successfully cloned ${template.name} to your workspace!`);
        router.push('/personas');
      } else {
        alert('Failed to clone persona.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Breadcrumb>
            <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/personas">Personas Engine</BreadcrumbItem>
            <BreadcrumbItem href="/personas/marketplace">Marketplace</BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2 text-[var(--cds-text-01)]">Persona Marketplace</h1>
          <p className="text-[var(--cds-text-02)]">Clone pre-built industry standard AI personas to your workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-[var(--cds-layer-01)] border border-[var(--cds-ui-03)] flex flex-col hover:shadow-md transition-shadow">
            <div className="h-40 bg-[var(--cds-ui-02)] flex items-center justify-center">
              <img src={template.avatar} alt={template.name} className="w-24 h-24 rounded-full border-4 border-white shadow-sm" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{template.name}</h3>
                <span className="bg-[var(--cds-support-04)] text-white text-xs px-2 py-1 font-semibold">{template.category}</span>
              </div>
              <p className="text-[var(--cds-text-02)] text-sm mb-4 flex-1">{template.description}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--cds-ui-03)]">
                <span className="font-bold text-[var(--cds-text-01)]">{template.price}</span>
                <Button size="sm" renderIcon={Copy} onClick={() => handleClone(template)}>Clone</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
