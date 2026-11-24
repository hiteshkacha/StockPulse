import React from 'react';
import { cn } from '@/lib/format';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  subtextColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  subtextColor = 'text-slate-500',
  icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-semibold text-slate-900 tabular-nums tracking-tight">
          {value}
        </div>
        {subtext && <p className={cn('text-xs mt-1 truncate', subtextColor)}>{subtext}</p>}
      </div>
    </div>
  );
}
