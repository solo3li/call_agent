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
import { Dashboard, Api, Code, UserSpeaker, Phone, PhoneBlock, Workspace, Logout } from '@carbon/icons-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('token');
    router.push('/login');
    router.refresh();
  };

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isUserDashboard = pathname.startsWith('/dashboard/user');

  if (!isClient) return null;

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
          {isUserDashboard ? "User Console" : "Developer Console"}
        </HeaderName>
      </Header>
      <SideNav aria-label="Side navigation" expanded={true} isFixedNav>
        <SideNavItems>
          {isUserDashboard ? (
            <>
              <SideNavLink renderIcon={Dashboard} as={Link} href="/dashboard/user" isActive={pathname === '/dashboard/user'}>My Dashboard</SideNavLink>
              <SideNavLink renderIcon={PhoneBlock} as={Link} href="/dashboard/user/calls" isActive={pathname.startsWith('/dashboard/user/calls')}>Call Logs</SideNavLink>
            </>
          ) : (
            <>
              <SideNavLink renderIcon={Dashboard} as={Link} href="/dashboard/developer" isActive={pathname === '/dashboard/developer'}>Dashboard</SideNavLink>
              <SideNavLink renderIcon={UserSpeaker} as={Link} href="/dashboard/developer/agents" isActive={pathname.startsWith('/dashboard/developer/agents')}>AI Agents</SideNavLink>
              <SideNavLink renderIcon={Phone} as={Link} href="/dashboard/developer/telecom" isActive={pathname.startsWith('/dashboard/developer/telecom')}>Phone Numbers</SideNavLink>
              <SideNavLink renderIcon={Workspace} as={Link} href="/dashboard/developer/sip-trunks" isActive={pathname.startsWith('/dashboard/developer/sip-trunks')}>SIP Trunks</SideNavLink>
              <SideNavLink renderIcon={Api} as={Link} href="/dashboard/developer/api-keys" isActive={pathname.startsWith('/dashboard/developer/api-keys')}>API Keys</SideNavLink>
              <SideNavLink renderIcon={Code} as={Link} href="/dashboard/developer/webhooks" isActive={pathname.startsWith('/dashboard/developer/webhooks')}>Webhooks</SideNavLink>
            </>
          )}
          
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #393939' }}>
            <SideNavLink renderIcon={Logout} onClick={handleLogout} href="#" style={{ cursor: 'pointer', color: '#da1e28' }}>
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
