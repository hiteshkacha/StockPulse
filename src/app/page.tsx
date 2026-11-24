'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Receipt,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useInventory } from '@/context/InventoryContext';
import { formatINR, formatRelativeTime } from '@/lib/utils';
import { StatusBadge, SkuBadge } from '@/components/common/Badge';

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#4f46e5',
  'Industrial Hardware': '#0ea5e9',
  Packaging: '#10b981',
  'Office Equipment': '#f59e0b',
};

export default function DashboardPage() {
  const {
    state,
    metrics,
    openCreatePurchaseDrawer,
    openCreateSaleDrawer,
    openStockHistoryDrawer,
  } = useInventory();

  // Filter low stock and out of stock items for alerts panel
  const alertProducts = state.products.filter(
    (p) => p.currentStock <= p.minLevel
  );

  // Category valuation breakdown for Donut Chart
  const categoryDataMap: Record<string, number> = {};
  state.products.forEach((p) => {
    categoryDataMap[p.category] =
      (categoryDataMap[p.category] || 0) + p.currentStock * p.costPrice;
  });

  const categoryChartData = Object.keys(categoryDataMap).map((cat) => ({
    name: cat,
    value: categoryDataMap[cat],
    color: CATEGORY_COLORS[cat] || '#64748b',
  }));

  // Chronological activity combining recent sales, purchases, and movements
  const recentActivities = state.stockMovements.slice(0, 7);

  // Monthly sales & purchases comparison chart data
  const monthlyTrendsData = [
    { month: 'Jun', sales: 185000, purchases: 140000 },
    { month: 'Jul', sales: 220000, purchases: 260000 },
    { month: 'Aug', sales: 290000, purchases: 195000 },
    { month: 'Sep', sales: 340000, purchases: 280000 },
    { month: 'Oct', sales: 395000, purchases: 310000 },
    {
      month: 'Nov (Current)',
      sales: metrics.totalSalesRevenue || 440000,
      purchases: metrics.totalPurchaseSpend || 320000,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Operations Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Reconciled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock valuation across Mumbai, Ahmedabad, and Delhi distribution godowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateSaleDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Sale</span>
          </button>
          <button
            onClick={() => openCreatePurchaseDrawer()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-slate-500" />
            <span>Procure Stock</span>
          </button>
        </div>
      </div>

      {/* 4 Bento KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inventory Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stock Asset Value</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {formatINR(metrics.totalInventoryValue)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Retail Value: {formatINR(metrics.totalRetailValue)}</span>
              <span className="text-emerald-600 font-semibold font-mono">
                {state.products.reduce((acc, p) => acc + p.currentStock, 0)} Units
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Sales Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sales Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {formatINR(metrics.totalSalesRevenue)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span className="text-emerald-600 font-medium">
                Paid: {formatINR(metrics.paidSalesRevenue)}
              </span>
              <span className="text-amber-600 font-medium">
                Pending: {formatINR(metrics.pendingSalesRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Purchase Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Inward POs</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {metrics.pendingPurchasesCount}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">orders</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Committed Value:</span>
              <span className="font-mono font-semibold text-slate-700">
                {formatINR(metrics.pendingPurchaseSpend)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Stock Alerts</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-rose-600 tabular-nums">
              {alertProducts.length}{' '}
              <span className="text-sm font-sans font-normal text-slate-400">SKUs</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span className="text-rose-600 font-semibold">{metrics.outOfStockCount} Out of Stock</span>
              <span className="text-amber-600 font-semibold">{metrics.lowStockCount} Low Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Trends Chart & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchases Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Sales vs. Purchases Run-Rate (₹)
              </h3>
              <p className="text-xs text-slate-500">
                Monthly revenue inflow compared against procurement expenditure.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                <span className="text-slate-600">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Purchases</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendsData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchasesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
                          <p className="font-bold text-slate-300 mb-1">{payload[0].payload.month}</p>
                          <p className="text-indigo-400 font-mono">
                            Sales: {formatINR(payload[0].value as number)}
                          </p>
                          <p className="text-emerald-400 font-mono">
                            Purchases: {formatINR(payload[1].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#purchasesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Value by Category (1 col Donut) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Stock Asset by Category
            </h3>
            <p className="text-xs text-slate-500">Asset distribution across 4 core domains.</p>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs font-mono">
                            {payload[0].name}: {formatINR(payload[0].value as number)}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {categoryChartData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="truncate">
                  <span className="text-slate-600 block text-[11px] truncate">{cat.name}</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {formatINR(cat.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Actionable Low Stock Alerts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actionable Low Stock Alerts Panel (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Low & Depleted Stock Warning Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {alertProducts.length} Items Require Action
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                One-click reorder opens an inward Purchase Order pre-filled with supplier and SKU details.
              </p>
            </div>

            <Link
              href="/stock"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Stock Master</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {alertProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              All inventory levels are healthy and above their reorder thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {alertProducts.map((p) => {
                const percentage = Math.min(100, Math.round((p.currentStock / (p.minLevel || 1)) * 100));

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SkuBadge sku={p.sku} />
                        <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Supplier: <strong>{p.supplierName}</strong></span>
                        <span>•</span>
                        <span>
                          Current:{' '}
                          <strong
                            className={
                              p.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'
                            }
                          >
                            {p.currentStock} {p.unit}
                          </strong>{' '}
                          / Min: <strong>{p.minLevel} {p.unit}</strong>
                        </span>
                      </div>

                      {/* Visual progress bar vs threshold */}
                      <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${
                            p.currentStock === 0 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openStockHistoryDrawer(p.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Ledger
                      </button>
                      <button
                        onClick={() => openCreatePurchaseDrawer(p.supplierId, p.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Quick Reorder</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline Feed (1 col) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Chronological Feed
              </h3>
              <p className="text-xs text-slate-500">Live stock transactions & orders.</p>
            </div>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="flex-1 space-y-3.5">
            {recentActivities.map((act) => {
              let iconBg = 'bg-slate-100 text-slate-600';
              let Icon = Sparkles;

              if (act.type === 'PURCHASE_IN') {
                iconBg = 'bg-emerald-50 text-emerald-600';
                Icon = ArrowDownLeft;
              } else if (act.type === 'SALE_OUT') {
                iconBg = 'bg-rose-50 text-rose-600';
                Icon = ArrowUpRight;
              } else if (act.type === 'TRANSFER') {
                iconBg = 'bg-amber-50 text-amber-600';
                Icon = RefreshCw;
              }

              return (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div
                    className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center ${iconBg}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {act.productName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.notes}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-slate-400">
                        Ref: {act.referenceId}
                      </span>
                      <span
                        className={`font-mono font-bold text-[11px] tabular-nums ${
                          act.quantityDelta > 0
                            ? 'text-emerald-600'
                            : act.quantityDelta < 0
                            ? 'text-rose-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {act.quantityDelta > 0 ? `+${act.quantityDelta}` : act.quantityDelta} units
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
