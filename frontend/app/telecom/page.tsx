'use client';
import React, { useEffect, useState } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Loading,
  InlineNotification,
  Modal,
  Dropdown
} from '@carbon/react';
import { Add, TrashCan, Network_1 } from '@carbon/icons-react';

export default function TelecomPage() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routingNumberId, setRoutingNumberId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [numRes, agentRes] = await Promise.all([
        fetch('/api/PhoneNumbers'),
        fetch('/api/Agents')
      ]);
      
      if (!numRes.ok || !agentRes.ok) throw new Error('Failed to fetch data');
      
      const numData = await numRes.json();
      const agentData = await agentRes.json();
      
      setPhoneNumbers(numData);
      setAgents(agentData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async () => {
    try {
      const res = await fetch('/api/PhoneNumbers/purchase', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to purchase number');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoute = async () => {
    try {
      const res = await fetch(`/api/PhoneNumbers/${routingNumberId}/route`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiAgentId: selectedAgentId })
      });
      if (!res.ok) throw new Error('Failed to update routing');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to release this phone number?')) return;
    try {
      const res = await fetch(`/api/PhoneNumbers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete number');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const headers = [
    { key: 'number', header: 'Phone Number' },
    { key: 'agentName', header: 'Routes To' },
    { key: 'createdAt', header: 'Purchased On' }
  ];

  const rows = phoneNumbers.map((p: any) => ({
    id: p.id,
    number: p.number,
    agentName: p.agentName || 'Unassigned (No Route)',
    createdAt: new Date(p.createdAt).toLocaleDateString(),
    aiAgentId: p.aiAgentId
  }));

  const agentOptions = [
    { id: 'null', text: 'Unassigned (No Route)' },
    ...agents.map((a: any) => ({ id: a.id, text: a.name }))
  ];

  if (loading && phoneNumbers.length === 0) return <Loading description="Loading" withOverlay={false} />;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>Phone Numbers</h1>
        <Button renderIcon={Add} onClick={handlePurchase}>
          Buy Number
        </Button>
      </div>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '2rem' }} />}

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }: any) => (
          <TableContainer title="Your Phone Numbers" description="Manage inbound SIP routing to your AI Agents.">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: any) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any) => {
                  const pNum = phoneNumbers.find((p: any) => p.id === row.id) as any;
                  return (
                    <TableRow key={row.id}>
                      {row.cells.map((cell: any) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell>
                        <Button 
                          size="sm" 
                          kind="ghost" 
                          renderIcon={Network_1} 
                          iconDescription="Configure Routing" 
                          hasIconOnly 
                          onClick={() => {
                            setRoutingNumberId(row.id);
                            setSelectedAgentId(pNum.aiAgentId || 'null');
                            setIsModalOpen(true);
                          }} 
                        />
                        <Button size="sm" kind="danger--ghost" renderIcon={TrashCan} iconDescription="Release" hasIconOnly onClick={() => handleDelete(row.id)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleRoute}
        modalHeading="Configure Inbound Routing"
        primaryButtonText="Save Route"
        secondaryButtonText="Cancel"
      >
        <div style={{ marginBottom: '1rem' }}>
          <p>Select which AI Agent should answer calls for this phone number.</p>
        </div>
        <Dropdown
          id="agent-dropdown"
          titleText="Route to Agent"
          label="Select an Agent"
          items={agentOptions}
          itemToString={(item: any) => (item ? item.text : '')}
          selectedItem={agentOptions.find(o => o.id === (selectedAgentId || 'null'))}
          onChange={({ selectedItem }: any) => setSelectedAgentId(selectedItem.id === 'null' ? null : selectedItem.id)}
        />
      </Modal>
    </div>
  );
}
