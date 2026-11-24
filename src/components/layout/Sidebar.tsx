'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Boxes,
  BarChart3,
  Warehouse,
  RotateCcw,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { metrics, resetDemoData } = useInventory();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Sales & Invoices',
      href: '/sales',
      icon: Receipt,
      badge: metrics.pendingSalesRevenue > 0 ? 'Pending' : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      name: 'Purchase Orders',
      href: '/purchases',
      icon: ShoppingCart,
      badge: metrics.pendingPurchasesCount > 0 ? metrics.pendingPurchasesCount : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Stock Master',
      href: '/stock',
      icon: Boxes,
      badge: metrics.lowStockCount + metrics.outOfStockCount > 0 
        ? `${metrics.lowStockCount + metrics.outOfStockCount} Low` 
        : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Godowns & Transfers',
      href: '/godowns',
      icon: Warehouse,
      badge: '3 Hubs',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 select-none shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">StockPulse</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">SMB Inventory Edition</p>
          </div>
        </div>
      </div>

      {/* Workspace pill */}
      <div className="px-4 py-3 border-b border-slate-900 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Godown Live</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v1.2.0</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-indigo-500" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Summary Pill in Sidebar */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Active SKUs
          </span>
          <span className="font-mono font-bold text-white">{metrics.totalSKUs}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full"
            style={{
              width: `${Math.round(((metrics.totalSKUs - metrics.lowStockCount - metrics.outOfStockCount) / (metrics.totalSKUs || 1)) * 100)}%`,
            }}
          />
          <div
            className="bg-amber-500 h-full"
            style={{
              width: `${Math.round((metrics.lowStockCount / (metrics.totalSKUs || 1)) * 100)}%`,
            }}
          />
          <div
            className="bg-rose-500 h-full"
            style={{
              width: `${Math.round((metrics.outOfStockCount / (metrics.totalSKUs || 1)) * 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
          <span>In Stock</span>
          <span className="text-amber-400">{metrics.lowStockCount} Low</span>
          <span className="text-rose-400">{metrics.outOfStockCount} Out</span>
        </div>
      </div>

      {/* Sidebar Footer with Reset Demo Data */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/90 space-y-2">
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to realistic SMB sample dataset?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors"
          title="Restore original seed data"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>
        <p className="text-[11px] text-center text-slate-400">
          SasthaSoft Evaluation Task
        </p>
      </div>
    </aside>
  );
}
