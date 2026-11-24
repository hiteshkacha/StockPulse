'use client';

import React, { useState } from 'react';
import { Search, Plus, ShoppingCart, Clock, CheckCircle2, ArrowDownLeft } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import {
  selectTotalPurchases,
  selectPendingPurchasesCount,
  selectReceivedPurchasesCount,
} from '@/lib/selectors';
import { formatDate, formatINR } from '@/lib/format';
import { KpiCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PurchasesPage() {
  const { state, openCreatePurchaseDrawer, markPurchaseOrderReceived } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Received'>('All');

  const totalSpend = selectTotalPurchases(state);
  const pendingCount = selectPendingPurchasesCount(state);
  const receivedCount = selectReceivedPurchasesCount(state);

  const filteredOrders = state.purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Spend"
          value={formatINR(totalSpend)}
          subtext={`Across ${state.purchaseOrders.length} supplier orders`}
          icon={<ShoppingCart size={18} />}
        />
        <KpiCard
          label="Pending Deliveries"
          value={`${pendingCount} orders`}
          subtext="Awaiting delivery from vendors"
          subtextColor={pendingCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}
          icon={<Clock size={18} className="text-amber-600" />}
        />
        <KpiCard
          label="Received & Reconciled"
          value={`${receivedCount} orders`}
          subtext="Stock added to available inventory"
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        />
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO number or supplier..."
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

        {/* Status tabs + New PO button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {(['All', 'Pending', 'Received'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openCreatePurchaseDrawer()}
            icon={<Plus size={14} />}
          >
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No purchase orders found"
            description="No orders match your search query or status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 whitespace-nowrap">Order Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Expected Date</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Total</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po) => {
                  const itemCount = po.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 whitespace-nowrap">
                        {po.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-xs" title={po.supplierName}>
                        {po.supplierName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {po.items.length} item{po.items.length > 1 ? 's' : ''} ({itemCount} units)
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(po.date)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {po.status === 'Received' ? (
                          <span className="text-emerald-700 font-medium">
                            Received {formatDate(po.receivedDate || po.expectedDate)}
                          </span>
                        ) : (
                          <span>Expected {formatDate(po.expectedDate)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(po.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {po.status === 'Pending' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => markPurchaseOrderReceived(po.id)}
                            icon={<ArrowDownLeft size={13} />}
                          >
                            Mark as Received
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Received</span>
                        )}
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
