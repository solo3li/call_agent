"use client";

import React, { useState } from 'react';
import { Button, TextInput, Select, SelectItem, InlineNotification } from '@carbon/react';
import { Locked } from '@carbon/icons-react';

export default function ImpersonatePage() {
  const [tenantId, setTenantId] = useState('');
  const [duration, setDuration] = useState('24h');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'approved'>('idle');

  const handleRequestAccess = () => {
    setStatus('sent');
    // In a real app, POST to /api/internal/impersonate/request
    setTimeout(() => {
      setStatus('approved');
    }, 3000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-2">Impersonation & Access</h1>
      <p className="text-[#a8a8a8] mb-8">
        Request temporary access to a tenant's workspace for troubleshooting and support.
        The tenant must approve the request unless Emergency Bypass is enabled.
      </p>

      {status === 'approved' && (
        <InlineNotification
          kind="success"
          title="Access Granted"
          subtitle="The tenant has approved your request. You can now login to their workspace."
          className="mb-8"
        />
      )}

      {status === 'sent' && (
        <InlineNotification
          kind="info"
          title="Request Sent"
          subtitle="Waiting for the tenant to approve the access request..."
          className="mb-8"
        />
      )}

      <div className="bg-[#262626] p-8 border border-[#393939] space-y-6 rounded">
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Locked className="mr-2" /> Request Workspace Access
          </h2>
        </div>

        <TextInput
          id="tenantId"
          labelText="Tenant ID or Subdomain"
          placeholder="e.g. acme.cpaas.com"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          className="bg-[#161616]"
        />

        <Select
          id="duration"
          labelText="Requested Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <SelectItem value="1h" text="1 Hour" />
          <SelectItem value="6h" text="6 Hours" />
          <SelectItem value="24h" text="24 Hours (Recommended)" />
        </Select>

        <TextInput
          id="reason"
          labelText="Reason for Access (Visible to Tenant)"
          placeholder="e.g. Support ticket #4521 - Debugging call routing"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="pt-4 border-t border-[#393939] flex gap-4">
          <Button onClick={handleRequestAccess} disabled={status === 'sent'}>
            Send Access Request
          </Button>
          <Button kind="danger--tertiary">
            Emergency Bypass (Audit Logged)
          </Button>
        </div>
      </div>
    </div>
  );
}
