# Maruthi Motors Yamaha — Vehicle Inventory Management Working Model

A high-speed, modern, and zero-friction Vehicle Inventory & Yard Management working model built for **Yamaha Tirupattur MMC (Maruthi Motors)**.

This system directly operationalizes the **6 Core Workflow Stages** from the Fusil Process Observation notes and is backed by the complete **Firestore Database Architecture Plan**.

---

## 🚀 Key Modules & Implemented Stages

### 1. Stage 1: Bulk Vehicle Load Received (Inward Ingestion)
- **5-Second Drag & Drop:** Upload official manufacturer dispatch sheets (CSV / Excel).
- **Automated Duplicate Deduction:** Automatically cross-checks chassis and engine numbers against the live registry. Duplicates are deducted and excluded from the count before saving.
- **1-Click Test Button:** Includes a built-in *"Load Sample Yamaha Invoice"* button for instant demonstration.

### 2. Stage 2: Vehicle Model Master Creation
- Pre-seeded with official Yamaha dealership models: **Fascino 125 Fi Hybrid, RayZR 125 Fi, FZ-S Fi V4, MT-15 V2, R15 V4, Aerox 155**.
- Includes pricing, GST tax slabs (28% GST, HSN 8711), color palettes, and periodic service schedules.
- Form to configure and add new vehicle models to the master catalog.

### 3. Stage 3: Vehicle Purchase Voucher & Chassis Registration
- Record incoming supplier purchase invoices with header and line-item details.
- **Chassis & Engine Details Grid:** Captures unique physical identifiers:
  - Chassis No (VIN) & Engine No
  - Key No, Battery No, Battery Make, Charger No, Mfg Date, Wheel Type.
- Atomic commit updating the `vehicles` collection, `vehicleIdentifiers` uniqueness lock, `stockMovements` ledger, and `inventorySummary` aggregates.

### 4. Stage 4: Current Stock Verification & Yard Control
- **Visual Stock Yard Dashboard:** Summary cards for Available, Reserved, In-Transit, and Sold units.
- **Color & Model Filter Chips:** Filter live inventory by model and color with a single click.
- **Last-4-Digits VIN Search:** Locate any motorcycle instantly by typing just the last 4 digits of its chassis number.
- **Location & Storage Bay Tracking:** View stock distribution across *Main Showroom Floor*, *Yard A (PDI)*, *Yard B (Buffer)*, and *Vaniyambadi Yard*.
- **1-Click Bulk Stock Export:** Download current stock yard inventory to formatted CSV with all specs.

### 5. Stage 5A: Vehicle Sales Invoicing & Unit Allocation
- Select customer or enter quick buyer particulars.
- Lock physical motorcycle from live `AVAILABLE` stock to prevent double-booking.
- Real-time commercial calculation: Base price, Festive discounts, GST statutory breakdown (14% CGST + 14% SGST), and accessory packages.
- Financier & hypothecation fields for bank loans (IDFC, HDFC, IndusInd, etc.).
- **Printable GST Tax Invoice & Gate Pass:** Print-ready delivery gate pass ready with 1 click.

### 6. Stage 5B: Vehicle Transfers (Branches & Sub-Dealers)
- Inter-branch showroom movements (Tirupattur HQ ↔ Vaniyambadi) and external Sub-Dealer consignments (Sri Motors Krishnagiri, Selvam Jolarpet, Vignesh Ambur).
- **Dispatch Queue:** Select available units and dispatch via delivery truck (status changes to `IN_TRANSIT`).
- **1-Click Inward Receipt:** Destination supervisor clicks *"Confirm Inward Receipt"* to instantly receive vehicles and reconcile stock.

### 7. Central Audit Movement Ledger (`stockMovements`)
- Append-only audit log tracking every single vehicle transition (`PURCHASE`, `SALE`, `TRANSFER_OUT`, `TRANSFER_IN`).
- Searchable by chassis number or movement type.
- 1-Click *"Export Ledger (CSV)"* for accounting audits.

---

## 🛠️ Tech Stack & Design Consistency
- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4, Poppins Typography, Yamaha Blue (`#2563EB` / `#00205B`), crisp badges, rounded-2xl cards
- **Database Architecture:** Google Cloud Firestore document schema (1 doc per vehicle, uniqueness registry, append-only ledger) with dual-mode local cache fallback for instant offline/online testing.
- **Branding:** Shares official MMC Yamaha logos and color palette from the MMC post-sales application.

---

## 🏃 Quick Start

Run the development server:
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) (or custom port `npm.cmd run dev -- -p 3001` if port 3000 is occupied).

