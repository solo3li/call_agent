'use client';
import React from 'react';
import {
  Header,
  HeaderName,
  Theme,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content
} from '@carbon/react';
import { Dashboard, Api, Code } from '@carbon/icons-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme="g100">
      <Header aria-label="Omni-Industry CPaaS">
        <HeaderName href="/" prefix="CPaaS">
          Developer Console
        </HeaderName>
      </Header>
      <SideNav aria-label="Side navigation" expanded={true} isFixedNav>
        <SideNavItems>
          <SideNavLink renderIcon={Dashboard} as={Link} href="/">Dashboard</SideNavLink>
          <SideNavLink renderIcon={Api} as={Link} href="/api-keys">API Keys</SideNavLink>
          <SideNavLink renderIcon={Code} as={Link} href="/webhooks">Webhooks</SideNavLink>
        </SideNavItems>
      </SideNav>
      <Content style={{ paddingTop: '3rem', marginLeft: '16rem', minHeight: '100vh', padding: '2rem' }}>
        {children}
      </Content>
    </Theme>
  );
}
