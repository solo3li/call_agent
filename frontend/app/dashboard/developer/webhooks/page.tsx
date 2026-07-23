'use client';

import { Grid, Column, TextInput, Button, Tile } from '@carbon/react';
import { Save } from '@carbon/icons-react';

export default function WebhooksPage() {
  return (
    <Grid>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: '1.5rem' }}>Webhooks</h1>
        <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>
          Configure the URLs we should call when events happen on your account, such as incoming calls or messages.
        </p>
      </Column>
      
      <Column lg={10} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: '1.5rem' }}>Global Call URL</h3>
          <p style={{ marginBottom: '1rem', color: '#a8a8a8' }}>
            This URL will receive a POST request whenever any of your numbers receives an inbound call, unless overridden at the number level.
          </p>
          <TextInput 
            id="voice-url" 
            labelText="Voice Request URL" 
            placeholder="https://your-server.com/api/voice" 
            defaultValue="https://api.mycompany.com/twilio/voice"
            style={{ marginBottom: '1.5rem' }}
          />
          <Button renderIcon={Save}>Save Webhook</Button>
        </Tile>
      </Column>
    </Grid>
  );
}
