'use client';

import { Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, Button, TableToolbar, TableToolbarContent } from '@carbon/react';
import { Add } from '@carbon/icons-react';

export default function ContactsPage() {
  const rows = [
    { id: '1', name: 'Alice Smith', extension: '1002', department: 'Sales', status: 'Available' },
    { id: '2', name: 'Bob Jones', extension: '1003', department: 'Support', status: 'In a call' },
    { id: '3', name: 'Charlie Davis', extension: '1004', department: 'Engineering', status: 'Offline' },
  ];
  
  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'extension', header: 'Extension' },
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Company Directory</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Find and call your colleagues easily.
        </p>
      </Column>
      
      <Column lg={16} md={8} sm={4}>
        <DataTable rows={rows} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Internal Contacts">
              <TableToolbar>
                <TableToolbarContent>
                  <Button renderIcon={Add}>Add Contact</Button>
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
