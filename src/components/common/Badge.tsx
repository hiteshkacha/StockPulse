import React from 'react';
import { cn } from '@/lib/utils';
import { StockStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: StockStatus | 'Paid' | 'Pending' | 'Received' | 'Cancelled';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  let colorStyles = '';
  let dotStyles = '';

  switch (status) {
    case 'In Stock':
    case 'Paid':
    case 'Received':
      colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotStyles = 'bg-emerald-500';
      break;

    case 'Low Stock':
    case 'Pending':
      colorStyles = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotStyles = 'bg-amber-500';
      break;

    case 'Out of Stock':
    case 'Cancelled':
      colorStyles = 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotStyles = 'bg-rose-500';
      break;

    default:
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotStyles = 'bg-slate-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors select-none',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colorStyles
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotStyles)} />
      {status}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200/60">
      {category}
    </span>
  );
}

interface SkuBadgeProps {
  sku: string;
}

export function SkuBadge({ sku }: SkuBadgeProps) {
  return (
    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80">
      {sku}
    </span>
  );
}
