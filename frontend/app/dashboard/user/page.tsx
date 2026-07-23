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
        <h1 className="impeccable-title">My Dashboard</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6', fontSize: '1.2rem' }}>
          Welcome back. Here is your personal call activity and status.
        </p>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile className="impeccable-tile animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1rem', color: '#f4f4f4', fontWeight: 600 }}>Missed Calls</h3>
          <p className="impeccable-value impeccable-value-danger">{missedCount}</p>
        </Tile>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile className="impeccable-tile animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: '1rem', color: '#f4f4f4', fontWeight: 600 }}>Voicemails</h3>
          <p className="impeccable-value">0</p>
        </Tile>
      </Column>
      
      <Column lg={6} md={8} sm={4}>
        <Tile className="impeccable-tile animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ marginBottom: '1rem', color: '#f4f4f4', fontWeight: 600 }}>Current Status</h3>
          <p className="impeccable-value impeccable-value-success" style={{ fontSize: '2.5rem' }}>Available</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ marginTop: '2rem' }}>
        <DataTable rows={calls} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Recent Calls">
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
      </Column>
    </Grid>
  );
}
