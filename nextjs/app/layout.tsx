import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import NewRelicBrowserAgentLoader from '@/components/NewRelicBrowserAgentLoader';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'New Relic Demo — Next.js',
  description: 'Demonstrates New Relic Browser & Synthetic Monitoring with a Next.js frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <NewRelicBrowserAgentLoader />
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">{children}</main>
        <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          New Relic Browser &amp; Synthetic Monitoring Demo
        </footer>
      </body>
    </html>
  );
}
