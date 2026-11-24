'use client';

import React, { useState } from 'react';
import {
  Download,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Boxes,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useInventory } from '@/context/InventoryContext';
import { downloadCSV, formatINR } from '@/lib/utils';
import { CategoryBadge, SkuBadge, StatusBadge } from '@/components/common/Badge';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { state, metrics } = useInventory();
  const [activeTab, setActiveTab] = useState<'valuation' | 'sales' | 'purchases'>('valuation');

  // Tab 1: Stock Valuation Calculations
  const valuationRows = state.products.map((p) => {
    const assetValue = p.currentStock * p.costPrice;
    const retailValue = p.currentStock * p.sellingPrice;
    const potentialMargin = retailValue - assetValue;
    const marginPercentage =
      retailValue > 0 ? Math.round((potentialMargin / retailValue) * 100) : 0;

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      currentStock: p.currentStock,
      unit: p.unit,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      assetValue,
      retailValue,
      potentialMargin,
      marginPercentage,
      status: p.status,
    };
  });

  const totalAssetValue = valuationRows.reduce((acc, r) => acc + r.assetValue, 0);
  const totalRetailVal = valuationRows.reduce((acc, r) => acc + r.retailValue, 0);
  const totalPotentialMargin = totalRetailVal - totalAssetValue;
  const overallMarginPercent =
    totalRetailVal > 0 ? Math.round((totalPotentialMargin / totalRetailVal) * 100) : 0;

  // Tab 2: Sales Report Calculations
  const customerSalesMap: Record<
    string,
    { name: string; count: number; total: number; paid: number; pending: number }
  > = {};

  state.salesOrders.forEach((so) => {
    if (!customerSalesMap[so.customerId]) {
      customerSalesMap[so.customerId] = {
        name: so.customerName,
        count: 0,
        total: 0,
        paid: 0,
        pending: 0,
      };
    }
    customerSalesMap[so.customerId].count += 1;
    customerSalesMap[so.customerId].total += so.grandTotal;
    if (so.status === 'Paid') {
      customerSalesMap[so.customerId].paid += so.grandTotal;
    } else {
      customerSalesMap[so.customerId].pending += so.grandTotal;
    }
  });

  const customerReportRows = Object.values(customerSalesMap).sort((a, b) => b.total - a.total);

  // Top products sold
  const productSalesMap: Record<
    string,
    { sku: string; name: string; quantity: number; revenue: number }
  > = {};

  state.salesOrders.forEach((so) => {
    so.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          sku: item.sku,
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });

  const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Tab 3: Purchase Report Calculations
  const supplierSpendMap: Record<
    string,
    { name: string; ordersCount: number; totalSpend: number; received: number; pending: number }
  > = {};

  state.purchaseOrders.forEach((po) => {
    if (!supplierSpendMap[po.supplierId]) {
      supplierSpendMap[po.supplierId] = {
        name: po.supplierName,
        ordersCount: 0,
        totalSpend: 0,
        received: 0,
        pending: 0,
      };
    }
    supplierSpendMap[po.supplierId].ordersCount += 1;
    supplierSpendMap[po.supplierId].totalSpend += po.totalAmount;
    if (po.status === 'Received') {
      supplierSpendMap[po.supplierId].received += po.totalAmount;
    } else {
      supplierSpendMap[po.supplierId].pending += po.totalAmount;
    }
  });

  const supplierReportRows = Object.values(supplierSpendMap).sort(
    (a, b) => b.totalSpend - a.totalSpend
  );

  // CSV Export Handler
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (activeTab === 'valuation') {
      const headers = [
        'SKU',
        'Product Name',
        'Category',
        'Current Stock',
        'Unit',
        'Cost Price (INR)',
        'Selling Price (INR)',
        'Total Asset Value (INR)',
        'Retail Value (INR)',
        'Gross Margin (%)',
        'Status',
      ];
      const rows = valuationRows.map((r) => [
        r.sku,
        `"${r.name.replace(/"/g, '""')}"`,
        r.category,
        r.currentStock,
        r.unit,
        r.costPrice,
        r.sellingPrice,
        r.assetValue,
        r.retailValue,
        `${r.marginPercentage}%`,
        r.status,
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      downloadCSV(`StockPulse_Valuation_Report_${timestamp}.csv`, csv);
      toast.success('Stock Valuation Report exported to CSV.');
    } else if (activeTab === 'sales') {
      const headers = [
        'Customer Name',
        'Orders Count',
        'Total Revenue (INR)',
        'Paid (INR)',
        'Pending (INR)',
      ];
      const rows = customerReportRows.map((c) => [
        `"${c.name.replace(/"/g, '""')}"`,
        c.count,
        c.total,
        c.paid,
        c.pending,
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      downloadCSV(`StockPulse_Sales_Report_${timestamp}.csv`, csv);
      toast.success('Sales Performance Report exported to CSV.');
    } else {
      const headers = [
        'Supplier Name',
        'Purchase Orders Count',
        'Total Procurement (INR)',
        'Fulfilled/Received (INR)',
        'Pending/In-Transit (INR)',
      ];
      const rows = supplierReportRows.map((s) => [
        `"${s.name.replace(/"/g, '""')}"`,
        s.ordersCount,
        s.totalSpend,
        s.received,
        s.pending,
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      downloadCSV(`StockPulse_Purchase_Report_${timestamp}.csv`, csv);
      toast.success('Supplier Procurement Report exported to CSV.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Business Intelligence & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Financial analytics, gross asset margins, customer revenue concentration, and supplier spend.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'valuation'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Stock Valuation & Margins</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'sales'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Sales & Customer Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === 'purchases'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Procurement & Supplier Spend</span>
        </button>
      </div>

      {/* Tab 1: Valuation Content */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Total Asset Cost</span>
              <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-2 tabular-nums">
                {formatINR(totalAssetValue)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Carrying cost of current holdings</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Total Retail Value</span>
              <div className="text-xl font-bold font-mono tracking-tight text-indigo-600 mt-2 tabular-nums">
                {formatINR(totalRetailVal)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Estimated gross sales realization</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Unrealized Gross Margin</span>
              <div className="text-xl font-bold font-mono tracking-tight text-emerald-600 mt-2 tabular-nums">
                {formatINR(totalPotentialMargin)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Potential gross profit buffer</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">Average Gross Markup</span>
              <div className="text-xl font-bold font-mono tracking-tight text-amber-600 mt-2 tabular-nums">
                {overallMarginPercent}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Weighted gross margin spread</p>
            </div>
          </div>

          {/* Detailed Valuation Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Holding Units</th>
                    <th className="py-3 px-4 text-right">Unit Cost (₹)</th>
                    <th className="py-3 px-4 text-right">Unit Retail (₹)</th>
                    <th className="py-3 px-4 text-right">Asset Cost (₹)</th>
                    <th className="py-3 px-4 text-right">Retail Realization (₹)</th>
                    <th className="py-3 px-4 text-right">Margin (%)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valuationRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <span className="font-mono text-[11px] text-indigo-600">{row.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={row.category} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {row.currentStock} {row.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatINR(row.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatINR(row.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {formatINR(row.assetValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-indigo-700">
                        {formatINR(row.retailValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-600">
                        {row.marginPercentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sales Content */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products by Revenue */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                Top Revenue Generating SKUs
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Total commercial gross billing across all completed and pending orders.
              </p>

              <div className="space-y-3">
                {topSellingProducts.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {item.sku} • {item.quantity} units sold
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Revenue Concentration */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                Customer Sales Breakdown
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Cumulative revenue and collection settlement status per B2B customer.
              </p>

              <div className="space-y-3">
                {customerReportRows.map((cust) => (
                  <div
                    key={cust.name}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{cust.name}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(cust.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>{cust.count} order(s) placed</span>
                      <div className="flex gap-2">
                        <span className="text-emerald-600 font-medium">
                          Paid: {formatINR(cust.paid)}
                        </span>
                        {cust.pending > 0 && (
                          <span className="text-amber-600 font-medium">
                            Pending: {formatINR(cust.pending)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Purchase Content */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
              Supplier Spend & Inward Procurement Fulfillment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of total purchase orders committed vs. fulfilled per approved vendor.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Vendor / Supplier</th>
                    <th className="py-3 px-4 text-center">Orders Issued</th>
                    <th className="py-3 px-4 text-right">Total Committed (₹)</th>
                    <th className="py-3 px-4 text-right">Fulfilled / Received (₹)</th>
                    <th className="py-3 px-4 text-right">Pending Arrival (₹)</th>
                    <th className="py-3 px-4 text-center">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierReportRows.map((sup) => {
                    const isAllReceived = sup.pending === 0;

                    return (
                      <tr key={sup.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{sup.name}</td>
                        <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                          {sup.ordersCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatINR(sup.totalSpend)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 tabular-nums">
                          {formatINR(sup.received)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-amber-600 tabular-nums">
                          {formatINR(sup.pending)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isAllReceived ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>100% Fulfilled</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Shipment In-Transit</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
