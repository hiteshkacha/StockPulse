'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/format';
import { PurchaseOrderItem } from '@/types/inventory';
import { toast } from 'sonner';

export function CreatePurchaseDrawer() {
  const { state, drawerState, closeCreatePurchaseDrawer, createPurchaseOrder } = useInventory();

  const [selectedSupplierId, setSelectedSupplierId] = useState(state.suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: state.products[0]?.id || '', quantity: 15 },
  ]);
  const [isImmediatelyReceived, setIsImmediatelyReceived] = useState(false);

  // Handle prefilled item if opened via "Reorder" button on Dashboard
  useEffect(() => {
    if (drawerState.purchasePrefilledProductId) {
      setItems([{ productId: drawerState.purchasePrefilledProductId, quantity: 20 }]);
    }
    if (drawerState.purchasePrefilledSupplierId) {
      setSelectedSupplierId(drawerState.purchasePrefilledSupplierId);
    }
  }, [drawerState.purchasePrefilledProductId, drawerState.purchasePrefilledSupplierId]);

  const supplier = state.suppliers.find((s) => s.id === selectedSupplierId);

  const handleAddItem = () => {
    const existingIds = new Set(items.map((i) => i.productId));
    const available = state.products.find((p) => !existingIds.has(p.id)) || state.products[0];
    if (available) {
      setItems([...items, { productId: available.id, quantity: 10 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.info('A purchase order must have at least one line item.');
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

  const computedItems: PurchaseOrderItem[] = items.map((item) => {
    const prod = state.products.find((p) => p.id === item.productId);
    const unitCost = prod ? prod.costPrice : 0;
    return {
      productId: item.productId,
      sku: prod?.sku || '',
      productName: prod?.name || '',
      quantity: item.quantity,
      unitCost,
      total: unitCost * item.quantity,
    };
  });

  const totalAmount = computedItems.reduce((acc, it) => acc + it.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      toast.error('Please select a supplier.');
      return;
    }

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: new Date().toISOString().split('T')[0],
      expectedDate,
      receivedDate: isImmediatelyReceived ? new Date().toISOString().split('T')[0] : undefined,
      items: computedItems,
      totalAmount,
      status: isImmediatelyReceived ? 'Received' : 'Pending',
    });

    setIsImmediatelyReceived(false);
  };

  return (
    <Drawer
      isOpen={drawerState.isPurchaseDrawerOpen}
      onClose={closeCreatePurchaseDrawer}
      title="New Purchase Order"
      subtitle="Issue procurement order to supplier"
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={closeCreatePurchaseDrawer}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<Truck size={15} />}
          >
            {isImmediatelyReceived ? 'Save & Receive Stock' : 'Issue Purchase Order'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Supplier */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Supplier <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {state.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.contactPerson})
              </option>
            ))}
          </select>
        </div>

        {/* Expected Delivery Date & Immediate Receive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="immediatelyReceived"
              checked={isImmediatelyReceived}
              onChange={(e) => setIsImmediatelyReceived(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="immediatelyReceived" className="text-xs font-medium text-slate-700 cursor-pointer">
              Mark as Received immediately
            </label>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Order Items</label>
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
                    <div className="text-slate-500">
                      Unit Cost: <span className="font-semibold text-slate-700">{formatINR(prod?.costPrice || 0)}</span>
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
                      {formatINR((prod?.costPrice || 0) * item.quantity)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Cost */}
        <div className="rounded-xl bg-slate-900 text-white p-4 flex justify-between items-center text-xs">
          <span className="text-slate-300">Total Purchase Value:</span>
          <span className="text-base font-semibold tabular-nums text-emerald-400">
            {formatINR(totalAmount)}
          </span>
        </div>
      </form>
    </Drawer>
  );
}
