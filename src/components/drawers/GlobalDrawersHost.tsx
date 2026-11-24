'use client';

import React from 'react';
import { CreateSaleDrawer } from './CreateSaleDrawer';
import { CreatePurchaseDrawer } from './CreatePurchaseDrawer';
import { StockHistoryDrawer } from './StockHistoryDrawer';
import { TransferStockDrawer } from './TransferStockDrawer';
import { AdjustStockDrawer } from './AdjustStockDrawer';
import { AddProductDrawer } from './AddProductDrawer';
import { InvoiceModal } from '@/components/modals/InvoiceModal';

export function GlobalDrawersHost() {
  return (
    <>
      <CreateSaleDrawer />
      <CreatePurchaseDrawer />
      <StockHistoryDrawer />
      <TransferStockDrawer />
      <AdjustStockDrawer />
      <AddProductDrawer />
      <InvoiceModal />
    </>
  );
}
