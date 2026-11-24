'use client';

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'sonner';
import {
  Customer,
  InventoryState,
  Product,
  PurchaseOrder,
  SalesOrder,
  StockMovement,
  Supplier,
} from '@/types/inventory';
import { INITIAL_STATE } from '@/data/seed';

const STORAGE_KEY = 'stockpulse_state_v2';

type InventoryAction =
  | { type: 'HYDRATE'; payload: InventoryState }
  | { type: 'CREATE_SALES_ORDER'; payload: Omit<SalesOrder, 'id'> }
  | { type: 'MARK_SALES_ORDER_PAID'; payload: { orderId: string } }
  | { type: 'CREATE_PURCHASE_ORDER'; payload: Omit<PurchaseOrder, 'id'> }
  | { type: 'MARK_PO_RECEIVED'; payload: { orderId: string } }
  | {
      type: 'ADJUST_STOCK';
      payload: {
        productId: string;
        type: 'ADD' | 'REMOVE';
        quantity: number;
        reason: string;
      };
    }
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id'> }
  | { type: 'RESET_DATA' };

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'CREATE_SALES_ORDER': {
      const orderCount = state.salesOrders.length + 1;
      const orderId = `SO-2026-${String(orderCount).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newOrder: SalesOrder = {
        ...action.payload,
        id: orderId,
      };

      const updatedProducts = [...state.products];
      const newMovements: StockMovement[] = [];

      for (const item of newOrder.items) {
        const pIndex = updatedProducts.findIndex((p) => p.id === item.productId);
        if (pIndex !== -1) {
          const product = updatedProducts[pIndex];
          const newStock = Math.max(0, product.currentStock - item.quantity);
          updatedProducts[pIndex] = {
            ...product,
            currentStock: newStock,
          };

          newMovements.push({
            id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'OUT',
            referenceId: orderId,
            quantityDelta: -item.quantity,
            runningBalance: newStock,
            notes: `Sale to ${newOrder.customerName}`,
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
      const poCount = state.purchaseOrders.length + 1;
      const poId = `PO-2026-${String(poCount).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newPO: PurchaseOrder = {
        ...action.payload,
        id: poId,
      };

      if (newPO.status === 'Received') {
        const updatedProducts = [...state.products];
        const newMovements: StockMovement[] = [];

        for (const item of newPO.items) {
          const pIndex = updatedProducts.findIndex((p) => p.id === item.productId);
          if (pIndex !== -1) {
            const product = updatedProducts[pIndex];
            const newStock = product.currentStock + item.quantity;
            updatedProducts[pIndex] = {
              ...product,
              currentStock: newStock,
            };

            newMovements.push({
              id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: now,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'IN',
              referenceId: poId,
              quantityDelta: item.quantity,
              runningBalance: newStock,
              notes: `Inward from ${newPO.supplierName}`,
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
      const targetPO = state.purchaseOrders.find((p) => p.id === action.payload.orderId);
      if (!targetPO || targetPO.status === 'Received') return state;

      const now = new Date().toISOString();
      const updatedProducts = [...state.products];
      const newMovements: StockMovement[] = [];

      for (const item of targetPO.items) {
        const pIndex = updatedProducts.findIndex((p) => p.id === item.productId);
        if (pIndex !== -1) {
          const product = updatedProducts[pIndex];
          const newStock = product.currentStock + item.quantity;
          updatedProducts[pIndex] = {
            ...product,
            currentStock: newStock,
          };

          newMovements.push({
            id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'IN',
            referenceId: targetPO.id,
            quantityDelta: item.quantity,
            runningBalance: newStock,
            notes: `Inward receipt from ${targetPO.supplierName}`,
          });
        }
      }

      return {
        ...state,
        products: updatedProducts,
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === targetPO.id
            ? { ...po, status: 'Received', receivedDate: now.split('T')[0] }
            : po
        ),
        stockMovements: [...newMovements, ...state.stockMovements],
      };
    }

    case 'ADJUST_STOCK': {
      const { productId, type, quantity, reason } = action.payload;
      const pIndex = state.products.findIndex((p) => p.id === productId);
      if (pIndex === -1) return state;

      const product = state.products[pIndex];
      const delta = type === 'ADD' ? quantity : -quantity;
      const newStock = Math.max(0, product.currentStock + delta);
      const now = new Date().toISOString();
      const adjId = `ADJ-2026-${String(Math.floor(100 + Math.random() * 900))}`;

      const updatedProducts = [...state.products];
      updatedProducts[pIndex] = {
        ...product,
        currentStock: newStock,
      };

      const newMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        timestamp: now,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: 'ADJUSTMENT',
        referenceId: adjId,
        quantityDelta: delta,
        runningBalance: newStock,
        notes: reason || `Manual stock adjustment (${delta > 0 ? '+' : ''}${delta})`,
      };

      return {
        ...state,
        products: updatedProducts,
        stockMovements: [newMovement, ...state.stockMovements],
      };
    }

    case 'ADD_PRODUCT': {
      const prodId = `PROD-${String(state.products.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newProduct: Product = {
        ...action.payload,
        id: prodId,
      };

      const initMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        timestamp: now,
        productId: prodId,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'INITIAL',
        referenceId: 'INIT-NEW',
        quantityDelta: newProduct.currentStock,
        runningBalance: newProduct.currentStock,
        notes: 'Initial inventory baseline upon item cataloging',
      };

      return {
        ...state,
        products: [newProduct, ...state.products],
        stockMovements: [initMovement, ...state.stockMovements],
      };
    }

    case 'RESET_DATA':
      return INITIAL_STATE;

    default:
      return state;
  }
}

interface DrawerState {
  isSaleDrawerOpen: boolean;
  isPurchaseDrawerOpen: boolean;
  purchasePrefilledProductId?: string;
  purchasePrefilledSupplierId?: string;
  isStockHistoryOpen: boolean;
  stockHistoryProductId?: string;
  isAdjustDrawerOpen: boolean;
  adjustPrefilledProductId?: string;
  isAddProductOpen: boolean;
  selectedSaleOrder?: SalesOrder;
}

interface InventoryContextType {
  state: InventoryState;
  createSalesOrder: (payload: Omit<SalesOrder, 'id'>) => boolean;
  markSalesOrderPaid: (orderId: string) => void;
  createPurchaseOrder: (payload: Omit<PurchaseOrder, 'id'>) => void;
  markPurchaseOrderReceived: (orderId: string) => void;
  adjustStock: (productId: string, type: 'ADD' | 'REMOVE', quantity: number, reason: string) => void;
  addProduct: (payload: Omit<Product, 'id'>) => void;
  resetDemoData: () => void;
  // Drawer controls
  drawerState: DrawerState;
  openCreateSaleDrawer: () => void;
  closeCreateSaleDrawer: () => void;
  openCreatePurchaseDrawer: (supplierId?: string, productId?: string) => void;
  closeCreatePurchaseDrawer: () => void;
  openStockHistoryDrawer: (productId: string) => void;
  closeStockHistoryDrawer: () => void;
  openAdjustDrawer: (productId?: string) => void;
  closeAdjustDrawer: () => void;
  openAddProductDrawer: () => void;
  closeAddProductDrawer: () => void;
  openSaleDetailDrawer: (order: SalesOrder) => void;
  closeSaleDetailDrawer: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  const [drawerState, setDrawerState] = useState<DrawerState>({
    isSaleDrawerOpen: false,
    isPurchaseDrawerOpen: false,
    isStockHistoryOpen: false,
    isAdjustDrawerOpen: false,
    isAddProductOpen: false,
  });

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save state to localStorage', e);
      }
    }
  }, [state, isHydrated]);

  // Actions
  const createSalesOrder = (payload: Omit<SalesOrder, 'id'>): boolean => {
    for (const item of payload.items) {
      const prod = state.products.find((p) => p.id === item.productId);
      if (!prod) {
        toast.error(`Item not found: ${item.productName}`);
        return false;
      }
      if (item.quantity > prod.currentStock) {
        toast.error(
          `Cannot sell ${item.quantity} units of ${prod.name}: only ${prod.currentStock} available.`
        );
        return false;
      }
    }

    dispatch({ type: 'CREATE_SALES_ORDER', payload });
    toast.success('Sales order created', {
      description: `Stock deducted and logged in history.`,
    });
    setDrawerState((prev) => ({ ...prev, isSaleDrawerOpen: false }));
    return true;
  };

  const markSalesOrderPaid = (orderId: string) => {
    dispatch({ type: 'MARK_SALES_ORDER_PAID', payload: { orderId } });
    toast.success(`${orderId} marked as Paid`);
  };

  const createPurchaseOrder = (payload: Omit<PurchaseOrder, 'id'>) => {
    dispatch({ type: 'CREATE_PURCHASE_ORDER', payload });
    if (payload.status === 'Received') {
      const totalUnits = payload.items.reduce((acc, it) => acc + it.quantity, 0);
      toast.success(`Purchase order created: +${totalUnits} units added to stock`);
    } else {
      toast.info('Purchase order created (Pending)');
    }
    setDrawerState((prev) => ({ ...prev, isPurchaseDrawerOpen: false }));
  };

  const markPurchaseOrderReceived = (orderId: string) => {
    const po = state.purchaseOrders.find((p) => p.id === orderId);
    if (!po) return;

    dispatch({ type: 'MARK_PO_RECEIVED', payload: { orderId } });
    const firstItem = po.items[0];
    const totalUnits = po.items.reduce((acc, it) => acc + it.quantity, 0);
    toast.success(`${po.id} received: +${totalUnits} ${firstItem?.productName || 'units'}`);
  };

  const adjustStock = (
    productId: string,
    type: 'ADD' | 'REMOVE',
    quantity: number,
    reason: string
  ) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;

    if (type === 'REMOVE' && quantity > product.currentStock) {
      toast.error(`Cannot reduce by ${quantity}: only ${product.currentStock} available.`);
      return;
    }

    dispatch({
      type: 'ADJUST_STOCK',
      payload: { productId, type, quantity, reason },
    });
    const sign = type === 'ADD' ? '+' : '-';
    toast.success(`Stock adjusted: ${sign}${quantity} ${product.name}`);
    setDrawerState((prev) => ({ ...prev, isAdjustDrawerOpen: false }));
  };

  const addProduct = (payload: Omit<Product, 'id'>) => {
    dispatch({ type: 'ADD_PRODUCT', payload });
    toast.success(`Product added: ${payload.name} (${payload.sku})`);
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: false }));
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'RESET_DATA' });
    toast.info('Demo data restored to initial seed');
  };

  // Drawer helpers
  const openCreateSaleDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isSaleDrawerOpen: true }));
  };
  const closeCreateSaleDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isSaleDrawerOpen: false }));
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

  const openAddProductDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: true }));
  };
  const closeAddProductDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isAddProductOpen: false }));
  };

  const openSaleDetailDrawer = (order: SalesOrder) => {
    setDrawerState((prev) => ({ ...prev, selectedSaleOrder: order }));
  };
  const closeSaleDetailDrawer = () => {
    setDrawerState((prev) => ({ ...prev, selectedSaleOrder: undefined }));
  };

  return (
    <InventoryContext.Provider
      value={{
        state,
        createSalesOrder,
        markSalesOrderPaid,
        createPurchaseOrder,
        markPurchaseOrderReceived,
        adjustStock,
        addProduct,
        resetDemoData,
        drawerState,
        openCreateSaleDrawer,
        closeCreateSaleDrawer,
        openCreatePurchaseDrawer,
        closeCreatePurchaseDrawer,
        openStockHistoryDrawer,
        closeStockHistoryDrawer,
        openAdjustDrawer,
        closeAdjustDrawer,
        openAddProductDrawer,
        closeAddProductDrawer,
        openSaleDetailDrawer,
        closeSaleDetailDrawer,
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
