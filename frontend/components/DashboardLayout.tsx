'use client';

import React, { useState } from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Theme
} from '@carbon/react';
import { User, Notification, Settings } from '@carbon/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
  userType
}: {
  children: React.ReactNode;
  userType: 'developer' | 'user';
}) {
  const pathname = usePathname();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);

  const devLinks = [
    { name: 'Overview', href: '/dashboard/developer' },
    { name: 'API Keys', href: '/dashboard/developer/api-keys' },
    { name: 'SIP Trunks', href: '/dashboard/developer/sip-trunks' },
    { name: 'Webhooks', href: '/dashboard/developer/webhooks' },
  ];

  const userLinks = [
    { name: 'Overview', href: '/dashboard/user' },
    { name: 'Web Phone', href: '/dashboard/user/web-phone' },
    { name: 'Contacts', href: '/dashboard/user/contacts' },
    { name: 'Settings', href: '/dashboard/user/settings' },
  ];

  const links = userType === 'developer' ? devLinks : userLinks;

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({ isSideNavExpanded: _is, onClickSideNavExpand }: any) => (
          <>
            <Header aria-label="CPaaS Dashboard">
              <SkipToContent />
              <HeaderName as={Link} href="/" prefix="CPaaS">
                {userType === 'developer' ? 'Developer Console' : 'User Portal'}
              </HeaderName>
              
              <HeaderGlobalBar>
                <HeaderGlobalAction aria-label="Notifications" tooltipAlignment="end">
                  <Notification size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction aria-label="User Avatar" tooltipAlignment="end">
                  <User size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>
              
              <SideNav
                aria-label="Side navigation"
                expanded={isSideNavExpanded}
                isPersistent={false}
                onOverlayClick={() => setIsSideNavExpanded(false)}
              >
                <SideNavItems>
                  {links.map((link) => (
                    <SideNavLink 
                      key={link.name}
                      as={Link} 
                      href={link.href}
                      isActive={pathname === link.href}
                    >
                      {link.name}
                    </SideNavLink>
                  ))}
                </SideNavItems>
              </SideNav>
            </Header>
          </>
        )}
      />
      <div style={{ paddingTop: '4rem', paddingLeft: '16rem', minHeight: '100vh', backgroundColor: '#161616', color: '#f4f4f4' }}>
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </div>
    </Theme>
  );
}
