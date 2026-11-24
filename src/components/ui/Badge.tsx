import React from 'react';
import { cn } from '@/lib/format';
import { StockStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: StockStatus | 'Paid' | 'Pending' | 'Received';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let colorClass = '';
  let dotClass = '';

  switch (status) {
    case 'In Stock':
    case 'Paid':
    case 'Received':
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotClass = 'bg-emerald-500';
      break;

    case 'Low Stock':
    case 'Pending':
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      dotClass = 'bg-amber-500';
      break;

    case 'Out of Stock':
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      dotClass = 'bg-rose-500';
      break;

    default:
      colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
      dotClass = 'bg-slate-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border select-none whitespace-nowrap',
        colorClass,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />
      {status}
    </span>
  );
}

export function SkuBadge({ sku }: { sku: string }) {
  return (
    <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 whitespace-nowrap">
      {sku}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 whitespace-nowrap">
      {category}
    </span>
  );
}
