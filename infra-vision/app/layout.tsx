// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

