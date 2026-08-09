"use client";

import React from 'react';
import Link from 'next/link';
import { ChartLine, UserMultiple, Security, Settings } from '@carbon/icons-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#161616] text-[#f4f4f4]">
      {/* Super Admin Sidebar (Dark Theme) */}
      <aside className="w-64 border-r border-[#393939] bg-[#262626] flex flex-col">
        <div className="p-6 border-b border-[#393939]">
          <h1 className="text-xl font-bold tracking-wider text-white">SaaS ADMIN</h1>
          <p className="text-xs text-[#a8a8a8] mt-1">Super User Portal</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center px-6 py-3 text-sm hover:bg-[#393939] transition-colors">
                <ChartLine className="mr-3" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/tenants" className="flex items-center px-6 py-3 text-sm hover:bg-[#393939] transition-colors">
                <UserMultiple className="mr-3" /> Tenants Management
              </Link>
            </li>
            <li>
              <Link href="/admin/impersonate" className="flex items-center px-6 py-3 text-sm hover:bg-[#393939] transition-colors text-[#4589ff]">
                <Security className="mr-3" /> Impersonation & Auth
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center px-6 py-3 text-sm hover:bg-[#393939] transition-colors">
                <Settings className="mr-3" /> Global Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-[#393939]">
          <button className="w-full text-left px-4 py-2 text-sm text-[#fa4d56] hover:bg-[#393939] rounded">
            Log out Super Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#161616]">
        {children}
      </main>
    </div>
  );
}
