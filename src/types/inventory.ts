export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type ProductCategory = 
  | 'Electronics' 
  | 'Industrial Hardware' 
  | 'Packaging' 
  | 'Office Equipment';

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
  godownStock: Record<string, number>; // godownId -> count
  status: StockStatus;
  supplierId: string;
  supplierName: string;
  description: string;
  lastUpdated: string;
}

export interface Godown {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  manager: string;
  contact: string;
  capacity: number; // total units limit
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
  id: string; // e.g. SO-2026-014
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst: string;
  customerAddress: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number; // 0.18
  taxAmount: number;
  grandTotal: number;
  status: 'Paid' | 'Pending';
  godownId: string;
  notes?: string;
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
  id: string; // e.g. PO-2026-008
  supplierId: string;
  supplierName: string;
  supplierGst: string;
  supplierEmail: string;
  date: string;
  expectedDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Received';
  destinationGodownId: string;
  notes?: string;
}

export type MovementType = 
  | 'INITIAL' 
  | 'PURCHASE_IN' 
  | 'SALE_OUT' 
  | 'TRANSFER' 
  | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  referenceId: string; // e.g. PO-..., SO-..., TR-..., ADJ-...
  quantityDelta: number; // e.g. +40, -15
  runningBalance: number;
  fromGodownId?: string;
  toGodownId?: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  address: string;
  city: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  categories: ProductCategory[];
}

export interface StockAdjustmentPayload {
  productId: string;
  godownId: string;
  type: 'ADD' | 'REMOVE';
  quantity: number;
  reason: string;
}

export interface StockTransferPayload {
  productId: string;
  fromGodownId: string;
  toGodownId: string;
  quantity: number;
  notes?: string;
}
