import { InventoryState, Product, StockStatus } from '@/types/inventory';

/**
 * Derive product status dynamically. Never stored.
 */
export function getProductStatus(product: Product): StockStatus {
  if (product.currentStock <= 0) {
    return 'Out of Stock';
  }
  if (product.currentStock <= product.minLevel) {
    return 'Low Stock';
  }
  return 'In Stock';
}

/**
 * Total Inventory Value = sum(currentStock * costPrice)
 */
export function selectInventoryValue(state: InventoryState): number {
  return state.products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
}

/**
 * Total Sales Revenue
 */
export function selectTotalSales(state: InventoryState): number {
  return state.salesOrders.reduce((acc, so) => acc + so.grandTotal, 0);
}

export function selectPaidSales(state: InventoryState): number {
  return state.salesOrders
    .filter((so) => so.status === 'Paid')
    .reduce((acc, so) => acc + so.grandTotal, 0);
}

export function selectPendingSales(state: InventoryState): number {
  return state.salesOrders
    .filter((so) => so.status === 'Pending')
    .reduce((acc, so) => acc + so.grandTotal, 0);
}

/**
 * Total Purchase Spend
 */
export function selectTotalPurchases(state: InventoryState): number {
  return state.purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
}

export function selectPendingPurchasesCount(state: InventoryState): number {
  return state.purchaseOrders.filter((po) => po.status === 'Pending').length;
}

export function selectPendingPurchasesValue(state: InventoryState): number {
  return state.purchaseOrders
    .filter((po) => po.status === 'Pending')
    .reduce((acc, po) => acc + po.totalAmount, 0);
}

export function selectReceivedPurchasesCount(state: InventoryState): number {
  return state.purchaseOrders.filter((po) => po.status === 'Received').length;
}

/**
 * Low stock and out-of-stock derivations
 */
export function selectCriticalAlertProducts(state: InventoryState): Product[] {
  return state.products.filter((p) => p.currentStock <= p.minLevel);
}

export function selectLowStockCount(state: InventoryState): number {
  return state.products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minLevel
  ).length;
}

export function selectOutOfStockCount(state: InventoryState): number {
  return state.products.filter((p) => p.currentStock <= 0).length;
}

/**
 * Chart 1: Sales vs Purchases by month (last 6 months from actual orders)
 */
export function selectMonthlySalesPurchases(
  state: InventoryState
): Array<{ month: string; sales: number; purchases: number }> {
  // Last 6 months ending Nov 2026
  const months = [
    { key: '2026-06', label: 'Jun' },
    { key: '2026-07', label: 'Jul' },
    { key: '2026-08', label: 'Aug' },
    { key: '2026-09', label: 'Sep' },
    { key: '2026-10', label: 'Oct' },
    { key: '2026-11', label: 'Nov' },
  ];

  return months.map(({ key, label }) => {
    const monthlySales = state.salesOrders
      .filter((so) => so.date.startsWith(key))
      .reduce((acc, so) => acc + so.grandTotal, 0);

    const monthlyPurchases = state.purchaseOrders
      .filter((po) => po.date.startsWith(key))
      .reduce((acc, po) => acc + po.totalAmount, 0);

    return {
      month: label,
      sales: monthlySales,
      purchases: monthlyPurchases,
    };
  });
}

/**
 * Chart 2: Stock value by category
 */
export function selectStockValueByCategory(
  state: InventoryState
): Array<{ name: string; value: number; color: string }> {
  const categoryColors: Record<string, string> = {
    Electronics: '#4f46e5',
    'Industrial Hardware': '#0ea5e9',
    Packaging: '#10b981',
    'Office Equipment': '#f59e0b',
  };

  const map: Record<string, number> = {};
  state.products.forEach((p) => {
    map[p.category] = (map[p.category] || 0) + p.currentStock * p.costPrice;
  });

  return Object.keys(map).map((cat) => ({
    name: cat,
    value: map[cat],
    color: categoryColors[cat] || '#64748b',
  }));
}

/**
 * Recent Activity (last 8 movements)
 */
export function selectRecentActivity(state: InventoryState, limit = 8) {
  return state.stockMovements.slice(0, limit);
}
