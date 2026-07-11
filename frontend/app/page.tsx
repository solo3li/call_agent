'use client';
import { Grid, Column, Tile, Button } from '@carbon/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [agentsCount, setAgentsCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/agents')
      .then(res => res.json())
      .then(data => setAgentsCount(data.length))
      .catch(err => console.error('Error fetching agents:', err));
  }, []);
  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Overview</h1>
      </Column>
      <Column lg={8} md={4} sm={4}>
        <Tile>
          <h3>Active Agents</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{agentsCount !== null ? agentsCount : 'Loading...'}</p>
        </Tile>
      </Column>
      <Column lg={8} md={4} sm={4}>
        <Tile>
          <h3>Minutes Used (This Month)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,432</p>
        </Tile>
      </Column>
      <Column lg={16} md={8} sm={4} style={{ marginTop: '2rem' }}>
        <Button as={Link} href="/agents/new">Create New Agent</Button>
      </Column>
    </Grid>
  );
}
