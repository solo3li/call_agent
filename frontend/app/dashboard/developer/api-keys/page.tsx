'use client';

import { Grid, Column, Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent } from '@carbon/react';
import { Add } from '@carbon/icons-react';

export default function ApiKeysPage() {
  const rows = [
    { id: '1', name: 'Production Key', key: 'pk_live_xxxxxxxxxxxxxxxx', status: 'Active', created: '2026-05-12' },
    { id: '2', name: 'Test Key', key: 'tk_test_xxxxxxxxxxxxxxxx', status: 'Active', created: '2026-07-20' },
  ];
  
  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'key', header: 'API Key' },
    { key: 'status', header: 'Status' },
    { key: 'created', header: 'Created At' },
  ];

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
                  <Button renderIcon={Add}>Generate New Key</Button>
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
