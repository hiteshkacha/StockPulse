import type { Metadata } from 'next';
import './globals.css';
import { InventoryProvider } from '@/context/InventoryContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { GlobalDrawersHost } from '@/components/drawers/GlobalDrawersHost';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'StockPulse — Modern Inventory & Operations Platform',
  description: 'Enterprise-grade inventory, multi-godown stock management, and GST invoicing for modern SMBs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-slate-50/90 text-slate-900 antialiased">
        <InventoryProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col min-w-0">
              <TopHeader />
              <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Centralized Modals & Drawers */}
          <GlobalDrawersHost />

          {/* Toast notifications */}
          <Toaster richColors position="top-right" closeButton />
        </InventoryProvider>
      </body>
    </html>
  );
}
