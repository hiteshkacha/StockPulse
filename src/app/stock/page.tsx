'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  History,
  ArrowRightLeft,
  Warehouse,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/utils';
import { StatusBadge, SkuBadge, CategoryBadge } from '@/components/common/Badge';

export default function StockPage() {
  const {
    state,
    metrics,
    openAddProductDrawer,
    openAdjustDrawer,
    openTransferDrawer,
    openStockHistoryDrawer,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');

  // Filter products
  const filteredProducts = state.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ? true : p.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'All' ? true : p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Electronics', 'Industrial Hardware', 'Packaging', 'Office Equipment'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Stock & Inventory Master
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance, multi-depot holdings, reorder thresholds, and immutable audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openAdjustDrawer()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => openAddProductDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Catalog SKUs</span>
            <Boxes className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-2 tabular-nums">
            {metrics.totalSKUs}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 major categories</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Healthy Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-emerald-600 mt-2 tabular-nums">
            {state.products.filter((p) => p.status === 'In Stock').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Above minimum threshold</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Low Stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-amber-600 mt-2 tabular-nums">
            {metrics.lowStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires procurement</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Depleted (Zero)</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-rose-600 mt-2 tabular-nums">
            {metrics.outOfStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Stock exhausted</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, SKU, or Supplier..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto text-xs font-medium">
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Depot Distribution</th>
                <th className="py-3 px-4 text-center">Stock Level & Threshold</th>
                <th className="py-3 px-4 text-right">Unit Economics (Cost / Sell)</th>
                <th className="py-3 px-4 text-right">Asset Valuation (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const percentage = Math.min(
                    100,
                    Math.round((p.currentStock / (p.minLevel || 1)) * 100)
                  );
                  const assetValue = p.currentStock * p.costPrice;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <SkuBadge sku={p.sku} />
                          <span className="font-semibold text-slate-900 truncate">
                            {p.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Supplier: {p.supplierName}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={p.category} />
                      </td>

                      {/* Godown distribution pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Mum: <strong>{p.godownStock['GD-MUM'] || 0}</strong>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Amd: <strong>{p.godownStock['GD-AMD'] || 0}</strong>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Del: <strong>{p.godownStock['GD-DEL'] || 0}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Stock Level with visual capacity bar */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block text-left w-36">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-slate-900">
                              {p.currentStock} {p.unit}
                            </span>
                            <span className="text-slate-400">Min: {p.minLevel}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                p.currentStock === 0
                                  ? 'bg-rose-500'
                                  : p.currentStock <= p.minLevel
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Cost / Selling */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                        <div>{formatINR(p.costPrice)} <span className="text-[10px] text-slate-400 font-sans">Cost</span></div>
                        <div className="text-slate-900 font-semibold">{formatINR(p.sellingPrice)} <span className="text-[10px] text-slate-400 font-sans">Retail</span></div>
                      </td>

                      {/* Total Asset Valuation */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(assetValue)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openStockHistoryDrawer(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Inspect chronological ledger history"
                          >
                            <History className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openTransferDrawer(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Transfer stock to another godown"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openAdjustDrawer(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Adjust quantity (+/-)"
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
