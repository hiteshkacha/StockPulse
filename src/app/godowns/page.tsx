'use client';

import React from 'react';
import {
  Warehouse,
  ArrowRightLeft,
  MapPin,
  User,
  Phone,
  Boxes,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR, formatRelativeTime } from '@/lib/utils';
import { SkuBadge } from '@/components/common/Badge';

export default function GodownsPage() {
  const { state, openTransferDrawer } = useInventory();

  // Compute stats for each godown
  const godownStats = state.godowns.map((g) => {
    let totalUnits = 0;
    let totalValuation = 0;
    const storedItems: Array<{
      id: string;
      sku: string;
      name: string;
      units: number;
      value: number;
      unit: string;
    }> = [];

    state.products.forEach((p) => {
      const count = p.godownStock[g.id] || 0;
      if (count > 0) {
        totalUnits += count;
        const val = count * p.costPrice;
        totalValuation += val;
        storedItems.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          units: count,
          value: val,
          unit: p.unit,
        });
      }
    });

    const capacityPercentage = Math.min(100, Math.round((totalUnits / (g.capacity || 1)) * 100));

    return {
      godown: g,
      totalUnits,
      totalValuation,
      capacityPercentage,
      storedItems: storedItems.sort((a, b) => b.units - a.units),
    };
  });

  // Recent transfer movements
  const transferMovements = state.stockMovements.filter((m) => m.type === 'TRANSFER');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Godown Warehouses & Depot Logistics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Regional warehouse hubs, facility utilization capacity, and inter-depot transit logs.
          </p>
        </div>

        <button
          onClick={() => openTransferDrawer()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>+ Transfer Stock</span>
        </button>
      </div>

      {/* Godown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {godownStats.map(({ godown, totalUnits, totalValuation, capacityPercentage, storedItems }) => (
          <div
            key={godown.id}
            className="rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Top Details */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-[11px] font-bold text-indigo-600 uppercase">
                    {godown.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{godown.name}</h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Warehouse className="h-4 w-4" />
                </div>
              </div>

              {/* Manager & Address */}
              <div className="py-3 space-y-1.5 text-xs text-slate-500 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-800 font-medium">{godown.manager}</span>
                  <span className="text-slate-300">•</span>
                  <span>{godown.contact}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight text-slate-600">{godown.address}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 py-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Holding Units
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {totalUnits}{' '}
                    <span className="text-xs font-normal text-slate-500">items</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Stock Valuation
                  </span>
                  <span className="text-base font-bold font-mono text-indigo-600 tabular-nums">
                    {formatINR(totalValuation)}
                  </span>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                  <span>Warehouse Capacity</span>
                  <span className="font-mono">
                    {totalUnits} / {godown.capacity} units ({capacityPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      capacityPercentage > 85
                        ? 'bg-rose-500'
                        : capacityPercentage > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stored items summary */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Inventory Stored ({storedItems.length} SKUs)
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {storedItems.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50/60"
                    >
                      <span className="truncate max-w-[160px] text-slate-700 font-medium">
                        {it.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums text-[11px]">
                        {it.units} {it.unit}
                      </span>
                    </div>
                  ))}
                  {storedItems.length > 4 && (
                    <div className="text-[11px] text-center text-slate-400 pt-1">
                      +{storedItems.length - 4} more SKUs in facility
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => openTransferDrawer()}
                className="w-full py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Initiate Inter-Depot Transfer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inter-Godown Transfer Log */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Inter-Godown Transfer Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Audit record of internal transit movements between Mumbai, Ahmedabad, and Delhi.
            </p>
          </div>
          <Clock className="h-4 w-4 text-slate-400" />
        </div>

        {transferMovements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No inter-godown transfers executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Transfer Ref</th>
                  <th className="py-2.5 px-4">Product & SKU</th>
                  <th className="py-2.5 px-4">Origin Hub</th>
                  <th className="py-2.5 px-4">Destination Hub</th>
                  <th className="py-2.5 px-4">Date / Time</th>
                  <th className="py-2.5 px-4">Challan Memo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferMovements.map((tx) => {
                  const fromG = state.godowns.find((g) => g.id === tx.fromGodownId);
                  const toG = state.godowns.find((g) => g.id === tx.toGodownId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {tx.referenceId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{tx.productName}</span>
                        <span className="block font-mono text-[11px] text-slate-400">{tx.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {fromG?.city || tx.fromGodownId || 'Origin'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {toG?.city || tx.toGodownId || 'Destination'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatRelativeTime(tx.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-sm truncate">
                        {tx.notes}
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
  );
}
