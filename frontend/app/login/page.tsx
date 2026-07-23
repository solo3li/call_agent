'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'developer' | 'user'>('developer');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800; samesite=strict`;
        
        if (accountType === 'developer') {
          router.push('/dashboard/developer');
        } else {
          router.push('/dashboard/user');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} glass-panel`}>
        <h1 className={styles.logo}>CPaaS Platform</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
        
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              className={styles.input}
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              className={styles.input}
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Account Type</label>
            <div className={styles.accountTypeContainer}>
              <div 
                className={`${styles.typeCard} ${accountType === 'developer' ? styles.selected : ''}`}
                onClick={() => setAccountType('developer')}
              >
                <div className={styles.typeIcon}>💻</div>
                <div className={styles.typeTitle}>Developer</div>
              </div>
              
              <div 
                className={`${styles.typeCard} ${accountType === 'user' ? styles.selected : ''}`}
                onClick={() => setAccountType('user')}
              >
                <div className={styles.typeIcon}>🎧</div>
                <div className={styles.typeTitle}>Regular User</div>
              </div>
            </div>
          </div>
          
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className={styles.linkText}>
          Don't have an account? 
          <Link href="/register" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
