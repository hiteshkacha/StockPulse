'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge, SkuBadge, CategoryBadge } from '@/components/ui/Badge';
import { useInventory } from '@/context/InventoryContext';
import { formatDate, formatINR, formatRelativeTime } from '@/lib/format';
import { getProductStatus } from '@/lib/selectors';

export function StockHistoryDrawer() {
  const { state, drawerState, closeStockHistoryDrawer } = useInventory();

  const product = state.products.find((p) => p.id === drawerState.stockHistoryProductId);
  const movements = product
    ? state.stockMovements.filter((m) => m.productId === product.id)
    : [];

  if (!product) return null;

  const status = getProductStatus(product);

  return (
    <Drawer
      isOpen={drawerState.isStockHistoryOpen}
      onClose={closeStockHistoryDrawer}
      title={`${product.name} — History`}
      subtitle={`Audit ledger and movement history for ${product.sku}`}
      width="xl"
    >
      <div className="space-y-6">
        {/* Product Snapshot Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-medium">{product.sku}</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300">{product.category}</span>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Current Stock</span>
              <span className="text-lg font-semibold text-emerald-400 tabular-nums">
                {product.currentStock} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Min Threshold</span>
              <span className="text-lg font-semibold text-amber-400 tabular-nums">
                {product.minLevel} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Asset Valuation</span>
              <span className="text-sm font-semibold text-slate-200 tabular-nums">
                {formatINR(product.currentStock * product.costPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Timeline */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Movement Timeline ({movements.length} entries)
          </h3>

          {movements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No movement records found.</p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Delta</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => {
                    let typeBadge = null;
                    if (m.type === 'IN') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <ArrowDownLeft size={11} /> IN
                        </span>
                      );
                    } else if (m.type === 'OUT') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <ArrowUpRight size={11} /> OUT
                        </span>
                      );
                    } else if (m.type === 'ADJUSTMENT') {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          <SlidersHorizontal size={11} /> ADJ
                        </span>
                      );
                    } else {
                      typeBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          <Sparkles size={11} /> INIT
                        </span>
                      );
                    }

                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                          {formatDate(m.timestamp)}
                        </td>
                        <td className="py-2 px-3">{typeBadge}</td>
                        <td className="py-2 px-3 font-mono text-[11px] font-medium text-slate-800 whitespace-nowrap">
                          {m.referenceId}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-semibold tabular-nums whitespace-nowrap ${
                            m.quantityDelta > 0
                              ? 'text-emerald-600'
                              : m.quantityDelta < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {m.runningBalance}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-xs" title={m.notes}>
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
    </Drawer>
  );
}
