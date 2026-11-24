'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, Minus } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/context/InventoryContext';
import { toast } from 'sonner';

export function AdjustStockDrawer() {
  const { state, drawerState, closeAdjustDrawer, adjustStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(state.products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState('Cycle count audit variance');

  useEffect(() => {
    if (drawerState.adjustPrefilledProductId) {
      setSelectedProductId(drawerState.adjustPrefilledProductId);
    }
  }, [drawerState.adjustPrefilledProductId]);

  const product = state.products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (quantity <= 0) {
      toast.error('Adjustment quantity must be greater than zero.');
      return;
    }
    if (adjustmentType === 'REMOVE' && quantity > product.currentStock) {
      toast.error(`Cannot remove ${quantity}: current stock is ${product.currentStock}.`);
      return;
    }

    adjustStock(selectedProductId, adjustmentType, quantity, reason);
    setQuantity(5);
  };

  const currentStock = product?.currentStock || 0;
  const previewStock =
    adjustmentType === 'ADD' ? currentStock + quantity : Math.max(0, currentStock - quantity);

  return (
    <Drawer
      isOpen={drawerState.isAdjustDrawerOpen}
      onClose={closeAdjustDrawer}
      title="Adjust Stock"
      subtitle="Reconcile physical inventory discrepancies"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={closeAdjustDrawer}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<SlidersHorizontal size={15} />}
          >
            Apply Adjustment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Stock: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Action</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('ADD')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                adjustmentType === 'ADD'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Plus size={14} />
              <span>Increase Stock (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('REMOVE')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                adjustmentType === 'REMOVE'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Minus size={14} />
              <span>Decrease Stock (-)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
            <span>Current: <strong>{currentStock}</strong></span>
            <span>New Balance: <strong className="text-slate-900">{previewStock}</strong></span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Cycle count audit variance">Cycle count audit variance</option>
            <option value="Damaged goods disposed">Damaged goods disposed</option>
            <option value="Sample issued for inspection">Sample issued for inspection</option>
            <option value="Returned stock from customer">Returned stock from customer</option>
          </select>
        </div>
      </form>
    </Drawer>
  );
}
