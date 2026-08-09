import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@carbon/styles/css/styles.css';
import "./globals.css";
import AdminLayout from "../components/AdminLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omni-Industry Voice AI CPaaS",
  description: "Developer Console for Voice AI CPaaS",
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simulate Next.js Middleware injecting Tenant Branding based on Subdomain
  const headersList = await headers();
  const brandJson = headersList.get("x-tenant-brand");
  
  let customStyle = {};
  if (brandJson) {
    try {
      const brand = JSON.parse(brandJson);
      customStyle = {
        '--brand-primary': brand.primary_color,
        '--cpaas-primary': brand.primary_color,
      };
    } catch (e) {
      // ignore parse errors
    }
  }

  return (
    <html lang="en">
      <body className={inter.className} style={customStyle}>
        <AdminLayout>
            {children}
        </AdminLayout>
      </body>
    </html>
  );
}
