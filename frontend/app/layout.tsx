import type { Metadata } from "next";
import "./globals.css";
import AdminLayout from "../components/AdminLayout";

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
      <body>
        <AdminLayout>
            {children}
        </AdminLayout>
      </body>
    </html>
  );
}
