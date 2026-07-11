'use client';
import { Form, FormGroup, TextInput, Button } from '@carbon/react';

export default function Webhooks() {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Webhooks & Functions</h1>
      <p style={{ marginBottom: '2rem' }}>Configure where the AI agent should send execution payloads.</p>
      
      <Form>
        <FormGroup legendText="Global Webhook Settings">
          <TextInput 
            id="webhook-url" 
            labelText="Webhook URL" 
            placeholder="https://your-server.com/api/webhook" 
            style={{ marginBottom: '1rem' }}
          />
          <TextInput 
            id="webhook-secret" 
            labelText="Webhook Secret (for signature verification)" 
            type="password"
            placeholder="whsec_***" 
            style={{ marginBottom: '1rem' }}
          />
        </FormGroup>
        <Button type="submit">Save Settings</Button>
      </Form>
    </div>
  );
}
