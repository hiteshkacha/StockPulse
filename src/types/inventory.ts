export type ProductCategory =
  | 'Electronics'
  | 'Industrial Hardware'
  | 'Packaging'
  | 'Office Equipment';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minLevel: number;
  unit: string;
  supplierId: string;
  supplierName: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string; // SO-2026-001
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  subtotal: number;
  taxAmount: number; // 18% GST
  grandTotal: number;
  status: 'Paid' | 'Pending';
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string; // PO-2026-001
  supplierId: string;
  supplierName: string;
  date: string; // YYYY-MM-DD
  expectedDate: string; // YYYY-MM-DD
  receivedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Received';
}

export type MovementType = 'INITIAL' | 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  timestamp: string; // ISO string
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  referenceId: string; // PO-xxxx, SO-xxxx, ADJ-xxxx, INIT
  quantityDelta: number; // + or -
  runningBalance: number;
  notes: string;
}

export interface InventoryState {
  products: Product[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  customers: Customer[];
  suppliers: Supplier[];
}
