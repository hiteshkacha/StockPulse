'use client';

import React, { useState } from 'react';
import { Download, Boxes, TrendingUp, ShoppingCart } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import {
  getProductStatus,
  selectInventoryValue,
  selectTotalSales,
  selectPaidSales,
  selectPendingSales,
  selectTotalPurchases,
  selectPendingPurchasesValue,
} from '@/lib/selectors';
import { formatINR } from '@/lib/format';
import { downloadCSV } from '@/lib/csv';
import { KpiCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, SkuBadge, CategoryBadge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { state } = useInventory();
  const [activeTab, setActiveTab] = useState<'stock' | 'sales' | 'purchases'>('stock');

  // Filters for tabs
  const [stockCategoryFilter, setStockCategoryFilter] = useState('All');
  const [salesStatusFilter, setSalesStatusFilter] = useState('All');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('All');

  // --- TAB 1: STOCK CALCULATIONS ---
  const stockRows = state.products
    .filter((p) => (stockCategoryFilter === 'All' ? true : p.category === stockCategoryFilter))
    .map((p) => {
      const assetCost = p.currentStock * p.costPrice;
      const retailVal = p.currentStock * p.sellingPrice;
      const margin = retailVal - assetCost;
      const marginPercent = retailVal > 0 ? Math.round((margin / retailVal) * 100) : 0;
      const status = getProductStatus(p);

      return {
        ...p,
        assetCost,
        retailVal,
        margin,
        marginPercent,
        status,
      };
    });

  const totalAssetCost = state.products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalRetailVal = state.products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const totalMargin = totalRetailVal - totalAssetCost;

  // --- TAB 2: SALES CALCULATIONS ---
  const customerMap: Record<
    string,
    { name: string; count: number; total: number; paid: number; pending: number }
  > = {};

  state.salesOrders.forEach((so) => {
    if (!customerMap[so.customerId]) {
      customerMap[so.customerId] = {
        name: so.customerName,
        count: 0,
        total: 0,
        paid: 0,
        pending: 0,
      };
    }
    customerMap[so.customerId].count += 1;
    customerMap[so.customerId].total += so.grandTotal;
    if (so.status === 'Paid') {
      customerMap[so.customerId].paid += so.grandTotal;
    } else {
      customerMap[so.customerId].pending += so.grandTotal;
    }
  });

  const customerRows = Object.values(customerMap)
    .filter((c) => {
      if (salesStatusFilter === 'Paid') return c.paid > 0;
      if (salesStatusFilter === 'Pending') return c.pending > 0;
      return true;
    })
    .sort((a, b) => b.total - a.total);

  const totalSalesVal = selectTotalSales(state);
  const totalPaidVal = selectPaidSales(state);
  const totalPendingVal = selectPendingSales(state);

  // --- TAB 3: PURCHASES CALCULATIONS ---
  const supplierMap: Record<
    string,
    { name: string; count: number; total: number; received: number; pending: number }
  > = {};

  state.purchaseOrders.forEach((po) => {
    if (!supplierMap[po.supplierId]) {
      supplierMap[po.supplierId] = {
        name: po.supplierName,
        count: 0,
        total: 0,
        received: 0,
        pending: 0,
      };
    }
    supplierMap[po.supplierId].count += 1;
    supplierMap[po.supplierId].total += po.totalAmount;
    if (po.status === 'Received') {
      supplierMap[po.supplierId].received += po.totalAmount;
    } else {
      supplierMap[po.supplierId].pending += po.totalAmount;
    }
  });

  const supplierRows = Object.values(supplierMap)
    .filter((s) => {
      if (purchaseStatusFilter === 'Received') return s.received > 0;
      if (purchaseStatusFilter === 'Pending') return s.pending > 0;
      return true;
    })
    .sort((a, b) => b.total - a.total);

  const totalPurchasesVal = selectTotalPurchases(state);
  const pendingPurchasesVal = selectPendingPurchasesValue(state);
  const receivedPurchasesVal = totalPurchasesVal - pendingPurchasesVal;

  // --- CSV EXPORT HANDLER ---
  const handleExportCSV = () => {
    if (activeTab === 'stock') {
      const headers = [
        'SKU',
        'Product Name',
        'Category',
        'Quantity',
        'Unit',
        'Unit Cost (INR)',
        'Unit Price (INR)',
        'Asset Valuation (INR)',
        'Retail Realization (INR)',
        'Gross Margin (%)',
        'Status',
      ];
      const rows = stockRows.map((r) => [
        r.sku,
        r.name,
        r.category,
        r.currentStock,
        r.unit,
        r.costPrice,
        r.sellingPrice,
        r.assetCost,
        r.retailVal,
        `${r.marginPercent}%`,
        r.status,
      ]);
      downloadCSV('StockPulse_Stock_Valuation_Report', headers, rows);
      toast.success('Stock report exported to CSV');
    } else if (activeTab === 'sales') {
      const headers = [
        'Customer Name',
        'Orders Placed',
        'Total Revenue (INR)',
        'Paid Revenue (INR)',
        'Pending Receivables (INR)',
      ];
      const rows = customerRows.map((c) => [c.name, c.count, c.total, c.paid, c.pending]);
      downloadCSV('StockPulse_Sales_Performance_Report', headers, rows);
      toast.success('Sales report exported to CSV');
    } else {
      const headers = [
        'Supplier Name',
        'Orders Issued',
        'Total Spend (INR)',
        'Received Value (INR)',
        'Pending Value (INR)',
      ];
      const rows = supplierRows.map((s) => [s.name, s.count, s.total, s.received, s.pending]);
      downloadCSV('StockPulse_Purchase_Spend_Report', headers, rows);
      toast.success('Purchase report exported to CSV');
    }
  };

  const categories = ['All', 'Electronics', 'Industrial Hardware', 'Packaging', 'Office Equipment'];

  return (
    <div className="space-y-6">
      {/* Tab Nav & CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'stock'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes size={14} />
            <span>Stock Report</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={14} />
            <span>Sales Report</span>
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'purchases'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart size={14} />
            <span>Purchase Report</span>
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          icon={<Download size={14} />}
        >
          Export CSV
        </Button>
      </div>

      {/* --- TAB 1: STOCK --- */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Total Asset Cost"
              value={formatINR(totalAssetCost)}
              subtext="Carrying value of all items"
            />
            <KpiCard
              label="Total Retail Value"
              value={formatINR(totalRetailVal)}
              subtext="Expected gross realization"
            />
            <KpiCard
              label="Unrealized Gross Margin"
              value={formatINR(totalMargin)}
              subtext={`${totalRetailVal > 0 ? Math.round((totalMargin / totalRetailVal) * 100) : 0}% average margin spread`}
              subtextColor="text-emerald-600 font-medium"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Category:</span>
              <select
                value={stockCategoryFilter}
                onChange={(e) => setStockCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500">{stockRows.length} items listed</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Stock</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Cost</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Price</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Asset Value</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Retail Value</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Margin (%)</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockRows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <SkuBadge sku={r.sku} />
                          <span className="font-semibold text-slate-900 truncate max-w-xs">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={r.category} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {r.currentStock} {r.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-600 whitespace-nowrap">
                        {formatINR(r.costPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-600 whitespace-nowrap">
                        {formatINR(r.sellingPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                        {formatINR(r.assetCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums text-indigo-700 whitespace-nowrap">
                        {formatINR(r.retailVal)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums text-emerald-600 whitespace-nowrap">
                        {r.marginPercent}%
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SALES --- */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Total Revenue"
              value={formatINR(totalSalesVal)}
              subtext="Gross billing to date"
            />
            <KpiCard
              label="Collected Revenue"
              value={formatINR(totalPaidVal)}
              subtext="Settled invoices"
              subtextColor="text-emerald-600 font-medium"
            />
            <KpiCard
              label="Pending Receivables"
              value={formatINR(totalPendingVal)}
              subtext="Awaiting customer clearance"
              subtextColor="text-amber-600 font-medium"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Status:</span>
              <select
                value={salesStatusFilter}
                onChange={(e) => setSalesStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Paid Only</option>
                <option value="Pending">Pending Only</option>
              </select>
            </div>
            <span className="text-xs text-slate-500">{customerRows.length} customers</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Orders Count</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Total Billed</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Paid Amount</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Pending Receivables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerRows.map((c) => (
                    <tr key={c.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-600 font-medium">
                        {c.count}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(c.total)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                        {formatINR(c.paid)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-600 tabular-nums whitespace-nowrap">
                        {formatINR(c.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: PURCHASES --- */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Total Procurement Spend"
              value={formatINR(totalPurchasesVal)}
              subtext="Committed vendor contracts"
            />
            <KpiCard
              label="Received Inward Value"
              value={formatINR(receivedPurchasesVal)}
              subtext="Inventory received into stock"
              subtextColor="text-emerald-600 font-medium"
            />
            <KpiCard
              label="Pending Delivery Value"
              value={formatINR(pendingPurchasesVal)}
              subtext="Orders awaiting arrival"
              subtextColor="text-amber-600 font-medium"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Status:</span>
              <select
                value={purchaseStatusFilter}
                onChange={(e) => setPurchaseStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Vendors</option>
                <option value="Received">With Received Deliveries</option>
                <option value="Pending">With Pending Inward Orders</option>
              </select>
            </div>
            <span className="text-xs text-slate-500">{supplierRows.length} vendors</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Vendor / Supplier</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Orders Issued</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Total Committed</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Received Value</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Pending Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierRows.map((s) => (
                    <tr key={s.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-600 font-medium">
                        {s.count}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatINR(s.total)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                        {formatINR(s.received)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-600 tabular-nums whitespace-nowrap">
                        {formatINR(s.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
