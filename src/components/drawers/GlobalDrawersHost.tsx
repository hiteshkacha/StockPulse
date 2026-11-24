'use client';

import React from 'react';
import { CreateSaleDrawer } from './CreateSaleDrawer';
import { CreatePurchaseDrawer } from './CreatePurchaseDrawer';
import { StockHistoryDrawer } from './StockHistoryDrawer';
import { AdjustStockDrawer } from './AdjustStockDrawer';
import { AddProductDrawer } from './AddProductDrawer';
import { SaleDetailDrawer } from './SaleDetailDrawer';

export function GlobalDrawersHost() {
  return (
    <>
      <CreateSaleDrawer />
      <CreatePurchaseDrawer />
      <StockHistoryDrawer />
      <AdjustStockDrawer />
      <AddProductDrawer />
      <SaleDetailDrawer />
    </>
  );
}
