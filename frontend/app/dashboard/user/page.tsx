'use client';

import { useEffect, useState } from 'react';
import { Grid, Column, Tile, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';
import { apiFetch } from '@/lib/api';

export default function UserOverview() {
  const [calls, setCalls] = useState<any[]>([]);

  const fetchCalls = async () => {
    try {
      const res = await apiFetch('/api/calls');
      if (res.ok) {
        const data = await res.json();
        setCalls(data.map((c: any) => ({
          id: c.id,
          from: c.direction === 'inbound' ? c.callerNumber : 'Me',
          to: c.direction === 'outbound' ? c.calledNumber : 'Me',
          duration: `${Math.floor(c.durationSeconds / 60).toString().padStart(2, '0')}:${(c.durationSeconds % 60).toString().padStart(2, '0')}`,
          status: c.status,
          time: new Date(c.startTime).toLocaleString()
        })));
      }
    } catch (err) {
      console.error('Error fetching calls', err);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);
  
  const headers = [
    { key: 'from', header: 'From' },
    { key: 'to', header: 'To' },
    { key: 'duration', header: 'Duration' },
    { key: 'status', header: 'Status' },
    { key: 'time', header: 'Time' },
  ];

  const missedCount = calls.filter(c => c.status?.toLowerCase() === 'missed').length;

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>My Dashboard</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Welcome back. Here is your personal call activity and status.
        </p>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Missed Calls</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#fa4d56' }}>{missedCount}</p>
        </Tile>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Voicemails</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#4589ff' }}>0</p>
        </Tile>
      </Column>
      
      <Column lg={6} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Current Status</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#24a148' }}>Available</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ marginTop: '2rem' }}>
        <DataTable rows={calls} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Recent Calls">
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
                        <TableCell key={cell.id}>{cell.value}</TableCell>
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
