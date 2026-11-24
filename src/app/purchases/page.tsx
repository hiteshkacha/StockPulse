'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  ArrowDownLeft,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatDate, formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/common/Badge';

export default function PurchasesPage() {
  const {
    state,
    metrics,
    openCreatePurchaseDrawer,
    markPurchaseOrderReceived,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Received'>('All');

  // Filter purchase orders
  const filteredOrders = state.purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalReceivedCount = state.purchaseOrders.filter((p) => p.status === 'Received').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Purchase Orders & Inward Supply
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Procure raw inventory from suppliers. Marking an order Received automatically adds units to stock.
          </p>
        </div>

        <button
          onClick={() => openCreatePurchaseDrawer()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create Purchase Order</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Purchase Spend</span>
            <ShoppingCart className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-2 tabular-nums">
            {formatINR(metrics.totalPurchaseSpend)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {state.purchaseOrders.length} supplier orders issued
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Inward Shipments</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-amber-600 mt-2 tabular-nums">
            {metrics.pendingPurchasesCount} Orders
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Committed capital: {formatINR(metrics.pendingPurchaseSpend)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Received & Reconciled</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-emerald-600 mt-2 tabular-nums">
            {totalReceivedCount} Orders
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Inventory credited to regional godown depots
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
            placeholder="Search by PO Number (PO-...), Supplier Name, or Product..."
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
          {(['All', 'Pending', 'Received'] as const).map((tab) => (
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

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Ordered Items Summary</th>
                <th className="py-3 px-4">Dest. Depot</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Fulfillment ETA</th>
                <th className="py-3 px-4 text-right">PO Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No purchase orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => {
                  const godown = state.godowns.find((g) => g.id === po.destinationGodownId);
                  const totalUnits = po.items.reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* PO Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {po.id}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{po.supplierName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          GSTIN: {po.supplierGst}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">
                          {po.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {po.items.length} line item(s) • {totalUnits} total units
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
                        {formatDate(po.date)}
                      </td>

                      {/* ETA */}
                      <td className="py-3.5 px-4">
                        {po.status === 'Received' ? (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Received on {formatDate(po.receivedDate || po.expectedDate)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium">
                            Expected {formatDate(po.expectedDate)}
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(po.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={po.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {po.status === 'Pending' ? (
                          <button
                            onClick={() => markPurchaseOrderReceived(po.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                            title="Confirm delivery and increase stock"
                          >
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                            <span>Mark Received</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Stock Ingested</span>
                          </span>
                        )}
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
