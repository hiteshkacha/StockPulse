import type { Metadata } from 'next';
import './globals.css';
import { InventoryProvider } from '@/context/InventoryContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalDrawersHost } from '@/components/drawers/GlobalDrawersHost';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'StockPulse — Inventory Management',
  description: 'Clean, modern inventory management platform for B2B SMBs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <InventoryProvider>
          <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Canvas with 60 (240px) left offset on desktop */}
            <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
              <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
                <Header />
                {children}
              </main>
            </div>
          </div>

          {/* Centralized Slide-Over Drawers */}
          <GlobalDrawersHost />

          {/* Toast notifications */}
          <Toaster richColors position="top-right" closeButton duration={3500} />
        </InventoryProvider>
      </body>
    </html>
  );
}
