'use client';

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'sonner';
import {
  Customer,
  Godown,
  Product,
  PurchaseOrder,
  SalesOrder,
  StockAdjustmentPayload,
  StockMovement,
  StockTransferPayload,
  Supplier,
} from '@/types/inventory';
import {
  SEED_CUSTOMERS,
  SEED_GODOWNS,
  SEED_PRODUCTS,
  SEED_PURCHASE_ORDERS,
  SEED_SALES_ORDERS,
  SEED_STOCK_MOVEMENTS,
  SEED_SUPPLIERS,
} from '@/data/seedData';
import { getStockStatus } from '@/lib/utils';

const STORAGE_KEY = 'stockpulse_inventory_state_v1';

interface InventoryState {
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  stockMovements: StockMovement[];
  godowns: Godown[];
  customers: Customer[];
  suppliers: Supplier[];
}

type InventoryAction =
  | { type: 'LOAD_STATE'; payload: InventoryState }
  | { type: 'CREATE_SALES_ORDER'; payload: Omit<SalesOrder, 'id'> }
  | { type: 'MARK_SALES_ORDER_PAID'; payload: { orderId: string } }
  | { type: 'CREATE_PURCHASE_ORDER'; payload: Omit<PurchaseOrder, 'id'> }
  | { type: 'MARK_PO_RECEIVED'; payload: { orderId: string } }
  | { type: 'TRANSFER_STOCK'; payload: StockTransferPayload }
  | { type: 'ADJUST_STOCK'; payload: StockAdjustmentPayload }
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'status' | 'lastUpdated'> }
  | { type: 'RESET_DATA' };

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'CREATE_SALES_ORDER': {
      const newOrderId = `SO-2026-${String(state.salesOrders.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const orderDate = new Date().toISOString().split('T')[0];

      const newOrder: SalesOrder = {
        ...action.payload,
        id: newOrderId,
        date: action.payload.date || orderDate,
      };

      // Deduct stock for each line item and create movements
      const updatedProducts = [...state.products];
      const newMovements: StockMovement[] = [];

      for (const item of newOrder.items) {
        const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
        if (productIndex !== -1) {
          const product = updatedProducts[productIndex];
          const newCurrentStock = Math.max(0, product.currentStock - item.quantity);
          const currentGodownStock = product.godownStock[newOrder.godownId] || 0;
          const newGodownStock = Math.max(0, currentGodownStock - item.quantity);

          updatedProducts[productIndex] = {
            ...product,
            currentStock: newCurrentStock,
            godownStock: {
              ...product.godownStock,
              [newOrder.godownId]: newGodownStock,
            },
            status: getStockStatus(newCurrentStock, product.minLevel),
            lastUpdated: now,
          };

          newMovements.push({
            id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'SALE_OUT',
            referenceId: newOrderId,
            quantityDelta: -item.quantity,
            runningBalance: newCurrentStock,
            fromGodownId: newOrder.godownId,
            notes: `Dispatched to ${newOrder.customerName} under ${newOrderId}`,
          });
        }
      }

      return {
        ...state,
        products: updatedProducts,
        salesOrders: [newOrder, ...state.salesOrders],
        stockMovements: [...newMovements, ...state.stockMovements],
      };
    }

    case 'MARK_SALES_ORDER_PAID': {
      return {
        ...state,
        salesOrders: state.salesOrders.map((so) =>
          so.id === action.payload.orderId ? { ...so, status: 'Paid' } : so
        ),
      };
    }

    case 'CREATE_PURCHASE_ORDER': {
      const newPoId = `PO-2026-${String(state.purchaseOrders.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newPO: PurchaseOrder = {
        ...action.payload,
        id: newPoId,
      };

      if (newPO.status === 'Received') {
        // Immediately add stock
        const updatedProducts = [...state.products];
        const newMovements: StockMovement[] = [];

        for (const item of newPO.items) {
          const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
          if (productIndex !== -1) {
            const product = updatedProducts[productIndex];
            const newCurrentStock = product.currentStock + item.quantity;
            const currentGodownStock = product.godownStock[newPO.destinationGodownId] || 0;

            updatedProducts[productIndex] = {
              ...product,
              currentStock: newCurrentStock,
              godownStock: {
                ...product.godownStock,
                [newPO.destinationGodownId]: currentGodownStock + item.quantity,
              },
              status: getStockStatus(newCurrentStock, product.minLevel),
              lastUpdated: now,
            };

            newMovements.push({
              id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: now,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'PURCHASE_IN',
              referenceId: newPoId,
              quantityDelta: item.quantity,
              runningBalance: newCurrentStock,
              toGodownId: newPO.destinationGodownId,
              notes: `Received from ${newPO.supplierName} under ${newPoId}`,
            });
          }
        }

        return {
          ...state,
          products: updatedProducts,
          purchaseOrders: [newPO, ...state.purchaseOrders],
          stockMovements: [...newMovements, ...state.stockMovements],
        };
      }

      return {
        ...state,
        purchaseOrders: [newPO, ...state.purchaseOrders],
      };
    }

    case 'MARK_PO_RECEIVED': {
      const targetPO = state.purchaseOrders.find((po) => po.id === action.payload.orderId);
      if (!targetPO || targetPO.status === 'Received') return state;

      const now = new Date().toISOString();
      const updatedProducts = [...state.products];
      const newMovements: StockMovement[] = [];

      for (const item of targetPO.items) {
        const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
        if (productIndex !== -1) {
          const product = updatedProducts[productIndex];
          const newCurrentStock = product.currentStock + item.quantity;
          const currentGodownStock = product.godownStock[targetPO.destinationGodownId] || 0;

          updatedProducts[productIndex] = {
            ...product,
            currentStock: newCurrentStock,
            godownStock: {
              ...product.godownStock,
              [targetPO.destinationGodownId]: currentGodownStock + item.quantity,
            },
            status: getStockStatus(newCurrentStock, product.minLevel),
            lastUpdated: now,
          };

          newMovements.push({
            id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'PURCHASE_IN',
            referenceId: targetPO.id,
            quantityDelta: item.quantity,
            runningBalance: newCurrentStock,
            toGodownId: targetPO.destinationGodownId,
            notes: `Received from ${targetPO.supplierName} under ${targetPO.id}`,
          });
        }
      }

      return {
        ...state,
        products: updatedProducts,
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === targetPO.id ? { ...po, status: 'Received', receivedDate: now.split('T')[0] } : po
        ),
        stockMovements: [...newMovements, ...state.stockMovements],
      };
    }

    case 'TRANSFER_STOCK': {
      const { productId, fromGodownId, toGodownId, quantity, notes } = action.payload;
      const productIndex = state.products.findIndex((p) => p.id === productId);
      if (productIndex === -1) return state;

      const product = state.products[productIndex];
      const fromStock = product.godownStock[fromGodownId] || 0;
      if (fromStock < quantity) return state;

      const toStock = product.godownStock[toGodownId] || 0;
      const now = new Date().toISOString();
      const refId = `TR-${Date.now().toString().slice(-4)}`;

      const updatedProducts = [...state.products];
      updatedProducts[productIndex] = {
        ...product,
        godownStock: {
          ...product.godownStock,
          [fromGodownId]: fromStock - quantity,
          [toGodownId]: toStock + quantity,
        },
        lastUpdated: now,
      };

      const fromGodownName = state.godowns.find((g) => g.id === fromGodownId)?.name || fromGodownId;
      const toGodownName = state.godowns.find((g) => g.id === toGodownId)?.name || toGodownId;

      const newMovement: StockMovement = {
        id: `TX-${Date.now()}`,
        timestamp: now,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: 'TRANSFER',
        referenceId: refId,
        quantityDelta: 0,
        runningBalance: product.currentStock,
        fromGodownId,
        toGodownId,
        notes: notes || `Transferred ${quantity} units from ${fromGodownName} to ${toGodownName}`,
      };

      return {
        ...state,
        products: updatedProducts,
        stockMovements: [newMovement, ...state.stockMovements],
      };
    }

    case 'ADJUST_STOCK': {
      const { productId, godownId, type, quantity, reason } = action.payload;
      const productIndex = state.products.findIndex((p) => p.id === productId);
      if (productIndex === -1) return state;

      const product = state.products[productIndex];
      const currentGodownStock = product.godownStock[godownId] || 0;
      const delta = type === 'ADD' ? quantity : -quantity;
      const newGodownStock = Math.max(0, currentGodownStock + delta);
      const newCurrentStock = Math.max(0, product.currentStock + delta);
      const now = new Date().toISOString();
      const refId = `ADJ-${Date.now().toString().slice(-4)}`;

      const updatedProducts = [...state.products];
      updatedProducts[productIndex] = {
        ...product,
        currentStock: newCurrentStock,
        godownStock: {
          ...product.godownStock,
          [godownId]: newGodownStock,
        },
        status: getStockStatus(newCurrentStock, product.minLevel),
        lastUpdated: now,
      };

      const newMovement: StockMovement = {
        id: `TX-${Date.now()}`,
        timestamp: now,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: 'ADJUSTMENT',
        referenceId: refId,
        quantityDelta: delta,
        runningBalance: newCurrentStock,
        fromGodownId: type === 'REMOVE' ? godownId : undefined,
        toGodownId: type === 'ADD' ? godownId : undefined,
        notes: `Manual adjustment (${type === 'ADD' ? '+' : '-'}${quantity}): ${reason}`,
      };

      return {
        ...state,
        products: updatedProducts,
        stockMovements: [newMovement, ...state.stockMovements],
      };
    }

    case 'ADD_PRODUCT': {
      const newId = `PROD-${String(state.products.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const status = getStockStatus(action.payload.currentStock, action.payload.minLevel);

      const newProduct: Product = {
        ...action.payload,
        id: newId,
        status,
        lastUpdated: now,
      };

      const initialMovement: StockMovement = {
        id: `TX-${Date.now()}`,
        timestamp: now,
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'INITIAL',
        referenceId: 'SYS-NEW',
        quantityDelta: newProduct.currentStock,
        runningBalance: newProduct.currentStock,
        notes: `Product created with initial stock of ${newProduct.currentStock} units.`,
      };

      return {
        ...state,
        products: [newProduct, ...state.products],
        stockMovements: [initialMovement, ...state.stockMovements],
      };
    }

    case 'RESET_DATA': {
      return {
        products: SEED_PRODUCTS,
        purchaseOrders: SEED_PURCHASE_ORDERS,
        salesOrders: SEED_SALES_ORDERS,
        stockMovements: SEED_STOCK_MOVEMENTS,
        godowns: SEED_GODOWNS,
        customers: SEED_CUSTOMERS,
        suppliers: SEED_SUPPLIERS,
      };
    }

    default:
      return state;
  }
}

const initialState: InventoryState = {
  products: SEED_PRODUCTS,
  purchaseOrders: SEED_PURCHASE_ORDERS,
  salesOrders: SEED_SALES_ORDERS,
  stockMovements: SEED_STOCK_MOVEMENTS,
  godowns: SEED_GODOWNS,
  customers: SEED_CUSTOMERS,
  suppliers: SEED_SUPPLIERS,
};

interface DrawerState {
  isSaleDrawerOpen: boolean;
  salePrefilledProductId?: string;
  isPurchaseDrawerOpen: boolean;
  purchasePrefilledSupplierId?: string;
  purchasePrefilledProductId?: string;
  isTransferDrawerOpen: boolean;
  transferPrefilledProductId?: string;
  isAdjustDrawerOpen: boolean;
  adjustPrefilledProductId?: string;
  isStockHistoryOpen: boolean;
  stockHistoryProductId?: string;
  isAddProductOpen: boolean;
  isInvoiceModalOpen: boolean;
  selectedInvoice?: SalesOrder;
}

interface InventoryContextType {
  state: InventoryState;
  // Computed metrics
  metrics: {
    totalInventoryValue: number;
    totalRetailValue: number;
    totalSalesRevenue: number;
    paidSalesRevenue: number;
    pendingSalesRevenue: number;
    totalPurchaseSpend: number;
    pendingPurchaseSpend: number;
    pendingPurchasesCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalSKUs: number;
  };
  // Actions
  createSalesOrder: (payload: Omit<SalesOrder, 'id'>) => boolean;
  markSalesOrderPaid: (orderId: string) => void;
  createPurchaseOrder: (payload: Omit<PurchaseOrder, 'id'>) => void;
  markPurchaseOrderReceived: (orderId: string) => void;
  transferStock: (payload: StockTransferPayload) => boolean;
  adjustStock: (payload: StockAdjustmentPayload) => void;
  addProduct: (payload: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => void;
  resetDemoData: () => void;
  // Drawers controls
  drawerState: DrawerState;
  openCreateSaleDrawer: (prefilledProductId?: string) => void;
  closeCreateSaleDrawer: () => void;
  openCreatePurchaseDrawer: (supplierId?: string, productId?: string) => void;
  closeCreatePurchaseDrawer: () => void;
  openTransferDrawer: (productId?: string) => void;
  closeTransferDrawer: () => void;
  openAdjustDrawer: (productId?: string) => void;
  closeAdjustDrawer: () => void;
  openStockHistoryDrawer: (productId: string) => void;
  closeStockHistoryDrawer: () => void;
  openAddProductDrawer: () => void;
  closeAddProductDrawer: () => void;
  openInvoiceModal: (order: SalesOrder) => void;
  closeInvoiceModal: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  const [drawerState, setDrawerState] = useState<DrawerState>({
    isSaleDrawerOpen: false,
    isPurchaseDrawerOpen: false,
    isTransferDrawerOpen: false,
    isAdjustDrawerOpen: false,
    isStockHistoryOpen: false,
    isAddProductOpen: false,
    isInvoiceModalOpen: false,
  });

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      }
    } catch (e) {
      console.error('Failed to load inventory state from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage on every state mutation
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save inventory state to localStorage', e);
      }
    }
  }, [state, isHydrated]);

  // Derived computed metrics
  const totalInventoryValue = state.products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalRetailValue = state.products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);

  const totalSalesRevenue = state.salesOrders.reduce((acc, so) => acc + so.grandTotal, 0);
  const paidSalesRevenue = state.salesOrders
    .filter((so) => so.status === 'Paid')
    .reduce((acc, so) => acc + so.grandTotal, 0);
  const pendingSalesRevenue = state.salesOrders
    .filter((so) => so.status === 'Pending')
    .reduce((acc, so) => acc + so.grandTotal, 0);

  const totalPurchaseSpend = state.purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const pendingPurchaseSpend = state.purchaseOrders
    .filter((po) => po.status === 'Pending')
    .reduce((acc, po) => acc + po.totalAmount, 0);
  const pendingPurchasesCount = state.purchaseOrders.filter((po) => po.status === 'Pending').length;

  const lowStockCount = state.products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minLevel
  ).length;
  const outOfStockCount = state.products.filter((p) => p.currentStock <= 0).length;
  const totalSKUs = state.products.length;

  // Actions wrapped with notifications
  const createSalesOrder = (payload: Omit<SalesOrder, 'id'>): boolean => {
    // Validate stock
    for (const item of payload.items) {
      const prod = state.products.find((p) => p.id === item.productId);
      if (!prod) {
        toast.error(`Product not found: ${item.productName}`);
        return false;
      }
      const availableInGodown = prod.godownStock[payload.godownId] || 0;
      if (item.quantity > availableInGodown) {
        toast.error(
          `Insufficient stock for ${prod.name}! Requested ${item.quantity}, but only ${availableInGodown} available at selected godown.`
        );
        return false;
      }
    }

    dispatch({ type: 'CREATE_SALES_ORDER', payload });
    toast.success('Sales order created successfully!', {
      description: `Stock deducted and logged in audit ledger.`,
    });
    setDrawerState((prev) => ({ ...prev, isSaleDrawerOpen: false }));
    return true;
  };

  const markSalesOrderPaid = (orderId: string) => {
    dispatch({ type: 'MARK_SALES_ORDER_PAID', payload: { orderId } });
    toast.success(`Invoice ${orderId} marked as Paid!`, {
      description: 'Receivables updated in real time.',
    });
  };

  const createPurchaseOrder = (payload: Omit<PurchaseOrder, 'id'>) => {
    dispatch({ type: 'CREATE_PURCHASE_ORDER', payload });
    if (payload.status === 'Received') {
      toast.success('Purchase order created & stock added!', {
        description: `Units added to destination godown.`,
      });
    } else {
      toast.info('Purchase order created as Pending.', {
        description: 'Waiting for shipment delivery.',
      });
    }
    setDrawerState((prev) => ({ ...prev, isPurchaseDrawerOpen: false }));
  };

  const markPurchaseOrderReceived = (orderId: string) => {
    const po = state.purchaseOrders.find((p) => p.id === orderId);
    if (!po) return;

    dispatch({ type: 'MARK_PO_RECEIVED', payload: { orderId } });
    const totalItems = po.items.reduce((acc, it) => acc + it.quantity, 0);
    toast.success(`${po.id} marked as Received!`, {
      description: `+${totalItems} units added to stock. Dashboard updated.`,
    });
  };

  const transferStock = (payload: StockTransferPayload): boolean => {
    const prod = state.products.find((p) => p.id === payload.productId);
    if (!prod) return false;

    const available = prod.godownStock[payload.fromGodownId] || 0;
    if (available < payload.quantity) {
      toast.error(`Cannot transfer: source only has ${available} units.`);
      return false;
    }

    dispatch({ type: 'TRANSFER_STOCK', payload });
    toast.success('Stock transferred successfully!', {
      description: `Moved ${payload.quantity} units of ${prod.name}.`,
    });
    setDrawerState((prev) => ({ ...prev, isTransferDrawerOpen: false }));
    return true;
  };

  const adjustStock = (payload: StockAdjustmentPayload) => {
    dispatch({ type: 'ADJUST_STOCK', payload });
    const sign = payload.type === 'ADD' ? '+' : '-';
    toast.success('Stock adjusted successfully!', {
      description: `${sign}${payload.quantity} units recorded with reason.`,
    });
    setDrawerState((prev) => ({ ...prev, isAdjustDrawerOpen: false }));
  };

  const addProduct = (payload: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => {
    dispatch({ type: 'ADD_PRODUCT', payload });
    toast.success('New product cataloged!', {
      description: `${payload.name} (${payload.sku}) is now active.`,
    });
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: false }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET_DATA' });
    toast.info('Demo data reset to default seed!', {
      description: 'All sample orders, products, and godowns re-initialized.',
    });
  };

  // Drawer handlers
  const openCreateSaleDrawer = (prefilledProductId?: string) => {
    setDrawerState((prev) => ({
      ...prev,
      isSaleDrawerOpen: true,
      salePrefilledProductId: prefilledProductId,
    }));
  };

  const closeCreateSaleDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isSaleDrawerOpen: false, salePrefilledProductId: undefined }));
  };

  const openCreatePurchaseDrawer = (supplierId?: string, productId?: string) => {
    setDrawerState((prev) => ({
      ...prev,
      isPurchaseDrawerOpen: true,
      purchasePrefilledSupplierId: supplierId,
      purchasePrefilledProductId: productId,
    }));
  };

  const closeCreatePurchaseDrawer = () => {
    setDrawerState((prev) => ({
      ...prev,
      isPurchaseDrawerOpen: false,
      purchasePrefilledSupplierId: undefined,
      purchasePrefilledProductId: undefined,
    }));
  };

  const openTransferDrawer = (productId?: string) => {
    setDrawerState((prev) => ({
      ...prev,
      isTransferDrawerOpen: true,
      transferPrefilledProductId: productId,
    }));
  };

  const closeTransferDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isTransferDrawerOpen: false, transferPrefilledProductId: undefined }));
  };

  const openAdjustDrawer = (productId?: string) => {
    setDrawerState((prev) => ({
      ...prev,
      isAdjustDrawerOpen: true,
      adjustPrefilledProductId: productId,
    }));
  };

  const closeAdjustDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isAdjustDrawerOpen: false, adjustPrefilledProductId: undefined }));
  };

  const openStockHistoryDrawer = (productId: string) => {
    setDrawerState((prev) => ({
      ...prev,
      isStockHistoryOpen: true,
      stockHistoryProductId: productId,
    }));
  };

  const closeStockHistoryDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isStockHistoryOpen: false, stockHistoryProductId: undefined }));
  };

  const openAddProductDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: true }));
  };

  const closeAddProductDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: false }));
  };

  const openInvoiceModal = (order: SalesOrder) => {
    setDrawerState((prev) => ({ ...prev, isInvoiceModalOpen: true, selectedInvoice: order }));
  };

  const closeInvoiceModal = () => {
    setDrawerState((prev) => ({ ...prev, isInvoiceModalOpen: false, selectedInvoice: undefined }));
  };

  return (
    <InventoryContext.Provider
      value={{
        state,
        metrics: {
          totalInventoryValue,
          totalRetailValue,
          totalSalesRevenue,
          paidSalesRevenue,
          pendingSalesRevenue,
          totalPurchaseSpend,
          pendingPurchaseSpend,
          pendingPurchasesCount,
          lowStockCount,
          outOfStockCount,
          totalSKUs,
        },
        createSalesOrder,
        markSalesOrderPaid,
        createPurchaseOrder,
        markPurchaseOrderReceived,
        transferStock,
        adjustStock,
        addProduct,
        resetDemoData,
        drawerState,
        openCreateSaleDrawer,
        closeCreateSaleDrawer,
        openCreatePurchaseDrawer,
        closeCreatePurchaseDrawer,
        openTransferDrawer,
        closeTransferDrawer,
        openAdjustDrawer,
        closeAdjustDrawer,
        openStockHistoryDrawer,
        closeStockHistoryDrawer,
        openAddProductDrawer,
        closeAddProductDrawer,
        openInvoiceModal,
        closeInvoiceModal,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
