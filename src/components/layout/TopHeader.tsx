'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Plus,
  Receipt,
  ShoppingCart,
  Boxes,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronDown,
  Warehouse,
  ExternalLink,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/utils';

export function TopHeader() {
  const pathname = usePathname();
  const {
    state,
    openCreateSaleDrawer,
    openCreatePurchaseDrawer,
    openTransferDrawer,
    openAdjustDrawer,
    openAddProductDrawer,
    openStockHistoryDrawer,
    openInvoiceModal,
  } = useInventory();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close new dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const getBreadcrumb = () => {
    switch (pathname) {
      case '/':
        return { section: 'Overview', title: 'Executive Operations Dashboard' };
      case '/sales':
        return { section: 'Commercial', title: 'Sales Orders & GST Invoices' };
      case '/purchases':
        return { section: 'Procurement', title: 'Purchase Orders & Inward Supply' };
      case '/stock':
        return { section: 'Inventory', title: 'Stock & Item Master Ledger' };
      case '/reports':
        return { section: 'Intelligence', title: 'Business & Valuation Reports' };
      case '/godowns':
        return { section: 'Logistics', title: 'Godown Warehouses & Inter-Depot Transfers' };
      default:
        return { section: 'Workspace', title: 'StockPulse SMB' };
    }
  };

  const breadcrumb = getBreadcrumb();

  // Instant global search filtering
  const matchingProducts = searchQuery.trim()
    ? state.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const matchingSales = searchQuery.trim()
    ? state.salesOrders
        .filter(
          (s) =>
            s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const matchingPurchases = searchQuery.trim()
    ? state.purchaseOrders
        .filter(
          (p) =>
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const hasSearchResults =
    matchingProducts.length > 0 || matchingSales.length > 0 || matchingPurchases.length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Breadcrumb section */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>StockPulse</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">{breadcrumb.section}</span>
        </div>
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          {breadcrumb.title}
        </h1>
      </div>

      {/* Right controls: Global Search + Quick Action + Workspace */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative" ref={searchContainerRef}>
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 rounded-lg px-3 py-1.5 w-64 md:w-80 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search products, SKUs, invoices..."
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Search Popover Result */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              {!hasSearchResults ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching items or orders found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {/* Products */}
                  {matchingProducts.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Products ({matchingProducts.length})
                      </div>
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            openStockHistoryDrawer(p.id);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-medium text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {p.sku} • {p.currentStock} {p.unit} in stock
                            </div>
                          </div>
                          <span className="font-semibold text-slate-700">
                            {formatINR(p.sellingPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sales Orders */}
                  {matchingSales.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Sales Orders ({matchingSales.length})
                      </div>
                      {matchingSales.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            openInvoiceModal(s);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="font-medium text-slate-900 font-mono">{s.id}</div>
                            <div className="text-[11px] text-slate-500">{s.customerName}</div>
                          </div>
                          <span className="font-semibold text-slate-700">
                            {formatINR(s.grandTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Purchase Orders */}
                  {matchingPurchases.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Purchase Orders ({matchingPurchases.length})
                      </div>
                      {matchingPurchases.map((po) => (
                        <div
                          key={po.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-slate-900 font-mono">{po.id}</div>
                            <div className="text-[11px] text-slate-500">{po.supplierName}</div>
                          </div>
                          <span className="font-semibold text-slate-700">
                            {formatINR(po.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action "+ New" Button & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Action</span>
            <ChevronDown className="h-3 w-3 opacity-75" />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  openCreateSaleDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <Receipt className="h-4 w-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">New Sales Order</div>
                  <div className="text-[10px] text-slate-500">Sell goods and deduct stock</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  openCreatePurchaseDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <ShoppingCart className="h-4 w-4 text-indigo-600" />
                <div>
                  <div className="font-semibold">Create Purchase Order</div>
                  <div className="text-[10px] text-slate-500">Order from supplier</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  openTransferDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                <div>
                  <div className="font-semibold">Transfer Stock</div>
                  <div className="text-[10px] text-slate-500">Move between Godowns</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  openAdjustDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <SlidersHorizontal className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-semibold">Adjust Stock</div>
                  <div className="text-[10px] text-slate-500">Manual +/- correction</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  openAddProductDrawer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <Boxes className="h-4 w-4 text-slate-600" />
                <div>
                  <div className="font-semibold">Add New Product</div>
                  <div className="text-[10px] text-slate-500">Catalog new SKU</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
