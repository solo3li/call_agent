import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omni-Industry Voice AI CPaaS",
  description: "Admin Panel for Voice AI CPaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
