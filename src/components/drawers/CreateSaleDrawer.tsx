'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/format';
import { OrderItem } from '@/types/inventory';
import { toast } from 'sonner';

export function CreateSaleDrawer() {
  const { state, drawerState, closeCreateSaleDrawer, createSalesOrder } = useInventory();

  const [selectedCustomerId, setSelectedCustomerId] = useState(state.customers[0]?.id || '');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: state.products[0]?.id || '', quantity: 1 },
  ]);

  const customer = state.customers.find((c) => c.id === selectedCustomerId);

  const handleAddItem = () => {
    const existingIds = new Set(items.map((i) => i.productId));
    const available = state.products.find((p) => !existingIds.has(p.id)) || state.products[0];
    if (available) {
      setItems([...items, { productId: available.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.info('An order must have at least one product item.');
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
  const taxAmount = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + taxAmount;

  // Stock check validation
  const invalidItems = items.filter((item) => {
    const prod = state.products.find((p) => p.id === item.productId);
    return prod ? item.quantity > prod.currentStock : true;
  });

  const hasStockError = invalidItems.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      toast.error('Please select a customer.');
      return;
    }

    if (hasStockError) {
      toast.error('Please adjust item quantities that exceed available stock.');
      return;
    }

    const success = createSalesOrder({
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString().split('T')[0],
      items: computedLineItems,
      subtotal,
      taxAmount,
      grandTotal,
      status: 'Pending',
    });

    if (success) {
      setItems([{ productId: state.products[0]?.id || '', quantity: 1 }]);
    }
  };

  return (
    <Drawer
      isOpen={drawerState.isSaleDrawerOpen}
      onClose={closeCreateSaleDrawer}
      title="New Sales Order"
      subtitle="Record customer order and deduct stock from inventory"
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={closeCreateSaleDrawer}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={hasStockError}
            icon={<ShoppingBag size={15} />}
          >
            Create Order
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Customer <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {state.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Line Items</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={14} />
              <span>Add item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const prod = state.products.find((p) => p.id === item.productId);
              const available = prod?.currentStock || 0;
              const isOverStock = item.quantity > available;

              return (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="w-full text-xs rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {state.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Remove row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Available:</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          available > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {available} {prod?.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-slate-500">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="w-20 text-xs rounded-md border border-slate-200 bg-white px-2 py-1 text-right font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="text-right font-semibold text-slate-800 tabular-nums">
                      {formatINR((prod?.sellingPrice || 0) * item.quantity)}
                    </div>
                  </div>

                  {/* Inline Error Warning */}
                  {isOverStock && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1 border-t border-rose-100">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>
                        Requested {item.quantity} exceeds available stock ({available})!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span className="font-semibold tabular-nums">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>GST (18%):</span>
            <span className="font-semibold tabular-nums">{formatINR(taxAmount)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-semibold text-white">
            <span>Grand Total:</span>
            <span className="font-semibold tabular-nums text-emerald-400">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
