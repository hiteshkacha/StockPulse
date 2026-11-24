'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Boxes,
  BarChart3,
  RotateCcw,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { selectLowStockCount, selectOutOfStockCount } from '@/lib/selectors';
import { cn } from '@/lib/format';

export function Sidebar() {
  const pathname = usePathname();
  const { state, resetDemoData } = useInventory();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const lowStockCount = selectLowStockCount(state);
  const outOfStockCount = selectOutOfStockCount(state);
  const totalAlertCount = lowStockCount + outOfStockCount;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sales', href: '/sales', icon: Receipt },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
    {
      name: 'Stock',
      href: '/stock',
      icon: Boxes,
      alertCount: totalAlertCount > 0 ? totalAlertCount : null,
    },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 w-60 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Activity size={16} />
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight text-sm block">
              StockPulse
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5">Inventory Manager</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'group flex items-center justify-between px-3 h-9 rounded-lg text-sm transition-colors relative',
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
            >
              {/* 2px left indicator on active item */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-indigo-500" />
              )}
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>

              {/* Red dot/number ONLY on Stock for low-stock count */}
              {item.alertCount && (
                <span className="h-5 px-1.5 min-w-[20px] rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {item.alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with Reset Demo Data */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to the clean initial seed?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors"
          title="Restore original seed sample data"
        >
          <RotateCcw size={14} className="text-slate-400" />
          <span>Reset demo data</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-slate-800/80 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden h-14 bg-slate-950 text-white px-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">StockPulse</span>
        </div>
        {totalAlertCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30">
            {totalAlertCount} low stock
          </span>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 w-60 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
