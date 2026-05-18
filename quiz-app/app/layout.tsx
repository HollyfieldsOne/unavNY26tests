import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance — Session 1 | Attention Check",
  description: "Finance Session 1 Attention Check Quiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#0a0a0f' }}>
      <body style={{ minHeight: '100vh', background: '#0a0a0f' }}>{children}</body>
    </html>
  );
}
