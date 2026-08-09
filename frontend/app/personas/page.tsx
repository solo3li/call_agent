"use client";

import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Link as CarbonLink
} from '@carbon/react';
import { Add, Store } from '@carbon/icons-react';
import Link from 'next/link';

export default function PersonasPage() {
  const [personas, setPersonas] = useState([]);
  
  useEffect(() => {
    // Fetch personas from API (mocked for now)
    setPersonas([
      { id: '1', name: 'Support Agent', provider: 'google', voice: 'Nova', active: 'Yes' },
      { id: '2', name: 'Sales Rep', provider: 'openai', voice: 'Alloy', active: 'No' },
    ]);
  }, []);

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'provider', header: 'Provider' },
    { key: 'voice', header: 'Voice ID' },
    { key: 'active', header: 'Active' },
    { key: 'actions', header: 'Actions' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Breadcrumb>
            <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/personas">Personas Engine</BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2 text-[var(--cds-text-01)]">Personas</h1>
          <p className="text-[var(--cds-text-02)]">Manage your AI personalities and voices.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/personas/marketplace" passHref legacyBehavior>
            <Button kind="secondary" renderIcon={Store}>Marketplace</Button>
          </Link>
          <Link href="/personas/new" passHref legacyBehavior>
            <Button renderIcon={Add}>Create From Zero</Button>
          </Link>
        </div>
      </div>

      <DataTable rows={personas} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer title="My Personas">
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
                      <TableCell key={cell.id}>
                        {cell.info.header === 'actions' ? (
                          <Link href={`/personas/${row.id}`} passHref legacyBehavior>
                            <CarbonLink>Edit</CarbonLink>
                          </Link>
                        ) : (
                          cell.value
                        )}
                      </TableCell>
                    ))}
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
