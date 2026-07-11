'use client';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button } from '@carbon/react';

const headers = [
  { key: 'name', header: 'Key Name' },
  { key: 'prefix', header: 'Prefix' },
  { key: 'created', header: 'Created At' }
];
const rows = [
  { id: '1', name: 'Production', prefix: 'sk_live_****', created: '2026-07-10' },
  { id: '2', name: 'Development', prefix: 'sk_test_****', created: '2026-07-11' }
];

export default function ApiKeys() {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>API Keys</h1>
      <Button style={{ marginBottom: '1rem' }}>Generate New Key</Button>
      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
}
