'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Receipt,
  CheckCircle2,
  FileText,
  CreditCard,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatDate, formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/common/Badge';

export default function SalesPage() {
  const {
    state,
    metrics,
    openCreateSaleDrawer,
    openInvoiceModal,
    markSalesOrderPaid,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Filter orders
  const filteredOrders = state.salesOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Sales Orders & GST Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track B2B customer invoices, tax breakdowns, and automated warehouse inventory deduction.
          </p>
        </div>

        <button
          onClick={() => openCreateSaleDrawer()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Sales Order</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Sales Value</span>
            <Receipt className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-2 tabular-nums">
            {formatINR(metrics.totalSalesRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {state.salesOrders.length} total customer orders
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Collected / Paid</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-emerald-600 mt-2 tabular-nums">
            {formatINR(metrics.paidSalesRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {state.salesOrders.filter((s) => s.status === 'Paid').length} invoices settled
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Receivables</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-amber-600 mt-2 tabular-nums">
            {formatINR(metrics.pendingSalesRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {state.salesOrders.filter((s) => s.status === 'Pending').length} awaiting customer payment
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (SO-...), Customer Name, or Product..."
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

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
          {(['All', 'Paid', 'Pending'] as const).map((tab) => (
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

      {/* Sales Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Dispatch Depot</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Invoice Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const godown = state.godowns.find((g) => g.id === order.godownId);
                  const totalUnits = order.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {order.id}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          GSTIN: {order.customerGst}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">
                          {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.items.length} unique line item(s) • {totalUnits} total units
                        </div>
                      </td>

                      {/* Depot */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {godown?.city || 'Main Hub'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {formatDate(order.date)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(order.grandTotal)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          incl. 18% GST
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openInvoiceModal(order)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            title="View GST Tax Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Invoice</span>
                          </button>

                          {order.status === 'Pending' && (
                            <button
                              onClick={() => markSalesOrderPaid(order.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Paid</span>
                            </button>
                          )}
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
