"use client";

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button
} from '@carbon/react';
import { Copy } from '@carbon/icons-react';
import Link from 'next/link';
import Image from 'next/image';

const templates = [
  { id: '1', name: 'Medical Receptionist', category: 'Healthcare', price: 'Free', description: 'Handles appointment scheduling and basic triage questions.', avatar: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Tech Support Tier 1', category: 'IT', price: '$5/mo', description: 'Troubleshoots common internet and hardware issues.', avatar: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Real Estate Assistant', category: 'Sales', price: 'Free', description: 'Qualifies leads and provides property details.', avatar: 'https://via.placeholder.com/150' },
];

export default function MarketplacePage() {
  
  const handleClone = (templateName: string) => {
    alert(`Successfully cloned ${templateName} to your schema!`);
  };

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
                <Button size="sm" renderIcon={Copy} onClick={() => handleClone(template.name)}>Clone</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
