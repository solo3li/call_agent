'use client';

import { Grid, Column, Tile, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';

export default function UserOverview() {
  const rows = [
    { id: '1', from: '+1 555-0192', to: 'Me', duration: '02:15', status: 'Completed', time: 'Today, 10:30 AM' },
    { id: '2', from: 'Me', to: '+44 20 7946 0958', duration: '05:42', status: 'Completed', time: 'Yesterday, 3:15 PM' },
    { id: '3', from: '+1 555-8832', to: 'Me', duration: '00:00', status: 'Missed', time: 'Yesterday, 1:00 PM' },
  ];
  
  const headers = [
    { key: 'from', header: 'From' },
    { key: 'to', header: 'To' },
    { key: 'duration', header: 'Duration' },
    { key: 'status', header: 'Status' },
    { key: 'time', header: 'Time' },
  ];

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
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#fa4d56' }}>1</p>
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
        <DataTable rows={rows} headers={headers}>
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
