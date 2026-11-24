'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { formatDate, formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/common/Badge';

export function InvoiceModal() {
  const { drawerState, closeInvoiceModal, markSalesOrderPaid, state } = useInventory();

  const invoice = drawerState.selectedInvoice;
  if (!drawerState.isInvoiceModalOpen || !invoice) return null;

  const godown = state.godowns.find((g) => g.id === invoice.godownId);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkPaid = () => {
    markSalesOrderPaid(invoice.id);
  };

  const cgst = invoice.taxAmount / 2;
  const sgst = invoice.taxAmount / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeInvoiceModal}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-indigo-400">
              Tax Invoice #{invoice.id}
            </span>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'Pending' && (
              <button
                onClick={handleMarkPaid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Paid</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={closeInvoiceModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="p-8 text-slate-800 bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">StockPulse</span>
                <span className="text-xs uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  TAX INVOICE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                StockPulse SMB Enterprises Pvt Ltd
              </p>
              <p className="text-[11px] text-slate-500">
                Plot 120, MIDC Industrial Area, TTC, Navi Mumbai, MH 400705
              </p>
              <p className="text-[11px] text-slate-500">
                GSTIN: <span className="font-mono font-semibold">27AAACS8920D1Z7</span> | State Code: 27
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-bold font-mono text-slate-900">{invoice.id}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Invoice Date: <span className="font-medium text-slate-800">{formatDate(invoice.date)}</span>
              </p>
              <p className="text-xs text-slate-500">
                Payment Status:{' '}
                <span
                  className={
                    invoice.status === 'Paid'
                      ? 'font-bold text-emerald-600'
                      : 'font-bold text-amber-600'
                  }
                >
                  {invoice.status.toUpperCase()}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Dispatch Depot: <span className="font-medium text-slate-700">{godown?.name || 'Main Hub'}</span>
              </p>
            </div>
          </div>

          {/* Billed To / Shipped To Grid */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (Customer Details)
              </span>
              <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
              <div className="text-slate-600 mt-0.5">{invoice.customerAddress}</div>
              <div className="text-slate-600 mt-1">
                GSTIN: <span className="font-mono font-semibold text-slate-800">{invoice.customerGst}</span>
              </div>
              <div className="text-slate-500 text-[11px]">{invoice.customerEmail} • {invoice.customerPhone}</div>
            </div>

            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Dispatch & Logistics Details
              </span>
              <div className="text-slate-700">
                <strong>Warehouse:</strong> {godown?.name}
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">{godown?.address}</div>
              <div className="text-slate-600 text-[11px] mt-1">
                <strong>Fulfillment:</strong> Surface Logistics • Immediate Handover
              </div>
              {invoice.notes && (
                <div className="mt-2 text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1">
                  Note: {invoice.notes}
                </div>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div className="py-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5">#</th>
                  <th className="py-2.5">Description of Goods</th>
                  <th className="py-2.5">SKU / Item ID</th>
                  <th className="py-2.5 text-right">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 text-right">Taxable Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 font-medium text-slate-900">{it.productName}</td>
                    <td className="py-3 font-mono text-slate-500">{it.sku}</td>
                    <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {it.quantity}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                      {formatINR(it.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatINR(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="text-xs text-slate-500 space-y-1 max-w-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Settlement & Bank Details
              </span>
              <p>Bank Name: <strong>HDFC Bank Ltd</strong></p>
              <p>A/C No: <span className="font-mono font-medium">50200049182301</span> (Current)</p>
              <p>IFSC Code: <span className="font-mono font-medium">HDFC0000240</span> (Vashi Branch)</p>
              <p className="text-[11px] text-slate-400 pt-2">
                This is a computer-generated tax invoice generated automatically through StockPulse SMB.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono tabular-nums font-medium">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST @ 9.0%:</span>
                <span className="font-mono tabular-nums">{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST @ 9.0%:</span>
                <span className="font-mono tabular-nums">{formatINR(sgst)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono tabular-nums text-indigo-700">{formatINR(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signatory */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="italic">Goods received in sound merchantable condition.</p>
              <p className="text-[11px] mt-1">Customer Signature / Stamp</p>
            </div>
            <div className="text-right">
              <div className="h-10 flex items-center justify-end font-script text-indigo-900 font-semibold italic">
                Authorized Signatory
              </div>
              <p className="font-semibold text-slate-800">For StockPulse SMB Enterprises</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
