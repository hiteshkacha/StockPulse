'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, ShoppingCart } from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/utils';
import { OrderItem } from '@/types/inventory';
import { toast } from 'sonner';

export function CreateSaleDrawer() {
  const {
    state,
    drawerState,
    closeCreateSaleDrawer,
    createSalesOrder,
  } = useInventory();

  const [selectedCustomerId, setSelectedCustomerId] = useState(state.customers[0]?.id || '');
  const [selectedGodownId, setSelectedGodownId] = useState(state.godowns[0]?.id || '');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: state.products[0]?.id || '', quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');

  // Handle prefilled product if opened from Quick Action or Product row
  useEffect(() => {
    if (drawerState.salePrefilledProductId) {
      setItems([{ productId: drawerState.salePrefilledProductId, quantity: 1 }]);
    }
  }, [drawerState.salePrefilledProductId]);

  const handleAddItem = () => {
    // Pick first product not already in items
    const existingIds = new Set(items.map((i) => i.productId));
    const availableProduct = state.products.find((p) => !existingIds.has(p.id)) || state.products[0];
    if (availableProduct) {
      setItems([...items, { productId: availableProduct.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.info('A sales order must have at least one line item.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...items];
    updated[index].productId = productId;
    setItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  // Compute live line items
  const computedLineItems: OrderItem[] = items.map((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    const unitPrice = product ? product.sellingPrice : 0;
    return {
      productId: item.productId,
      sku: product?.sku || '',
      productName: product?.name || '',
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
    };
  });

  const subtotal = computedLineItems.reduce((acc, it) => acc + it.total, 0);
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  // Validation
  const customer = state.customers.find((c) => c.id === selectedCustomerId);
  const godown = state.godowns.find((g) => g.id === selectedGodownId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Please select a customer.');
      return;
    }
    if (!godown) {
      toast.error('Please select a dispatch godown.');
      return;
    }

    const success = createSalesOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerGst: customer.gstin,
      customerAddress: `${customer.address}, ${customer.city}`,
      date: new Date().toISOString().split('T')[0],
      items: computedLineItems,
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
      status: 'Pending',
      godownId: selectedGodownId,
      notes,
    });

    if (success) {
      // Reset form
      setNotes('');
      setItems([{ productId: state.products[0]?.id || '', quantity: 1 }]);
    }
  };

  return (
    <DrawerContainer
      isOpen={drawerState.isSaleDrawerOpen}
      onClose={closeCreateSaleDrawer}
      title="Create New Sales Order & Invoice"
      subtitle="Orders deduct stock immediately from the chosen warehouse depot"
      width="xl"
      footer={
        <>
          <button
            type="button"
            onClick={closeCreateSaleDrawer}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Generate Order & Deduct Stock</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Godown Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
            {customer && (
              <p className="text-[11px] text-slate-500 mt-1">
                GSTIN: <span className="font-mono">{customer.gstin}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dispatch From Godown <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedGodownId}
              onChange={(e) => setSelectedGodownId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.godowns.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {godown && (
              <p className="text-[11px] text-slate-500 mt-1">
                Managed by {godown.manager} • {godown.city}
              </p>
            )}
          </div>
        </div>

        {/* Order Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Line Items ({items.length})
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const product = state.products.find((p) => p.id === item.productId);
              const availableInGodown = product?.godownStock[selectedGodownId] || 0;
              const hasInsufficientStock = item.quantity > availableInGodown;

              return (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center gap-3"
                >
                  {/* Product selector */}
                  <div className="flex-1 w-full">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {state.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {formatINR(p.sellingPrice)}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="text-slate-500">
                        At depot:{' '}
                        <span
                          className={
                            availableInGodown > 0
                              ? 'font-bold text-emerald-600'
                              : 'font-bold text-rose-600'
                          }
                        >
                          {availableInGodown} {product?.unit}
                        </span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        Unit Price: {formatINR(product?.sellingPrice || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity input */}
                  <div className="w-24 shrink-0">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={availableInGodown || 99999}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-800 font-mono text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="w-28 text-right shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Line Total
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                      {formatINR((product?.sellingPrice || 0) * item.quantity)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {hasInsufficientStock && (
                    <div className="w-full flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>
                        Requested {item.quantity} exceeds depot stock ({availableInGodown})!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Internal Order Notes / Payment Terms
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Net 15 days, dispatched via express freight, PO reference #..."
            className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* GST & Financial Calculation Summary */}
        <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Subtotal (Exclusive of GST):</span>
            <span className="font-mono tabular-nums">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>GST @ 18% (CGST 9% + SGST 9%):</span>
            <span className="font-mono tabular-nums">{formatINR(taxAmount)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
            <span>Invoice Grand Total (INR):</span>
            <span className="font-mono tabular-nums text-emerald-400">{formatINR(grandTotal)}</span>
          </div>
        </div>
      </form>
    </DrawerContainer>
  );
}
