'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useInventory } from '@/context/InventoryContext';
import { formatDate, formatINR } from '@/lib/format';

export function SaleDetailDrawer() {
  const { drawerState, closeSaleDetailDrawer, markSalesOrderPaid } = useInventory();
  const order = drawerState.selectedSaleOrder;

  if (!order) return null;

  return (
    <Drawer
      isOpen={!!order}
      onClose={closeSaleDetailDrawer}
      title={`Sales Order ${order.id}`}
      subtitle={`Customer: ${order.customerName} • Placed on ${formatDate(order.date)}`}
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={closeSaleDetailDrawer}>
            Close
          </Button>
          {order.status === 'Pending' && (
            <Button
              variant="primary"
              onClick={() => {
                markSalesOrderPaid(order.id);
                closeSaleDetailDrawer();
              }}
              icon={<CheckCircle2 size={15} />}
            >
              Mark Paid
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5 text-sm">
        {/* Status bar */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs text-slate-500 block">Payment Status</span>
            <span className="font-semibold text-slate-900">{order.status}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer & Date */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Customer Information
          </span>
          <p className="font-semibold text-slate-900">{order.customerName}</p>
          <p className="text-xs text-slate-500">Order Reference: {order.id}</p>
        </div>

        {/* Line Items Table */}
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Line Items ({order.items.length})
          </span>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium text-slate-900">{it.productName}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatINR(it.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-semibold tabular-nums">
                      {formatINR(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold tabular-nums">{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST (18%):</span>
            <span className="font-semibold tabular-nums">{formatINR(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-slate-900 pt-1 border-t border-slate-100">
            <span>Grand Total:</span>
            <span className="font-semibold tabular-nums text-emerald-600">
              {formatINR(order.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
