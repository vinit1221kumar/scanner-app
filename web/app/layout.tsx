import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scanner App',
  description: 'Laptop companion for phone-as-scanner workflow',
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
