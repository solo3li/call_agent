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
import { Add } from '@carbon/icons-react';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/Agents');
        if (!response.ok) throw new Error('Failed to fetch agents');
        const data = await response.json();
        setAgents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const headers = [
    { key: 'name', header: 'Agent Name' },
    { key: 'voiceId', header: 'Voice ID' },
    { key: 'createdAt', header: 'Created At' }
  ];

  const rows = agents.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    voiceId: agent.voiceId,
    createdAt: new Date(agent.createdAt).toLocaleDateString()
  }));

  if (loading) return <Loading description="Loading agents" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>AI Agents</h1>
        <Button renderIcon={Add} onClick={() => router.push('/agents/new')}>
          Create Agent
        </Button>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          style={{ marginBottom: '2rem' }}
        />
      )}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Your Agents" description="Manage and configure your voice AI agents.">
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
                      <Button size="sm" kind="ghost" onClick={() => router.push(`/agents/${row.id}`)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
}
