'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>CPaaS Platform</div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#developers" className={styles.navLink}>Developers</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginBtn}>Sign In</Link>
          <Link href="/register" className={styles.signupBtn}>Start Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={styles.heroBadge}>✨ The Next Generation Communications API</div>
        <h1 className={styles.heroTitle}>
          Build powerful voice & SMS apps <span>in minutes.</span>
        </h1>
        <p className={styles.heroDesc}>
          Empower your business with enterprise-grade SIP trunking, WebRTC, and scalable APIs.
          Whether you're a developer or a business user, we have the tools you need.
        </p>
        <div className={styles.heroActions}>
          <Link href="/register" className={styles.primaryBtn}>Start Building Now</Link>
          <Link href="#features" className={styles.secondaryBtn}>Explore Features</Link>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need to scale</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Developer APIs</h3>
            <p>Integrate Voice, SMS, and SIP trunks into your applications with our robust, well-documented REST APIs and Webhooks.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎧</div>
            <h3>Cloud PBX & WebRTC</h3>
            <p>Empower your team with a built-in web phone. Make and receive calls directly from your browser without installing any software.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌍</div>
            <h3>Global Connectivity</h3>
            <p>Purchase phone numbers in over 100+ countries instantly. Route calls globally with ultra-low latency.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3>Enterprise Security</h3>
            <p>Advanced anti-fraud systems, IP whitelisting, and strict Geo-permissions keep your account and balance secure.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
