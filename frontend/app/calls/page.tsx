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
  Loading,
  InlineNotification,
  Tag
} from '@carbon/react';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Calls');
      if (!response.ok) throw new Error('Failed to fetch call logs');
      const data = await response.json();
      setCalls(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const headers = [
    { key: 'startTime', header: 'Date & Time' },
    { key: 'agentName', header: 'Agent' },
    { key: 'callerNumber', header: 'Caller' },
    { key: 'duration', header: 'Duration' },
    { key: 'cost', header: 'Cost' },
    { key: 'status', header: 'Status' }
  ];

  const rows = calls.map((c: any) => ({
    id: c.id,
    startTime: new Date(c.startTime).toLocaleString(),
    agentName: c.agentName,
    callerNumber: c.callerNumber || 'Unknown',
    duration: `${c.duration} sec`,
    cost: `$${c.cost.toFixed(2)}`,
    status: c.status
  }));

  if (loading && calls.length === 0) return <Loading description="Loading" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>Call Logs</h1>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Recent Calls" description="A history of all inbound and outbound AI voice calls.">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: any) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell: any) => {
                      if (cell.info.header === 'status') {
                        const kind = cell.value === 'Completed' ? 'green' : 'red';
                        return (
                          <TableCell key={cell.id}>
                            <Tag type={kind}>{cell.value}</Tag>
                          </TableCell>
                        );
                      }
                      return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    })}
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No calls found.
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
