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
  InlineNotification
} from '@carbon/react';
import { Add, TrashCan, Copy } from '@carbon/icons-react';

export default function SipAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [createdAccount, setCreatedAccount] = useState<any>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/SipAccounts');
      if (!res.ok) throw new Error('Failed to fetch SIP accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/SipAccounts', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate SIP account');
      const newAccount = await res.json();
      setCreatedAccount(newAccount);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SIP Account? MicroSIP will immediately disconnect.')) return;
    try {
      const res = await fetch(`/api/SipAccounts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete SIP account');
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const headers = [
    { key: 'username', header: 'Username / Extension' },
    { key: 'domain', header: 'SIP Domain' },
    { key: 'createdAt', header: 'Created On' }
  ];

  const rows = accounts.map((a: any) => ({
    id: a.id,
    username: a.username,
    domain: a.domain,
    createdAt: new Date(a.createdAt).toLocaleDateString()
  }));

  if (loading && accounts.length === 0) return <Loading description="Loading" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>Test SIP Accounts (MicroSIP)</h1>
        <Button renderIcon={Add} onClick={handleCreate}>
          Generate Test Account
        </Button>
      </div>

      <p style={{ marginBottom: '2rem', maxWidth: '800px', lineHeight: 1.5 }}>
        Generate SIP credentials to log in using softphones like MicroSIP, Zoiper, or Linphone. 
        Once logged in, you can dial your AI Agent directly without buying a real phone number.
      </p>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      {createdAccount && (
        <InlineNotification
          kind="success"
          title="SIP Account Created"
          style={{ marginBottom: '2rem', maxWidth: '100%' }}
          onCloseButtonClick={() => setCreatedAccount(null)}
        >
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p><strong>Domain/Server:</strong> <code>{createdAccount.domain}</code></p>
            <p><strong>Username:</strong> <code>{createdAccount.username}</code></p>
            <p><strong>Password:</strong> <code>{createdAccount.password}</code></p>
            <p style={{ color: '#da1e28', marginTop: '0.5rem' }}>Please copy this password now. It will not be shown again.</p>
          </div>
        </InlineNotification>
      )}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Active Accounts">
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
                      <Button size="sm" kind="danger--ghost" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => handleDelete(row.id)} />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                      No SIP Accounts found. Click Generate to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
}
