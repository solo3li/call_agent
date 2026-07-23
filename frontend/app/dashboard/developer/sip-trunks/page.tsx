'use client';

import { Grid, Column, Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent } from '@carbon/react';
import { Add } from '@carbon/icons-react';

export default function SipTrunksPage() {
  const rows = [
    { id: '1', name: 'Main HQ PBX', username: '1001', domain: 'cpaas.yourdomain.com', status: 'Registered' },
  ];
  
  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'SIP Username' },
    { key: 'domain', header: 'SIP Domain' },
    { key: 'status', header: 'Status' },
  ];

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
                  <Button renderIcon={Add}>Create SIP Endpoint</Button>
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
