# ⚡ StockPulse — Modern Inventory & Operations Platform

> **Production-Grade Trial Task** for **SasthaSoft** Freelance Full-Stack Developer Role.  
> Inspired by the clean, tactile design philosophies of **Linear**, **Stripe Dashboard**, and **Vercel**.

StockPulse is a modern, polished Inventory Management web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide React**, **Recharts** (2 charts total), and **Sonner** (toast notifications).

---

## 🌟 Connected Workflow Architecture

All 5 modules are connected live via a single centralized React Context (`useReducer` + `localStorage` persistence). State is never duplicated or statically cached—all totals, statuses, and alert lists are calculated via pure selectors:

```
[Inward Purchase Order] ──(Mark Received)──> [+ Stock Added] ──> [Stock History IN] ──> [Resolves Low Stock Alert]
                                                    │
[Customer Sales Order]  ──(Submit Order)───> [- Stock Deducted] ──> [Stock History OUT] ──> [Triggers Low Stock Alert]
                                                    │
                                     [Derived Selectors Engine]
                                                    │
                  ┌─────────────────┬───────────────┴───────────────┬────────────────┐
                  ▼                 ▼                               ▼                ▼
            Dashboard KPIs    Stock Master Ledger             Sales Receivables   Reports & CSV
```

1. **Purchase Received Increases Stock:**
   - Pending purchase orders can be marked **Received** with 1 click.
   - Increases the item's `currentStock`, logs an `IN` entry in Stock History with reference `PO-xxxx`, and automatically clears the item from the Dashboard Low Stock alert if stock exceeds `minLevel`.
   - Triggers a Sonner toast notification (e.g., *"PO-2026-005 received: +25 Precision Pressure Sensor"*).
2. **Sale Reduces Stock Immediately:**
   - Creating a Sales Order validates item quantity against live available stock in real time.
   - Blocks submission and displays an inline warning if requested quantity exceeds available stock.
   - Immediately deducts the quantity from `currentStock`, logs an `OUT` entry in Stock History with reference `SO-xxxx`, updates receivables, and triggers a Dashboard Low Stock Alert if `currentStock <= minLevel`.
3. **Manual Adjustments:**
   - "+ / -" manual corrections update `currentStock` with reason auditing and log an `ADJUSTMENT` movement.
4. **Working CSV Export:**
   - Export CSV button on Stock, Sales, and Purchase report tabs generates genuine `.csv` downloads.
5. **Reset Demo Data:**
   - Restore initial sample dataset anytime using the sidebar footer button.

---

## 📁 Clean Code & Project Structure

```
StockPulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Sidebar, Header, GlobalDrawersHost, Sonner Toaster
│   │   ├── page.tsx           # Module 1: Dashboard (4 KPIs, 2 Recharts, Low Stock Alerts, Activity)
│   │   ├── sales/page.tsx     # Module 2: Sales Orders (3 KPIs, Search/Tabs, Line items drawer)
│   │   ├── purchases/page.tsx # Module 3: Purchases (3 KPIs, Search/Tabs, Mark as Received)
│   │   ├── stock/page.tsx     # Module 4: Stock Master (4 KPIs, Threshold bars, History timeline)
│   │   └── reports/page.tsx   # Module 5: Reports (Stock, Sales, Purchase tabs + CSV download)
│   ├── components/
│   │   ├── ui/                # Button, Badge, Card, Drawer, EmptyState
│   │   ├── layout/            # Sidebar (fixed w-60, mobile drawer), Header
│   │   └── drawers/           # Slide-over drawers (Sales, Purchases, History, Adjust, Add)
│   ├── context/
│   │   └── InventoryContext.tsx # Centralized reducer, localStorage sync & drawer controls
│   ├── data/
│   │   └── seed.ts            # 10 products (2 Low Stock, 1 Out of Stock), 6 customers, 4 suppliers, 7 sales, 6 POs
│   ├── lib/
│   │   ├── format.ts          # formatINR (en-IN), formatNumber, formatDate, formatRelativeTime
│   │   ├── selectors.ts       # Pure derived state selectors (totals, alerts, chart series)
│   │   └── csv.ts             # Clean CSV generation and browser download helper
│   └── types/
│       └── inventory.ts       # Strict TypeScript domain interfaces
```

---

## 🎨 Design System

- **Colors:** Deep Obsidian Slate sidebar (`bg-slate-950`), alabaster canvas (`bg-slate-50`), white elevated cards (`border-slate-200 rounded-xl shadow-xs`).
- **Typography:** Inter for UI and numbers with `tabular-nums font-semibold`. JetBrains Mono ONLY for SKU and order IDs (`text-xs font-mono`).
- **Type Scale:** Page title `text-2xl font-semibold`; section title `text-base font-semibold`; body `text-sm`; table header `text-xs uppercase tracking-wide text-slate-500`; helper text `text-xs text-slate-500`.
- **Status Badges:** Small pills with status dot (`text-xs px-2 py-0.5 rounded-full border`).
  - Emerald = Paid / Received / In Stock
  - Amber = Pending / Low Stock
  - Rose = Out of Stock
- **Drawers:** Smooth slide-over drawers (150–200ms) for creating orders and viewing item history.

---

## 🚀 Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```
Compiles with **zero errors and zero warnings**.
