"use client";

import React, { useState, useMemo } from "react";
import {
  VehicleRecord,
  SalesInvoiceRecord,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  ReceiptText,
  Plus,
  Printer,
  CheckCircle2,
  Building2,
  Bike,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

interface SalesInvoicingDashboardViewProps {
  vehicles: VehicleRecord[];
  selectedBranch: string;
  onRefresh: () => void;
  preSelectedVehicle?: VehicleRecord | null;
  onClearPreSelected?: () => void;
}

export const SalesInvoicingDashboardView: React.FC<SalesInvoicingDashboardViewProps> = ({
  vehicles,
  selectedBranch,
  onRefresh,
  preSelectedVehicle,
  onClearPreSelected,
}) => {
  const [isCreating, setIsCreating] = useState(!!preSelectedVehicle);

  const invoices = useMemo(() => {
    return InventoryService.getSalesInvoices(selectedBranch);
  }, [selectedBranch, isCreating]);

  // Available units for sale
  const availableUnits = vehicles.filter(
    (v) => (v.status === "AVAILABLE" || v.status === "RESERVED") &&
           (selectedBranch === "ALL" || v.branchId === selectedBranch)
  );

  const initialVehicleId = preSelectedVehicle
    ? preSelectedVehicle.vehicleId
    : availableUnits[0]?.vehicleId || "";

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId);
  const [customerName, setCustomerName] = useState("Arun Kumar");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [customerAddress, setCustomerAddress] = useState("12/4 Gandhi Road");
  const [customerCity, setCustomerCity] = useState("Tirupattur");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "FINANCE">("FINANCE");
  const [financierName, setFinancierName] = useState("IDFC FIRST Bank");
  const [loanRef, setLoanRef] = useState("LN-2026-8891");
  const [accessoryCharges, setAccessoryCharges] = useState(4890);
  const [discount, setDiscount] = useState(1500);

  const [activePreviewInvoice, setActivePreviewInvoice] = useState<SalesInvoiceRecord | null>(null);

  const currentVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || preSelectedVehicle || availableUnits[0];

  const baseRate = currentVehicle ? (currentVehicle.purchaseRate ? Math.round(currentVehicle.purchaseRate * 1.25) : 95000) : 95000;
  const taxableSubtotal = baseRate - discount;
  const gstRate = 0.28;
  const gstAmount = Math.round(taxableSubtotal * gstRate);
  const grandTotal = taxableSubtotal + gstAmount + accessoryCharges;

  const handleGenerateInvoice = () => {
    if (!currentVehicle) {
      toast.error("Please select a vehicle to invoice.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer Name and Phone are required.");
      return;
    }

    try {
      const invoiceId = `SAL-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = `MMC-INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const invoiceRecord: SalesInvoiceRecord = {
        invoiceId,
        invoiceNumber,
        invoiceDate: now,
        branchId: currentVehicle.branchId,
        branchName: currentVehicle.branchName || "Tirupattur Main Showroom",
        customerId: `CUS-${Date.now().toString().slice(-4)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        subtotal: taxableSubtotal,
        discount,
        taxAmount: gstAmount,
        productCharges: accessoryCharges,
        billValue: grandTotal,
        paidAmount: paymentMode === "FINANCE" ? 25000 : grandTotal,
        balanceAmount: paymentMode === "FINANCE" ? grandTotal - 25000 : 0,
        paymentMode,
        financierName: paymentMode === "FINANCE" ? financierName : undefined,
        loanReference: paymentMode === "FINANCE" ? loanRef : undefined,
        isHypothecated: paymentMode === "FINANCE",
        status: "POSTED",
        createdAt: now,
        postedAt: now,
        items: [
          {
            itemId: `ITEM-${invoiceId}-1`,
            vehicleId: currentVehicle.vehicleId,
            modelId: currentVehicle.modelId,
            modelName: currentVehicle.modelName,
            modelCode: currentVehicle.modelCode,
            colorId: currentVehicle.colorId,
            colorName: currentVehicle.colorName,
            chassisNumber: currentVehicle.chassisNumber,
            engineNumber: currentVehicle.engineNumber,
            rate: baseRate,
            gross: baseRate,
            discount,
            taxAmount: gstAmount,
            lineTotal: grandTotal,
          },
        ],
      };

      InventoryService.postSalesInvoice(invoiceRecord);
      setActivePreviewInvoice(invoiceRecord);
      toast.success(`Sales Invoice ${invoiceNumber} issued! Vehicle marked as SOLD.`);
      setIsCreating(false);
      onClearPreSelected?.();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue invoice");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Sales & Gate Pass Dashboard</h1>
          </div>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setActivePreviewInvoice(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? "View Invoices List" : "Issue New Sales Invoice"}</span>
        </button>
      </div>

      {/* Invoice Generator Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Vehicle Sales Allocation & Billing</h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {/* Vehicle Selector */}
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
            <label className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1.5">
              Select Motorcycle from Live Showroom Yard Stock:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full text-xs font-bold text-slate-900 bg-white border border-blue-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono"
            >
              {availableUnits.map((u) => (
                <option key={u.vehicleId} value={u.vehicleId}>
                  {u.modelName} ({u.colorName}) — VIN: {u.chassisNumber} [Eng: {u.engineNumber}]
                </option>
              ))}
            </select>

            {currentVehicle && (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-700">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  Location: {currentVehicle.locationName || "Main Showroom"} ({currentVehicle.binCode})
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  Key Code: {currentVehicle.keyNumber || "KY-01"}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  Battery: {currentVehicle.batteryNumber || "EXIDE"}
                </span>
              </div>
            )}
          </div>

          {/* Buyer Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Customer Full Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Contact:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                placeholder="+91 98401 00000"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Residential Address:</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                placeholder="Door No, Street"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">City / Town:</label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Payment & Hypothecation */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Method:</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
                >
                  <option value="FINANCE">Hypothecated Loan (Bank Finance)</option>
                  <option value="CASH">Full Cash Settlement</option>
                  <option value="UPI">Direct Bank UPI / NEFT</option>
                </select>
              </div>

              {paymentMode === "FINANCE" && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Financier / Bank:</label>
                    <input
                      type="text"
                      value={financierName}
                      onChange={(e) => setFinancierName(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Loan Ref Number:</label>
                    <input
                      type="text"
                      value={loanRef}
                      onChange={(e) => setLoanRef(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing Calculations */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Vehicle Price:</span>
              <span className="font-mono font-semibold">₹{baseRate.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Festive Discount:</span>
              <span className="font-mono text-red-600">-₹{discount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Statutory (28% GST on ₹{taxableSubtotal.toLocaleString("en-IN")}):</span>
              <span className="font-mono font-semibold">₹{gstAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Extra Fittings & Packages:</span>
              <span className="font-mono font-semibold">₹{accessoryCharges.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
              <span>Final On-Road Bill Total:</span>
              <span className="font-mono text-blue-700 font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateInvoice}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/30 transition-all"
            >
              Generate Tax Invoice & Lock Vehicle
            </button>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal / Inline View */}
      {activePreviewInvoice && (
        <div className="border-2 border-slate-300 rounded-3xl p-6 bg-white space-y-4 font-sans text-xs shadow-lg print:p-0 print:border-none">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">MARUTHI MOTORS YAMAHA</h2>
              <p className="text-slate-500 text-[11px]">Authorized Yamaha Dealer • GSTIN: 33ABCDE1234F1Z5</p>
              <p className="text-slate-500 text-[11px]">Tirupattur Main Showroom (HQ) • Phone: +91 94432 12345</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-blue-700">{activePreviewInvoice.invoiceNumber}</div>
              <div className="text-slate-400 text-[11px]">Date: {activePreviewInvoice.invoiceDate.split("T")[0]}</div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                TAX INVOICE & GATE PASS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="font-bold text-slate-500 uppercase">Customer Information:</span>
              <div className="font-bold text-slate-900 mt-1">{activePreviewInvoice.customerName}</div>
              <div className="text-slate-600">{activePreviewInvoice.customerPhone}</div>
              <div className="text-slate-600">{activePreviewInvoice.customerAddress}, {activePreviewInvoice.customerCity}</div>
              {activePreviewInvoice.isHypothecated && (
                <div className="text-blue-700 font-semibold mt-1">
                  Hypothecated to: {activePreviewInvoice.financierName} ({activePreviewInvoice.loanReference})
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase">Motorcycle Particulars:</span>
              <div className="font-bold text-slate-900 mt-1">{activePreviewInvoice.items[0].modelName}</div>
              <div className="text-slate-600">Color: {activePreviewInvoice.items[0].colorName}</div>
              <div className="font-mono font-bold text-blue-700">Chassis No: {activePreviewInvoice.items[0].chassisNumber}</div>
              <div className="font-mono text-slate-600">Engine No: {activePreviewInvoice.items[0].engineNumber}</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-600">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">HSN</th>
                  <th className="p-2.5 text-right">Taxable</th>
                  <th className="p-2.5 text-right">GST (28%)</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 font-bold">{activePreviewInvoice.items[0].modelName}</td>
                  <td className="p-2.5 font-mono">8711</td>
                  <td className="p-2.5 text-right font-mono">₹{activePreviewInvoice.subtotal.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-mono">₹{activePreviewInvoice.taxAmount.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹{activePreviewInvoice.billValue.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setActivePreviewInvoice(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Close Preview
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Invoice & Gate Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-emerald-600" />
            <span>Issued Sales Invoices ({invoices.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Customer Delivery Handover Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle Model</th>
                <th className="py-3 px-4">Chassis Number</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Bill Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400">{inv.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {inv.items[0]?.modelName || "Yamaha Bike"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {inv.items[0]?.chassisNumber || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {inv.paymentMode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ₹{inv.billValue?.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActivePreviewInvoice(inv)}
                      className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-[11px] border border-blue-200"
                    >
                      View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

