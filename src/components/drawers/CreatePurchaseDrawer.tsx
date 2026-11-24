'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { formatINR } from '@/lib/utils';
import { PurchaseOrderItem } from '@/types/inventory';
import { toast } from 'sonner';

export function CreatePurchaseDrawer() {
  const {
    state,
    drawerState,
    closeCreatePurchaseDrawer,
    createPurchaseOrder,
  } = useInventory();

  const [selectedSupplierId, setSelectedSupplierId] = useState(state.suppliers[0]?.id || '');
  const [selectedDestinationGodownId, setSelectedDestinationGodownId] = useState(
    state.godowns[0]?.id || ''
  );
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isImmediatelyReceived, setIsImmediatelyReceived] = useState(false);
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: state.products[0]?.id || '', quantity: 20 },
  ]);
  const [notes, setNotes] = useState('');

  // Handle prefilled supplier or product
  useEffect(() => {
    if (drawerState.purchasePrefilledSupplierId) {
      setSelectedSupplierId(drawerState.purchasePrefilledSupplierId);
    }
    if (drawerState.purchasePrefilledProductId) {
      setItems([{ productId: drawerState.purchasePrefilledProductId, quantity: 25 }]);
    }
  }, [drawerState.purchasePrefilledSupplierId, drawerState.purchasePrefilledProductId]);

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

  // Compute live purchase order items
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
  const supplier = state.suppliers.find((s) => s.id === selectedSupplierId);
  const godown = state.godowns.find((g) => g.id === selectedDestinationGodownId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      toast.error('Please select a supplier.');
      return;
    }
    if (!godown) {
      toast.error('Please select a destination godown.');
      return;
    }

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierGst: supplier.gstin,
      supplierEmail: supplier.email,
      date: new Date().toISOString().split('T')[0],
      expectedDate,
      receivedDate: isImmediatelyReceived ? new Date().toISOString().split('T')[0] : undefined,
      items: computedItems,
      totalAmount,
      status: isImmediatelyReceived ? 'Received' : 'Pending',
      destinationGodownId: selectedDestinationGodownId,
      notes,
    });

    // Reset
    setNotes('');
    setIsImmediatelyReceived(false);
  };

  return (
    <DrawerContainer
      isOpen={drawerState.isPurchaseDrawerOpen}
      onClose={closeCreatePurchaseDrawer}
      title="Create Inward Purchase Order"
      subtitle="Procure inventory items from verified suppliers and track fulfillment"
      width="xl"
      footer={
        <>
          <button
            type="button"
            onClick={closeCreatePurchaseDrawer}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Truck className="h-4 w-4" />
            <span>{isImmediatelyReceived ? 'Save & Receive Stock Now' : 'Issue Purchase Order (Pending)'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier & Destination Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vendor / Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.contactPerson})
                </option>
              ))}
            </select>
            {supplier && (
              <p className="text-[11px] text-slate-500 mt-1">
                GSTIN: <span className="font-mono">{supplier.gstin}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Receiving Godown <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDestinationGodownId}
              onChange={(e) => setSelectedDestinationGodownId(e.target.value)}
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
                Manager: {godown.manager} • {godown.city}
              </p>
            )}
          </div>
        </div>

        {/* Expected Delivery Date & Immediate Receive Switch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isImmediatelyReceived}
                onChange={(e) => setIsImmediatelyReceived(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <div>
              <span className="text-xs font-semibold text-slate-800">
                Mark as Received Immediately
              </span>
              <p className="text-[11px] text-slate-500">
                Bypasses pending status and adds units to stock right now.
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Procurement Items ({items.length})
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
              const prod = state.products.find((p) => p.id === item.productId);

              return (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center gap-3"
                >
                  <div className="flex-1 w-full">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {state.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - Cost: {formatINR(p.costPrice)}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Unit Cost: {formatINR(prod?.costPrice || 0)}</span>
                      <span>•</span>
                      <span>Current Stock: {prod?.currentStock || 0} {prod?.unit}</span>
                    </div>
                  </div>

                  <div className="w-24 shrink-0">
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Order Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-800 font-mono text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
                    />
                  </div>

                  <div className="w-28 text-right shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      Total Cost
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                      {formatINR((prod?.costPrice || 0) * item.quantity)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Procurement Notes / PO Memo
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Q4 seasonal replenishment, payment upon arrival inspection..."
            className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* PO Total Value Summary */}
        <div className="rounded-xl bg-slate-900 text-white p-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-400">Total Purchase Commitment</div>
            <div className="text-[11px] text-slate-500">
              {computedItems.reduce((acc, it) => acc + it.quantity, 0)} total units requested
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {formatINR(totalAmount)}
            </span>
          </div>
        </div>
      </form>
    </DrawerContainer>
  );
}
