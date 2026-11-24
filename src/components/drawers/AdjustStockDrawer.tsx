'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, Minus } from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { toast } from 'sonner';

export function AdjustStockDrawer() {
  const { state, drawerState, closeAdjustDrawer, adjustStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(state.products[0]?.id || '');
  const [selectedGodownId, setSelectedGodownId] = useState(state.godowns[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState('Physical audit variance');

  useEffect(() => {
    if (drawerState.adjustPrefilledProductId) {
      setSelectedProductId(drawerState.adjustPrefilledProductId);
    }
  }, [drawerState.adjustPrefilledProductId]);

  const product = state.products.find((p) => p.id === selectedProductId);
  const currentDepotStock = product?.godownStock[selectedGodownId] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (quantity <= 0) {
      toast.error('Adjustment quantity must be greater than zero.');
      return;
    }
    if (adjustmentType === 'REMOVE' && quantity > currentDepotStock) {
      toast.error(`Cannot remove ${quantity} units: depot only has ${currentDepotStock} units.`);
      return;
    }

    adjustStock({
      productId: selectedProductId,
      godownId: selectedGodownId,
      type: adjustmentType,
      quantity,
      reason,
    });

    setQuantity(5);
  };

  return (
    <DrawerContainer
      isOpen={drawerState.isAdjustDrawerOpen}
      onClose={closeAdjustDrawer}
      title="Manual Stock Adjustment"
      subtitle="Reconcile physical warehouse stock counts with audited ledger records"
      width="md"
      footer={
        <>
          <button
            type="button"
            onClick={closeAdjustDrawer}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Apply Adjustment</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Godown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Depot Location <span className="text-rose-500">*</span>
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
          <p className="text-[11px] text-slate-500 mt-1">
            Current balance at this depot:{' '}
            <strong className="text-slate-800">{currentDepotStock} {product?.unit}</strong>
          </p>
        </div>

        {/* Type toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adjustment Direction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('ADD')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                adjustmentType === 'ADD'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Increase Stock (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('REMOVE')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                adjustmentType === 'REMOVE'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Minus className="h-4 w-4" />
              <span>Decrease Stock (-)</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adjustment Quantity ({product?.unit}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={adjustmentType === 'REMOVE' ? currentDepotStock : 99999}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
          />
        </div>

        {/* Reason selector & custom */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adjustment Reason / Audit Justification
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="Physical audit variance / reconciliation">
              Physical audit variance / reconciliation
            </option>
            <option value="Damaged in transit / packaging compromise">
              Damaged in transit / packaging compromise
            </option>
            <option value="Sample issued to client / marketing demonstration">
              Sample issued to client / marketing demonstration
            </option>
            <option value="Expired / obsolete stock disposal">
              Expired / obsolete stock disposal
            </option>
            <option value="Found surplus stock during cycle count">
              Found surplus stock during cycle count
            </option>
          </select>
        </div>
      </form>
    </DrawerContainer>
  );
}
