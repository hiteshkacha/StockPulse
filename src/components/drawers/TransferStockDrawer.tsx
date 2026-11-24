'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { toast } from 'sonner';

export function TransferStockDrawer() {
  const { state, drawerState, closeTransferDrawer, transferStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(state.products[0]?.id || '');
  const [fromGodownId, setFromGodownId] = useState(state.godowns[0]?.id || '');
  const [toGodownId, setToGodownId] = useState(state.godowns[1]?.id || state.godowns[0]?.id || '');
  const [quantity, setQuantity] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (drawerState.transferPrefilledProductId) {
      setSelectedProductId(drawerState.transferPrefilledProductId);
    }
  }, [drawerState.transferPrefilledProductId]);

  const product = state.products.find((p) => p.id === selectedProductId);
  const availableAtSource = product?.godownStock[fromGodownId] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromGodownId === toGodownId) {
      toast.error('Source and destination godowns must be different.');
      return;
    }
    if (quantity <= 0) {
      toast.error('Transfer quantity must be greater than zero.');
      return;
    }
    if (quantity > availableAtSource) {
      toast.error(
        `Insufficient stock! Only ${availableAtSource} units available at the source depot.`
      );
      return;
    }

    const success = transferStock({
      productId: selectedProductId,
      fromGodownId,
      toGodownId,
      quantity,
      notes,
    });

    if (success) {
      setNotes('');
      setQuantity(5);
    }
  };

  return (
    <DrawerContainer
      isOpen={drawerState.isTransferDrawerOpen}
      onClose={closeTransferDrawer}
      title="Inter-Godown Stock Transfer"
      subtitle="Relocate stock between regional depots while maintaining full ledger traceability"
      width="lg"
      footer={
        <>
          <button
            type="button"
            onClick={closeTransferDrawer}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Confirm & Transfer Units</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Total: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Current godown distribution preview */}
        {product && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Current Depot Holdings for {product.sku}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {state.godowns.map((g) => (
                <div key={g.id} className="p-2 bg-white rounded-lg border border-slate-200/80 text-center">
                  <div className="text-[10px] text-slate-500 font-medium truncate">{g.city}</div>
                  <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                    {product.godownStock[g.id] || 0} {product.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              From Godown (Origin) <span className="text-rose-500">*</span>
            </label>
            <select
              value={fromGodownId}
              onChange={(e) => setFromGodownId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.godowns.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Available: <span className="font-bold text-slate-800">{availableAtSource} units</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              To Godown (Destination) <span className="text-rose-500">*</span>
            </label>
            <select
              value={toGodownId}
              onChange={(e) => setToGodownId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.godowns.map((g) => (
                <option key={g.id} value={g.id} disabled={g.id === fromGodownId}>
                  {g.name} {g.id === fromGodownId ? '(Source)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Transfer Quantity ({product?.unit}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={availableAtSource}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
          />
        </div>

        {/* Transfer Memo */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Transfer Reason / Dispatch Challan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Stock balancing for North India sales surge, Challan #CH-8821..."
            className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </form>
    </DrawerContainer>
  );
}
