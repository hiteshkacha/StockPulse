'use client';

import React, { useState } from 'react';
import { Search, Plus, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { selectTotalSales, selectPaidSales, selectPendingSales } from '@/lib/selectors';
import { formatDate, formatINR } from '@/lib/format';
import { KpiCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SalesPage() {
  const { state, openCreateSaleDrawer, openSaleDetailDrawer, markSalesOrderPaid } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  const totalSales = selectTotalSales(state);
  const paidSales = selectPaidSales(state);
  const pendingSales = selectPendingSales(state);

  const filteredOrders = state.salesOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Sales"
          value={formatINR(totalSales)}
          subtext={`Across ${state.salesOrders.length} customer orders`}
          icon={<Receipt size={18} />}
        />
        <KpiCard
          label="Paid Revenue"
          value={formatINR(paidSales)}
          subtext={`${state.salesOrders.filter((s) => s.status === 'Paid').length} invoices settled`}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        />
        <KpiCard
          label="Pending Receivables"
          value={formatINR(pendingSales)}
          subtext={`${state.salesOrders.filter((s) => s.status === 'Pending').length} awaiting payment`}
          icon={<Clock size={18} className="text-amber-600" />}
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
            placeholder="Search by order ID or customer..."
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

        {/* Status tabs + New Sale button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {(['All', 'Paid', 'Pending'] as const).map((tab) => (
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
            onClick={openCreateSaleDrawer}
            icon={<Plus size={14} />}
          >
            New Sales Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No sales orders found"
            description="No orders match your search query or status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => openSaleDetailDrawer(order)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-xs" title={order.customerName}>
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} ({itemCount} units)
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(order.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'Pending' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => markSalesOrderPaid(order.id)}
                            icon={<CheckCircle2 size={13} className="text-emerald-600" />}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Settled</span>
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
