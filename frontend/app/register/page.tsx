'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function Register() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'developer' | 'user'>('developer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          tenantName: `${firstName} ${lastName}`
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Automatically log in after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.token) {
          localStorage.setItem('token', loginData.token);
          if (accountType === 'developer') {
            router.push('/dashboard/developer');
          } else {
            router.push('/dashboard/user');
          }
        } else {
          router.push('/login');
        }
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} glass-panel`}>
        <h1 className={styles.logo}>Create Account</h1>
        <p className={styles.subtitle}>Join the next-gen CPaaS platform</p>
        
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input 
                className={styles.input}
                type="text" 
                id="firstName" 
                placeholder="John" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input 
                className={styles.input}
                type="text" 
                id="lastName" 
                placeholder="Doe" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>

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
              placeholder="Create a strong password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={8}
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
                <div className={styles.typeDesc}>APIs, Webhooks, SIP Trunks</div>
              </div>
              
              <div 
                className={`${styles.typeCard} ${accountType === 'user' ? styles.selected : ''}`}
                onClick={() => setAccountType('user')}
              >
                <div className={styles.typeIcon}>🎧</div>
                <div className={styles.typeTitle}>Regular User</div>
                <div className={styles.typeDesc}>Web Phone & Cloud PBX</div>
              </div>
            </div>
          </div>
          
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className={styles.linkText}>
          Already have an account? 
          <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
