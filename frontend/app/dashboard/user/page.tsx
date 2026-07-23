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
    { key: 'aiSummary', header: 'AI Summary' },
    { key: 'time', header: 'Time' },
  ];

  const missedCount = calls.filter(c => c.status?.toLowerCase() === 'missed').length;

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem', color: '#161616' }}>My Dashboard</h1>
        <p style={{ marginBottom: '2rem', color: '#525252', fontSize: '1.2rem' }}>
          Welcome back. Here is your personal call activity and AI summaries.
        </p>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} className="animate-fade-in">
          <h3 style={{ marginBottom: '1rem', color: '#161616', fontWeight: 600 }}>Missed Calls</h3>
          <p style={{ color: '#da1e28', fontSize: '2.5rem', fontWeight: 300 }}>{missedCount}</p>
        </Tile>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} className="animate-fade-in">
          <h3 style={{ marginBottom: '1rem', color: '#161616', fontWeight: 600 }}>Voicemails</h3>
          <p style={{ color: '#161616', fontSize: '2.5rem', fontWeight: 300 }}>0</p>
        </Tile>
      </Column>
      
      <Column lg={6} md={8} sm={4}>
        <Tile style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} className="animate-fade-in">
          <h3 style={{ marginBottom: '1rem', color: '#161616', fontWeight: 600 }}>Current Status</h3>
          <p style={{ color: '#24a148', fontSize: '2.5rem', fontWeight: 300 }}>Available</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ marginTop: '2rem' }}>
        <Tile style={{ padding: '0', backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <DataTable rows={calls.length > 0 ? calls : [
            // Mock data for AI Summaries until API provides them
            { id: '1', from: '+20 100 123 4567', to: 'Me', duration: '03:15', status: 'Completed', aiSummary: 'Client requested a callback regarding pricing. High intent to buy.', time: new Date().toLocaleString() },
            { id: '2', from: 'Me', to: '+971 50 987 6543', duration: '01:20', status: 'Completed', aiSummary: 'Followed up on email. Client was busy, call again tomorrow.', time: new Date().toLocaleString() }
          ]} headers={headers}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <TableContainer title="Recent Calls & Summaries">
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
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </Tile>
      </Column>
    </Grid>
  );
}
