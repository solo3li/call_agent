'use client';
import React, { useEffect, useState } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Loading,
  InlineNotification,
  Modal,
  TextInput,
  Toggle
} from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/icons-react';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    payloadUrl: '',
    isActive: true
  });

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      const data = await response.json();
      setWebhooks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', payloadUrl: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (webhook: any) => {
    setEditingId(webhook.id);
    setFormData({
      name: webhook.name,
      payloadUrl: webhook.payloadUrl,
      isActive: webhook.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingId ? `/api/Webhooks/${editingId}` : '/api/Webhooks';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save webhook');
      
      setIsModalOpen(false);
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      const res = await fetch(`/api/Webhooks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete webhook');
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'payloadUrl', header: 'Payload URL' },
    { key: 'status', header: 'Status' }
  ];

  const rows = webhooks.map((w: any) => ({
    id: w.id,
    name: w.name,
    payloadUrl: w.payloadUrl,
    status: w.isActive ? 'Active' : 'Disabled',
    original: w
  }));

  if (loading && webhooks.length === 0) return <Loading description="Loading" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>Webhooks</h1>
        <Button renderIcon={Add} onClick={openCreateModal}>
          Add Webhook
        </Button>
      </div>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Configured Webhooks" description="Events from the platform will be sent via POST to these URLs.">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: any) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any) => {
                  const originalWebhook = webhooks.find((w: any) => w.id === row.id);
                  return (
                    <TableRow key={row.id}>
                      {row.cells.map((cell: any) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell>
                        <Button size="sm" kind="ghost" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEditModal(originalWebhook)} />
                        <Button size="sm" kind="danger--ghost" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => handleDelete(row.id)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSubmit}
        modalHeading={editingId ? "Edit Webhook" : "Add Webhook"}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TextInput
            id="wh-name"
            labelText="Webhook Name"
            placeholder="e.g. CRM Integration"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextInput
            id="wh-url"
            labelText="Payload URL"
            placeholder="https://example.com/webhook"
            value={formData.payloadUrl}
            onChange={(e) => setFormData({ ...formData, payloadUrl: e.target.value })}
          />
          <Toggle
            labelText="Status"
            labelA="Disabled"
            labelB="Active"
            id="wh-status"
            toggled={formData.isActive}
            onToggle={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </Modal>
    </div>
  );
}
