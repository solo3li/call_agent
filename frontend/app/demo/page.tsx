"use client";

import React, { useState } from 'react';
import { CpaasPanel } from '../sdk/CpaasPanel';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';

export default function DemoPage() {
  const [themeColor, setThemeColor] = useState('#0f62fe');
  
  const customTheme = {
    '--cpaas-primary': themeColor,
    '--cpaas-primary-hover': themeColor,
  };

  return (
    <div className="p-8 h-full bg-white relative">
      <Breadcrumb>
        <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/demo">SDK Demo</BreadcrumbItem>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold mt-4 mb-2">SDK Embed Demo</h1>
      <p className="text-gray-600 mb-8">This page demonstrates how your clients will embed the SDK into their own websites.</p>
      
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200">
        <h3 className="font-bold mb-4">Live Theme Customizer</h3>
        <label className="block mb-2 text-sm font-medium">Brand Color</label>
        <input 
          type="color" 
          value={themeColor} 
          onChange={(e) => setThemeColor(e.target.value)}
          className="w-16 h-10 border-none cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Embedded Mode</h2>
          <div className="border border-gray-300 rounded shadow-sm w-[400px]">
            <CpaasPanel apiKey="test-key" mode="embedded" theme={customTheme} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Floating Mode (Default)</h2>
          <p className="text-sm text-gray-500 mb-4">Check the bottom right corner of this page to see the floating widget bubble.</p>
          <CpaasPanel apiKey="test-key" mode="floating" theme={customTheme} />
        </div>
      </div>
      
    </div>
  );
}
