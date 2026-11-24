'use client';

import React, { useState } from 'react';
import { Boxes } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
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

  const supplier = state.suppliers.find((s) => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product title is required.');
      return;
    }
    if (!sku.trim()) {
      toast.error('SKU identifier is required.');
      return;
    }

    addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      costPrice,
      sellingPrice,
      currentStock,
      minLevel,
      unit,
      supplierId: supplier?.id || 'SUP-001',
      supplierName: supplier?.name || 'Bharat ElectroCorp',
    });

    setName('');
    setSku(`SKU-EL-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <Drawer
      isOpen={drawerState.isAddProductOpen}
      onClose={closeAddProductDrawer}
      title="Add Item"
      subtitle="Catalog new product SKU into inventory"
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={closeAddProductDrawer}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<Boxes size={15} />}
          >
            Add Item
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Servo Motor 1.5HP"
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              SKU <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Electronics">Electronics</option>
              <option value="Industrial Hardware">Industrial Hardware</option>
              <option value="Packaging">Packaging</option>
              <option value="Office Equipment">Office Equipment</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cost Price (₹)
            </label>
            <input
              type="number"
              min="1"
              value={costPrice}
              onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Selling Price (₹)
            </label>
            <input
              type="number"
              min="1"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Qty</label>
            <input
              type="number"
              min="0"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Min Level</label>
            <input
              type="number"
              min="1"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Units">Units</option>
              <option value="Boxes">Boxes</option>
              <option value="Rolls">Rolls</option>
              <option value="Sets">Sets</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {state.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Drawer>
  );
}
