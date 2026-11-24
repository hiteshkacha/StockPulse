'use client';

import React, { useState } from 'react';
import { Boxes } from 'lucide-react';
import { DrawerContainer } from './DrawerContainer';
import { useInventory } from '@/context/InventoryContext';
import { ProductCategory } from '@/types/inventory';
import { toast } from 'sonner';

export function AddProductDrawer() {
  const { state, drawerState, closeAddProductDrawer, addProduct } = useInventory();

  const [name, setName] = useState('');
  const [sku, setSku] = useState(`SKU-EL-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [costPrice, setCostPrice] = useState(2500);
  const [sellingPrice, setSellingPrice] = useState(3800);
  const [currentStock, setCurrentStock] = useState(20);
  const [minLevel, setMinLevel] = useState(8);
  const [unit, setUnit] = useState('Units');
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id || '');
  const [description, setDescription] = useState('');
  const [selectedGodownId, setSelectedGodownId] = useState(state.godowns[0]?.id || '');

  const supplier = state.suppliers.find((s) => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }
    if (!sku.trim()) {
      toast.error('SKU identifier is required.');
      return;
    }
    if (costPrice <= 0 || sellingPrice <= 0) {
      toast.error('Prices must be greater than zero.');
      return;
    }

    // Allocate initial stock to chosen godown
    const godownStock: Record<string, number> = {};
    state.godowns.forEach((g) => {
      godownStock[g.id] = g.id === selectedGodownId ? currentStock : 0;
    });

    addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      costPrice,
      sellingPrice,
      currentStock,
      minLevel,
      unit,
      godownStock,
      supplierId: supplier?.id || 'SUP-001',
      supplierName: supplier?.name || 'Bharat ElectroCorp',
      description: description.trim() || `${name} cataloged for inventory operations.`,
    });

    // Reset
    setName('');
    setSku(`SKU-EL-${Math.floor(100 + Math.random() * 900)}`);
    setDescription('');
  };

  return (
    <DrawerContainer
      isOpen={drawerState.isAddProductOpen}
      onClose={closeAddProductDrawer}
      title="Add New Catalog SKU Product"
      subtitle="Define master item specs, unit economics, reorder thresholds, and depot storage"
      width="lg"
      footer={
        <>
          <button
            type="button"
            onClick={closeAddProductDrawer}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Boxes className="h-4 w-4" />
            <span>Catalog Product SKU</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and SKU */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Industrial Inverter Duty Motor 1.5HP"
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              SKU Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Electronics">Electronics</option>
              <option value="Industrial Hardware">Industrial Hardware</option>
              <option value="Packaging">Packaging</option>
              <option value="Office Equipment">Office Equipment</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cost Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={costPrice}
              onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Selling Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
            />
          </div>
        </div>

        {/* Stock Thresholds and Unit */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial Quantity
            </label>
            <input
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Min Stock Level
            </label>
            <input
              type="number"
              min="1"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Units">Units</option>
              <option value="Boxes">Boxes</option>
              <option value="Rolls">Rolls</option>
              <option value="Sets">Sets</option>
              <option value="Kg">Kg</option>
            </select>
          </div>
        </div>

        {/* Depot and Supplier */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial Godown Depot
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {state.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Technical Specs / Product Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Key technical specs, certifications, dimensions..."
            className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </form>
    </DrawerContainer>
  );
}
