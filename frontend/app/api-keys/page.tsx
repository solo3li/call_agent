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
  TextInput
} from '@carbon/react';
import { Add, TrashCan, Copy } from '@carbon/icons-react';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ApiKeys');
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      const res = await fetch('/api/ApiKeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      if (!res.ok) throw new Error('Failed to create API key');
      
      const data = await res.json();
      setCreatedKey(data.rawKey);
      setIsModalOpen(false);
      setNewKeyName('');
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/ApiKeys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete API key');
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const headers = [
    { key: 'name', header: 'Key Name' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'lastUsedAt', header: 'Last Used' }
  ];

  const rows = apiKeys.map((k: any) => ({
    id: k.id,
    name: k.name,
    createdAt: new Date(k.createdAt).toLocaleDateString(),
    lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'
  }));

  if (loading && apiKeys.length === 0) return <Loading description="Loading keys" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>API Keys</h1>
        <Button renderIcon={Add} onClick={() => setIsModalOpen(true)}>
          Create API Key
        </Button>
      </div>

      {error && (
        <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />
      )}

      {createdKey && (
        <InlineNotification
          kind="success"
          title="API Key Created"
          style={{ marginBottom: '2rem' }}
          onCloseButtonClick={() => setCreatedKey(null)}
        >
          <p>Please copy this key now. You will not be able to see it again.</p>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '1rem' }}>
            <code style={{ background: '#393939', padding: '0.5rem', borderRadius: '4px' }}>{createdKey}</code>
            <Button size="sm" kind="ghost" renderIcon={Copy} iconDescription="Copy" hasIconOnly onClick={() => navigator.clipboard.writeText(createdKey)} />
          </div>
        </InlineNotification>
      )}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Your API Keys" description="Keys used for authenticating external services (e.g. Webhooks).">
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
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell: any) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell>
                      <Button size="sm" kind="danger--ghost" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => handleDeleteKey(row.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleCreateKey}
        modalHeading="Create API Key"
        primaryButtonText="Create"
        secondaryButtonText="Cancel"
      >
        <TextInput
          id="key-name"
          labelText="Key Name"
          placeholder="e.g. Production Webhook Key"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
        />
      </Modal>
    </div>
  );
}
