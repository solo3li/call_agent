"use client";

import React from 'react';
import { Button, DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { Add } from '@carbon/icons-react';

const tenantData = [
  { id: '1', name: 'Acme Corp', domain: 'acme.cpaas.com', plan: 'Enterprise', activeCalls: 12, revenue: '$1,200', status: 'Active' },
  { id: '2', name: 'TechFlow', domain: 'techflow.cpaas.com', plan: 'Pro', activeCalls: 3, revenue: '$450', status: 'Active' },
  { id: '3', name: 'Local Shop', domain: 'shop.cpaas.com', plan: 'Starter', activeCalls: 0, revenue: '$50', status: 'Suspended' },
];

const headers = [
  { key: 'name', header: 'Tenant Name' },
  { key: 'domain', header: 'Subdomain' },
  { key: 'plan', header: 'Plan' },
  { key: 'activeCalls', header: 'Active Calls' },
  { key: 'revenue', header: 'Monthly MRR' },
  { key: 'status', header: 'Status' },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Global Metrics Dashboard</h1>
          <p className="text-[#a8a8a8] mt-2">Monitor all tenants, revenue, and platform health.</p>
        </div>
        <Button renderIcon={Add}>Provision New Tenant</Button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#262626] p-6 border border-[#393939] rounded">
          <h3 className="text-sm text-[#a8a8a8]">Total MRR</h3>
          <p className="text-3xl font-bold text-white mt-2">$42,500</p>
          <span className="text-green-400 text-xs">+12% this month</span>
        </div>
        <div className="bg-[#262626] p-6 border border-[#393939] rounded">
          <h3 className="text-sm text-[#a8a8a8]">Active Tenants</h3>
          <p className="text-3xl font-bold text-white mt-2">1,240</p>
          <span className="text-green-400 text-xs">+45 this week</span>
        </div>
        <div className="bg-[#262626] p-6 border border-[#393939] rounded border-l-4 border-l-[#4589ff]">
          <h3 className="text-sm text-[#a8a8a8]">Live AI Sessions</h3>
          <p className="text-3xl font-bold text-white mt-2">156</p>
          <span className="text-[#4589ff] text-xs">Currently ongoing</span>
        </div>
        <div className="bg-[#262626] p-6 border border-[#393939] rounded">
          <h3 className="text-sm text-[#a8a8a8]">System Error Rate</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">0.02%</p>
          <span className="text-[#a8a8a8] text-xs">All systems operational</span>
        </div>
      </div>

      <div className="dark-theme-datatable">
        <DataTable rows={tenantData} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title="Recent Tenants" className="bg-[#262626] text-white border border-[#393939]">
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} className="bg-[#393939] text-white">
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} className="hover:bg-[#393939]">
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} className="text-[#f4f4f4]">
                          {cell.value}
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
    </div>
  );
}
