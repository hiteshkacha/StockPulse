'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const getPageInfo = () => {
    switch (pathname) {
      case '/':
        return {
          title: 'Dashboard',
          description: 'Live inventory metrics, procurement status, and critical stock alerts.',
        };
      case '/sales':
        return {
          title: 'Sales Orders',
          description: 'Customer order invoices, receivable collections, and real-time inventory deductions.',
        };
      case '/purchases':
        return {
          title: 'Purchase Orders',
          description: 'Vendor procurement orders, fulfillment tracking, and stock intake reconciliation.',
        };
      case '/stock':
        return {
          title: 'Stock Management',
          description: 'Centralized product catalogue, reorder thresholds, and chronological audit history.',
        };
      case '/reports':
        return {
          title: 'Reports & Analytics',
          description: 'Valuation summaries, sales performance, and supplier procurement breakdowns.',
        };
      default:
        return {
          title: 'StockPulse',
          description: 'Inventory Management Platform',
        };
    }
  };

  const info = getPageInfo();

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{info.title}</h1>
        <p className="text-xs text-slate-500 mt-1">{info.description}</p>
      </div>
    </div>
  );
}
