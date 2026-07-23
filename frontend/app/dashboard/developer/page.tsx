'use client';

import { Grid, Column, Tile } from '@carbon/react';

export default function DeveloperOverview() {
  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Developer Overview</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Monitor your API usage, active SIP trunks, and recent logs.
        </p>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Active API Keys</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#4589ff' }}>3</p>
        </Tile>
      </Column>
      
      <Column lg={5} md={4} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Active SIP Trunks</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600, color: '#24a148' }}>1</p>
        </Tile>
      </Column>
      
      <Column lg={6} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Account Balance</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 600 }}>$142.50</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4} style={{ marginTop: '2rem' }}>
        <Tile>
          <h3 style={{ marginBottom: '1rem' }}>Recent API Activity</h3>
          <p style={{ color: '#c6c6c6' }}>No recent errors detected in the last 24 hours.</p>
        </Tile>
      </Column>
    </Grid>
  );
}
