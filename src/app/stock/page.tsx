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
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import {
  getProductStatus,
  selectLowStockCount,
  selectOutOfStockCount,
} from '@/lib/selectors';
import { formatINR } from '@/lib/format';
import { KpiCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, SkuBadge, CategoryBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StockPage() {
  const {
    state,
    openAddProductDrawer,
    openAdjustDrawer,
    openStockHistoryDrawer,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low' | 'Out of Stock'>('All');

  const totalItems = state.products.length;
  const lowCount = selectLowStockCount(state);
  const outCount = selectOutOfStockCount(state);
  const inStockCount = state.products.filter((p) => getProductStatus(p) === 'In Stock').length;

  const categories = ['All', 'Electronics', 'Industrial Hardware', 'Packaging', 'Office Equipment'];

  const filteredProducts = state.products.filter((p) => {
    const status = getProductStatus(p);

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ? true : p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'In Stock') matchesStatus = status === 'In Stock';
    else if (statusFilter === 'Low') matchesStatus = status === 'Low Stock';
    else if (statusFilter === 'Out of Stock') matchesStatus = status === 'Out of Stock';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total Items"
          value={totalItems}
          subtext="Catalogued SKUs"
          icon={<Boxes size={18} />}
        />
        <KpiCard
          label="In Stock"
          value={inStockCount}
          subtext="Healthy inventory"
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        />
        <KpiCard
          label="Low Stock"
          value={lowCount}
          subtext="Stock ≤ min threshold"
          subtextColor={lowCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}
          icon={<AlertTriangle size={18} className="text-amber-600" />}
        />
        <KpiCard
          label="Out of Stock"
          value={outCount}
          subtext="Depleted to zero"
          subtextColor={outCount > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}
          icon={<XCircle size={18} className="text-rose-600" />}
        />
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SKU..."
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

        {/* Category + Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {(['All', 'In Stock', 'Low', 'Out of Stock'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openAdjustDrawer()}
            icon={<SlidersHorizontal size={14} />}
          >
            Adjust Stock
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddProductDrawer}
            icon={<Plus size={14} />}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No inventory items found"
            description="No items match your search query or filter selection."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Quantity</th>
                  <th className="py-3 px-4 whitespace-nowrap">Min Level</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Cost</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Price</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const status = getProductStatus(p);
                  const percent = Math.min(
                    100,
                    Math.round((p.currentStock / (p.minLevel || 1)) * 100)
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <SkuBadge sku={p.sku} />
                          <span className="font-semibold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <CategoryBadge category={p.category} />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="w-28">
                          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span>Min: {p.minLevel}</span>
                            <span className="font-semibold text-slate-700">{percent}%</span>
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
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                        {formatINR(p.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(p.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openStockHistoryDrawer(p.id)}
                          icon={<History size={13} />}
                        >
                          History
                        </Button>
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
