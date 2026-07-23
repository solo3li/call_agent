'use client';

import { useEffect, useState } from 'react';
import { Grid, Column, Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, Modal } from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import { apiFetch } from '@/lib/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await apiFetch('/api/apikeys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.map((k: any) => ({
          id: k.id,
          name: k.name,
          key: '****************',
          status: 'Active',
          created: new Date(k.createdAt).toLocaleDateString()
        })));
      }
    } catch (err) {
      console.error('Error fetching API keys', err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    try {
      const name = prompt('Enter a name for the new API key:');
      if (!name) return;

      const res = await apiFetch('/api/apikeys', {
        method: 'POST',
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.rawKey);
        fetchKeys();
      } else {
        alert('Failed to generate key');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this key? This action cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      alert('Failed to delete key');
    }
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'key', header: 'API Key' },
    { key: 'status', header: 'Status' },
    { key: 'created', header: 'Created At' },
    { key: 'actions', header: '' }
  ];

  const rows = keys.map(k => ({ ...k, actions: 'delete' }));

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>API Keys</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Manage your API keys used to authenticate requests to the CPaaS platform. Keep these secret.
        </p>
      </Column>
      
      <Column lg={16} md={8} sm={4}>
        <DataTable rows={rows} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Your API Keys">
              <TableToolbar>
                <TableToolbarContent>
                  <Button renderIcon={Add} onClick={handleGenerate}>Generate New Key</Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const { key, ...rest } = getHeaderProps({ header });
                      return (
                        <TableHeader key={key} {...rest}>
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const { key, ...rest } = getRowProps({ row });
                    return (
                      <TableRow key={key} {...rest}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'actions' ? (
                              <Button kind="danger--ghost" size="sm" hasIconOnly iconDescription="Delete" renderIcon={TrashCan} onClick={() => handleDelete(row.id)} />
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </Column>

      <Modal open={!!newKey} passiveModal modalHeading="Save Your New API Key" onRequestClose={() => setNewKey(null)}>
        <p style={{ marginBottom: '1rem' }}>Please copy this key and store it somewhere safe. You will not be able to see it again!</p>
        <div style={{ padding: '1rem', background: '#262626', color: '#4589ff', fontFamily: 'monospace', fontSize: '1.2rem', wordBreak: 'break-all' }}>
          {newKey}
        </div>
      </Modal>
    </Grid>
  );
}
