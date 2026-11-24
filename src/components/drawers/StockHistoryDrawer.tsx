'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { formatINR, formatRelativeTime } from '@/lib/utils';
import { StatusBadge, SkuBadge } from '@/components/common/Badge';

export function StockHistoryDrawer() {
  const { state, drawerState, closeStockHistoryDrawer } = useInventory();

  const product = state.products.find((p) => p.id === drawerState.stockHistoryProductId);

  // Filter movements for this specific product
  const movements = product
    ? state.stockMovements.filter((m) => m.productId === product.id)
    : [];

  if (!product) return null;

  return (
    <DrawerContainer
      isOpen={drawerState.isStockHistoryOpen}
      onClose={closeStockHistoryDrawer}
      title={`${product.name} — Audit Ledger`}
      subtitle={`Chronological inventory audit trail for ${product.sku}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Product Snapshot Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400">{product.sku}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300">{product.category}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{product.name}</h3>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Current Stock</span>
              <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {product.currentStock} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Minimum Level</span>
              <span className="text-base font-bold font-mono text-amber-400 tabular-nums">
                {product.minLevel} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Unit Cost</span>
              <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                {formatINR(product.costPrice)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Asset Value</span>
              <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
                {formatINR(product.currentStock * product.costPrice)}
              </span>
            </div>
          </div>

          {/* Godown breakdown */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">Depot Distribution:</span>
            {state.godowns.map((g) => (
              <span
                key={g.id}
                className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono"
              >
                {g.city}: <strong className="text-white">{product.godownStock[g.id] || 0}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Chronological Ledger Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Trail Ledger ({movements.length} transactions)
            </h4>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Live audit ledger
            </span>
          </div>

          {movements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
              No transactions recorded for this item yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Date / Type</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Delta</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3">Transaction Memo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => {
                    let typeBadge = null;
                    if (m.type === 'PURCHASE_IN') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowDownLeft className="h-3 w-3" /> IN
                        </span>
                      );
                    } else if (m.type === 'SALE_OUT') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ArrowUpRight className="h-3 w-3" /> OUT
                        </span>
                      );
                    } else if (m.type === 'TRANSFER') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <ArrowRightLeft className="h-3 w-3" /> TRANSFER
                        </span>
                      );
                    } else if (m.type === 'ADJUSTMENT') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <SlidersHorizontal className="h-3 w-3" /> ADJ
                        </span>
                      );
                    } else {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Sparkles className="h-3 w-3" /> INIT
                        </span>
                      );
                    }

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {typeBadge}
                            <span className="text-slate-500 text-[11px]">
                              {formatRelativeTime(m.timestamp)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          {m.referenceId}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                            m.quantityDelta > 0
                              ? 'text-emerald-600'
                              : m.quantityDelta < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {m.runningBalance}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate" title={m.notes}>
                          {m.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DrawerContainer>
  );
}
