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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayout>
            {children}
        </AdminLayout>
      </body>
    </html>
  );
}
