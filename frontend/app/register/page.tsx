'use client';

import { useState } from 'react';
import { Form, TextInput, Button, InlineNotification } from '@carbon/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantName }),
      });

      const data = await res.json();
      if (res.ok) {
        // Auto-login after register
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          document.cookie = `token=${loginData.token}; path=/; max-age=604800; samesite=strict`;
          router.push('/');
          router.refresh();
        } else {
          router.push('/login');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#262626' }}>
      <h1 style={{ marginBottom: '1rem', color: '#f4f4f4' }}>Register</h1>
      <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>Create a new tenant workspace for your company</p>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '1rem' }} />}

      <Form onSubmit={handleRegister}>
        <TextInput
          id="tenantName"
          type="text"
          labelText="Company Name (Workspace)"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
          style={{ marginBottom: '1rem' }}
        />
        <TextInput
          id="email"
          type="email"
          labelText="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '1rem' }}
        />
        <TextInput
          id="password"
          type="password"
          labelText="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '2rem' }}
        />
        <Button type="submit" disabled={loading} style={{ width: '100%', marginBottom: '1rem' }}>
          {loading ? 'Registering...' : 'Register Account'}
        </Button>
      </Form>
      
      <p style={{ marginTop: '1rem', color: '#c6c6c6', textAlign: 'center' }}>
        Already have an account? <Link href="/login" style={{ color: '#0f62fe' }}>Login here</Link>
      </p>
    </div>
  );
}
