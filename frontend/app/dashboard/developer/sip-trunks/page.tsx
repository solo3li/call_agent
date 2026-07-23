'use client';

import { useEffect, useState } from 'react';
import { Grid, Column, Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent } from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';
import { apiFetch } from '@/lib/api';

export default function SipTrunksPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchAccounts = async () => {
    try {
      const res = await apiFetch('/api/sipaccounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.map((s: any) => ({
          id: s.id,
          name: 'SIP Endpoint',
          username: s.username,
          password: s.password,
          domain: s.domain,
          status: 'Offline'
        })));
      }
    } catch (err) {
      console.error('Error fetching SIP accounts', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await apiFetch('/api/sipaccounts', { method: 'POST' });
      if (res.ok) {
        fetchAccounts();
      } else {
        alert('Failed to create SIP endpoint');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SIP endpoint?')) return;
    try {
      const res = await apiFetch(`/api/sipaccounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAccounts();
      }
    } catch (err) {
      alert('Failed to delete SIP endpoint');
    }
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'SIP Username' },
    { key: 'password', header: 'SIP Password' },
    { key: 'domain', header: 'SIP Domain' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '' }
  ];

  const rows = accounts.map(a => ({ ...a, actions: 'delete' }));

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>SIP Trunks & Endpoints</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Create SIP credentials for your softphones (like MicroSIP) or IP PBXs to connect to the platform.
        </p>
      </Column>
      
      <Column lg={16} md={8} sm={4}>
        <DataTable rows={rows} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="SIP Credentials">
              <TableToolbar>
                <TableToolbarContent>
                  <Button renderIcon={Add} onClick={handleCreate}>Create SIP Endpoint</Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </Column>
    </Grid>
  );
}
