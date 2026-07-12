'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Header,
  HeaderName,
  Theme,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content
} from '@carbon/react';
import { Dashboard, Api, Code, UserSpeaker, Phone, PhoneBlock, Workspace } from '@carbon/icons-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
    router.refresh();
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (!isClient) return null; // Avoid hydration mismatch

  if (isAuthPage) {
    return (
      <Theme theme="g100">
        <div style={{ minHeight: '100vh', background: '#161616', color: '#f4f4f4' }}>
          {children}
        </div>
      </Theme>
    );
  }

  return (
    <Theme theme="g100">
      <Header aria-label="Omni-Industry CPaaS">
        <HeaderName href="/" prefix="CPaaS">
          Developer Console
        </HeaderName>
      </Header>
      <SideNav aria-label="Side navigation" expanded={true} isFixedNav>
        <SideNavItems>
          <SideNavLink renderIcon={Dashboard} as={Link} href="/" isActive={pathname === '/'}>Dashboard</SideNavLink>
          <SideNavLink renderIcon={UserSpeaker} as={Link} href="/agents" isActive={pathname.startsWith('/agents')}>AI Agents</SideNavLink>
          <SideNavLink renderIcon={Phone} as={Link} href="/telecom" isActive={pathname.startsWith('/telecom')}>Phone Numbers</SideNavLink>
          <SideNavLink renderIcon={Workspace} as={Link} href="/sip-accounts" isActive={pathname.startsWith('/sip-accounts')}>SIP Accounts</SideNavLink>
          <SideNavLink renderIcon={PhoneBlock} as={Link} href="/calls" isActive={pathname.startsWith('/calls')}>Call Logs</SideNavLink>
          <SideNavLink renderIcon={Api} as={Link} href="/api-keys" isActive={pathname.startsWith('/api-keys')}>API Keys</SideNavLink>
          <SideNavLink renderIcon={Code} as={Link} href="/webhooks" isActive={pathname.startsWith('/webhooks')}>Webhooks</SideNavLink>
          
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #393939' }}>
            <SideNavLink onClick={handleLogout} style={{ cursor: 'pointer', color: '#da1e28' }}>
              Logout
            </SideNavLink>
          </div>
        </SideNavItems>
      </SideNav>
      <Content style={{ paddingTop: '3rem', marginLeft: '16rem', minHeight: '100vh', padding: '2rem' }}>
        {children}
      </Content>
    </Theme>
  );
}
