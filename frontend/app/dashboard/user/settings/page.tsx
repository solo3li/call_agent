'use client';

import { Grid, Column, Tile, Toggle, TextInput, Button } from '@carbon/react';
import { Save } from '@carbon/icons-react';

export default function SettingsPage() {
  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Call Settings</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Configure your personal call routing preferences.
        </p>
      </Column>
      
      <Column lg={8} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1.5rem' }}>Do Not Disturb (DND)</h3>
          <p style={{ marginBottom: '1.5rem', color: '#a8a8a8' }}>
            When enabled, all incoming calls will go straight to voicemail.
          </p>
          <Toggle 
            id="dnd-toggle"
            labelText="DND Status"
            labelA="Off"
            labelB="On"
          />
        </Tile>
      </Column>

      <Column lg={8} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1.5rem' }}>Call Forwarding</h3>
          <p style={{ marginBottom: '1.5rem', color: '#a8a8a8' }}>
            Forward calls to your mobile phone if you don't answer within 15 seconds.
          </p>
          <Toggle 
            id="forward-toggle"
            labelText="Enable Forwarding"
            labelA="Off"
            labelB="On"
            style={{ marginBottom: '1rem' }}
          />
          <TextInput 
            id="forward-number" 
            labelText="Mobile Number" 
            placeholder="+1 234 567 8900" 
            style={{ marginBottom: '1.5rem' }}
          />
          <Button renderIcon={Save}>Save Settings</Button>
        </Tile>
      </Column>
    </Grid>
  );
}
