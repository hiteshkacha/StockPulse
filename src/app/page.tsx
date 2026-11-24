'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useInventory } from '@/context/InventoryContext';
import {
  selectInventoryValue,
  selectTotalSales,
  selectPendingPurchasesCount,
  selectPendingPurchasesValue,
  selectCriticalAlertProducts,
  selectLowStockCount,
  selectOutOfStockCount,
  selectMonthlySalesPurchases,
  selectStockValueByCategory,
  selectRecentActivity,
  getProductStatus,
} from '@/lib/selectors';
import { formatINR, formatRelativeTime } from '@/lib/format';
import { KpiCard } from '@/components/ui/Card';
import { StatusBadge, SkuBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { state, openCreatePurchaseDrawer } = useInventory();

  const inventoryValue = selectInventoryValue(state);
  const totalSales = selectTotalSales(state);
  const pendingCount = selectPendingPurchasesCount(state);
  const pendingValue = selectPendingPurchasesValue(state);
  const alertProducts = selectCriticalAlertProducts(state);
  const lowCount = selectLowStockCount(state);
  const outCount = selectOutOfStockCount(state);

  const monthlyChartData = selectMonthlySalesPurchases(state);
  const categoryChartData = selectStockValueByCategory(state);
  const recentActivities = selectRecentActivity(state, 8);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Inventory Value"
          value={formatINR(inventoryValue)}
          subtext={`${state.products.length} active catalog SKUs`}
          icon={<Boxes size={18} />}
        />
        <KpiCard
          label="Total Sales"
          value={formatINR(totalSales)}
          subtext={`${state.salesOrders.length} customer orders placed`}
          icon={<TrendingUp size={18} />}
        />
        <KpiCard
          label="Pending Purchase Orders"
          value={`${pendingCount} orders`}
          subtext={`Valued at ${formatINR(pendingValue)}`}
          icon={<ShoppingCart size={18} />}
        />
        <KpiCard
          label="Low Stock Items"
          value={alertProducts.length}
          subtext={`${outCount} out of stock, ${lowCount} low`}
          subtextColor={alertProducts.length > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      {/* Visual Analytics Row: Exactly 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sales vs Purchases by Month (Grouped Bar Chart - 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Sales vs Purchases</h2>
              <p className="text-xs text-slate-500">6-month order volume trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
                <span className="text-slate-600">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                <span className="text-slate-600">Purchases</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatINR(val), '']}
                  contentStyle={{
                    backgroundColor: '#090d16',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sales" name="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stock Value by Category (Donut - 1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Stock by Category</h2>
            <p className="text-xs text-slate-500">Current asset valuation spread</p>

            <div className="h-48 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), 'Valuation']}
                    contentStyle={{
                      backgroundColor: '#090d16',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {categoryChartData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-600 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Low Stock Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Low Stock Alerts</h2>
              <p className="text-xs text-slate-500">
                Items requiring reorder (current stock ≤ minimum threshold)
              </p>
            </div>
            {alertProducts.length > 0 && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {alertProducts.length} items
              </span>
            )}
          </div>

          {alertProducts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed rounded-lg">
              All inventory levels are above their minimum thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {alertProducts.map((p) => {
                const status = getProductStatus(p);
                const percent = Math.min(100, Math.round((p.currentStock / (p.minLevel || 1)) * 100));

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SkuBadge sku={p.sku} />
                        <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                        <StatusBadge status={status} />
                      </div>
                      <div className="text-xs text-slate-500">
                        Stock:{' '}
                        <span
                          className={`font-semibold tabular-nums ${
                            p.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>{' '}
                        / Min: {p.minLevel} {p.unit} • Supplier: {p.supplierName}
                      </div>

                      {/* Thin progress bar */}
                      <div className="w-48 bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${
                            p.currentStock === 0 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openCreatePurchaseDrawer(p.supplierId, p.id)}
                      icon={<RefreshCw size={13} />}
                    >
                      Reorder
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Last 8 stock and order events</p>
          </div>

          <div className="flex-1 space-y-3">
            {recentActivities.map((act) => {
              let Icon = Sparkles;
              let iconColor = 'text-slate-500 bg-slate-100';

              if (act.type === 'IN') {
                Icon = ArrowDownLeft;
                iconColor = 'text-emerald-700 bg-emerald-50';
              } else if (act.type === 'OUT') {
                Icon = ArrowUpRight;
                iconColor = 'text-rose-700 bg-rose-50';
              } else if (act.type === 'ADJUSTMENT') {
                Icon = SlidersHorizontal;
                iconColor = 'text-purple-700 bg-purple-50';
              }

              return (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className={`h-6 w-6 rounded-md shrink-0 flex items-center justify-center ${iconColor}`}>
                    <Icon size={13} />
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-400">
                        {act.referenceId}
                      </span>
                      <span
                        className={`font-semibold tabular-nums text-[11px] ${
                          act.quantityDelta > 0
                            ? 'text-emerald-600'
                            : act.quantityDelta < 0
                            ? 'text-rose-600'
                            : 'text-slate-600'
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
