# ⚡ StockPulse — Modern Inventory & Operations Platform

> **Live Production Build Ready** | Crafted for the **SasthaSoft** Freelance Full-Stack Developer Trial Task.  
> Inspired by the high-craft design philosophies of **Linear**, **Stripe Dashboard**, and **Vercel**.

StockPulse is a modern, enterprise-grade B2B/SMB Inventory & Operations Management web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide React**, **Recharts**, and **Sonner**.

---

## 🌟 Key Highlights & Connected Workflows

Every module in StockPulse is linked in real-time through a centralized reactive state engine (`InventoryContext`) with automatic `localStorage` synchronization:

1. **Inward Purchase Orders -> Adds to Stock:**
   - Procuring goods via a Purchase Order (`PO-...`) starts as `Pending` or `Received`.
   - Clicking **"Mark as Received"** immediately increases item `currentStock`, allocates units to the destination Godown depot, logs an `IN` entry into the chronological audit ledger, and dynamically clears low-stock alerts on the Dashboard if `currentStock > minLevel`.
2. **Sales Orders & Invoicing -> Real-Time Stock Deduction:**
   - Creating a Sales Order validates line-item stock availability at the selected Godown in real time (guards against over-selling).
   - Submitting an order immediately deducts units from `currentStock`, logs an `OUT` transaction in the Stock History ledger with reference `SO-...`, recalculates financial receivables, and triggers **Low Stock Warnings** on the Dashboard if thresholds are breached.
3. **Printable GST Tax Invoices:**
   - 1-click **"View Invoice"** modal rendering a full GST-compliant Tax Invoice featuring seller/buyer GSTINs, HSN breakdowns, CGST 9% + SGST 9% computations, bank transfer particulars, and printable layout (`window.print()`).
4. **Inter-Godown Transfers & Manual Adjustments:**
   - Transfer stock between **Main Hub (Mumbai)**, **Central Depot (Ahmedabad)**, and **North Warehouse (Delhi)** with real-time location balance validation and transfer memos.
   - Reconcile physical warehouse counts using the **Adjust Stock Drawer** (`+` surplus or `-` damage/audit variances).
5. **Business Intelligence & Working CSV Export:**
   - **Stock Valuation Report:** Asset cost, retail value, and gross profit margin percentage.
   - **Sales Report:** Customer revenue concentration, top-selling SKUs, and payment collection tracking.
   - **Purchase Report:** Supplier spend breakdown and shipment fulfillment tracking.
   - 1-click **Export CSV** generating genuine `.csv` files for spreadsheets and accounting.

---

## 🏗️ Architecture & Modules Overview

```
StockPulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Sidebar, TopHeader, Drawers host, and Sonner Toaster
│   │   ├── page.tsx           # Dashboard: Bento KPIs, Recharts Visualizations, Low Stock Warning Center
│   │   ├── sales/page.tsx     # Module 2: Sales Orders, Receivables, GST Invoice preview & Mark Paid
│   │   ├── purchases/page.tsx # Module 3: Inward POs, Supplier procurement, Mark Received workflow
│   │   ├── stock/page.tsx     # Module 4: Stock Master, visual capacity bars, item audit ledger
│   │   ├── reports/page.tsx   # Module 5: Valuation, Sales, & Purchase reports with real CSV export
│   │   └── godowns/page.tsx   # Module 6 (Bonus): Multi-warehouse capacities, stored SKUs & transfer logs
│   ├── components/
│   │   ├── common/Badge.tsx   # StatusBadge (Emerald, Amber, Rose), SkuBadge, CategoryBadge
│   │   ├── drawers/           # Slide-Over Drawers (Sales, Purchases, Transfers, Adjustments, Stock History)
│   │   ├── layout/            # Deep Obsidian Slate Sidebar & Alabaster TopHeader with Global Quick Search
│   │   └── modals/            # GST Tax Invoice modal with print/PDF support
│   ├── context/
│   │   └── InventoryContext.tsx # Centralized state reducer, localStorage hydration & drawer controllers
│   ├── data/
│   │   └── seedData.ts        # 12 SMB products, 3 godowns, 7 sales orders, 6 POs, 23 audit ledger entries
│   ├── lib/
│   │   └── utils.ts           # Indian Rupee (₹) formatters (en-IN), status helpers, CSV downloader
│   └── types/
│       └── inventory.ts       # Strict TypeScript domain interfaces
```

---

## 🎨 Design System & Aesthetic Craft

- **Sidebar:** Deep Obsidian Slate (`bg-slate-950` / `#090D16`) with active Electric Indigo (`#4F46E5`) indicators, multi-godown live status pulse, and active SKU distribution bar.
- **Main Canvas:** Soft cool alabaster (`bg-slate-50/90`) with elevated pure white cards, crisp `1px` borders (`border-slate-200/80`), and layered subtle shadows.
- **Data Formatting:** Indian Rupee currency formatting (`₹1,45,000`), `tabular-nums` for alignment, and `JetBrains Mono` font for SKUs, order IDs, and invoices.
- **Slide-Over Drawers:** Tactile drawers for seamless creation workflows without losing context on the main data tables.
- **Reset Demo Data:** 1-click button in the sidebar footer to restore the original seed dataset at any time during review.

---

## 🚀 Quick Setup & Local Development

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node v26)
- **Package Manager**: `npm`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production (Zero Lint/Type Errors)
```bash
npm run build
npm run start
```

---

## 🧪 Evaluator Workflow Verification Guide

To test the interconnected workflows requested by SasthaSoft:

1. **Dashboard Alert Test:**
   - Notice the **Critical Stock Alerts** panel on `/` showing items in **Low Stock** (e.g. *SS Ball Valve*, *PLC*) and **Out of Stock** (*Pressure Transducer*).
   - Click **"Quick Reorder"** on any alert item. Notice the Purchase Order drawer opens pre-filled with the product and its preferred supplier.
2. **Purchase Received Workflow:**
   - Go to **Purchase Orders** (`/purchases`).
   - Find a `Pending` order (e.g. `PO-2026-005` for *Precision Pressure Transducer*).
   - Click **"Mark Received"**.
   - Watch the toast notification appear, order status change to **Received**, stock incremented by +25 units, and returning to Dashboard confirms the Out of Stock alert is resolved!
3. **Sales Deduction Workflow:**
   - Go to **Sales & Invoices** (`/sales`) or click **"+ New Action > New Sales Order"** from the top header.
   - Choose *Apex Retail Pvt Ltd*, select *Main Hub - Mumbai*, and select an item with sufficient stock.
   - Notice that entering a quantity greater than available warehouse stock displays an inline warning.
   - Submit the order. Units are deducted immediately, and clicking **"Invoice"** opens the printable GST tax invoice.
4. **Inter-Godown Transfer:**
   - Go to **Godowns** (`/godowns`), click **"Transfer Stock"**, move 5 units from Mumbai to Delhi, and view the updated depot capacities and transfer ledger!
5. **Reports & CSV Export:**
   - Go to **Reports** (`/reports`), switch between Valuation, Sales, and Purchases tabs, and click **"Export CSV"** to download the spreadsheet.
6. **Reset:**
   - Click **"Reset Demo Data"** in the sidebar footer at any time to return to the clean evaluation state.

---

*Crafted with precision for the SasthaSoft Freelance Full-Stack Developer Trial Task.*
