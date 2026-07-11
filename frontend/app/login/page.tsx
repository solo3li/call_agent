'use client';

import { useState } from 'react';
import { Form, TextInput, Button, InlineNotification } from '@carbon/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=604800; samesite=strict`;
        router.push('/');
        router.refresh();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#262626' }}>
      <h1 style={{ marginBottom: '1rem', color: '#f4f4f4' }}>Login</h1>
      <p style={{ marginBottom: '2rem', color: '#c6c6c6' }}>Welcome back to Omni-Industry Voice AI CPaaS</p>

      {error && <InlineNotification kind="error" title="Error" subtitle={error} style={{ marginBottom: '1rem' }} />}

      <Form onSubmit={handleLogin}>
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
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
      
      <p style={{ marginTop: '1rem', color: '#c6c6c6', textAlign: 'center' }}>
        Don't have an account? <Link href="/register" style={{ color: '#0f62fe' }}>Register here</Link>
      </p>
    </div>
  );
}
