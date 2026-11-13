"use client";

import React, { useState } from "react";
import {
  VehicleRecord,
  SalesInvoiceRecord,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { X, ReceiptText, Printer, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface SalesAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedVehicle?: VehicleRecord | null;
  vehicles: VehicleRecord[];
  selectedBranch: string;
}

export const SalesAllocationModal: React.FC<SalesAllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedVehicle,
  vehicles,
  selectedBranch,
}) => {
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
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<SalesInvoiceRecord | null>(null);

  if (!isOpen) return null;

  const currentVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || preSelectedVehicle || availableUnits[0];

  // Pricing calculations
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
      setGeneratedInvoice(invoiceRecord);
      setIsInvoiceGenerated(true);
      toast.success(`Sales Invoice ${invoiceNumber} generated! Vehicle marked as SOLD.`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invoice");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Vehicle Sales Invoice & Unit Allocation</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Retail Gate Pass
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lock physical vehicle from live stock, calculate GST, and issue customer tax invoice.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isInvoiceGenerated ? (
            <>
              {/* Vehicle Selection Box */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
                <label className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1.5">
                  Select Physical Vehicle from Current Available Stock:
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
                      Key No: {currentVehicle.keyNumber || "KY-01"}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      Bat No: {currentVehicle.batteryNumber || "EXIDE"}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Particulars */}
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

              {/* Payment & Financier Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Type:</label>
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

              {/* Tax & Commercial Summary */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Vehicle Price:</span>
                  <span className="font-mono font-semibold">₹{baseRate.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customer Festive Discount:</span>
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
                  <span>Total On-Road Bill Value:</span>
                  <span className="font-mono text-blue-700 font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </>
          ) : (
            /* Printable Invoice Preview */
            <div className="border-2 border-slate-300 rounded-2xl p-6 bg-white space-y-4 font-sans text-xs print:p-0 print:border-none">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-base font-black text-slate-900">MARUTHI MOTORS YAMAHA</h1>
                  <p className="text-slate-500 text-[11px]">Authorized Yamaha Dealer • GSTIN: 33ABCDE1234F1Z5</p>
                  <p className="text-slate-500 text-[11px]">Tirupattur Main Showroom (HQ) • Phone: +91 94432 12345</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-blue-700">{generatedInvoice?.invoiceNumber}</div>
                  <div className="text-slate-400 text-[11px]">Date: {generatedInvoice?.invoiceDate.split("T")[0]}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    TAX INVOICE & GATE PASS
                  </span>
                </div>
              </div>

              {/* Buyer & Vehicle Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="font-bold text-slate-500 uppercase">Customer Details:</span>
                  <div className="font-bold text-slate-900 mt-1">{generatedInvoice?.customerName}</div>
                  <div className="text-slate-600">{generatedInvoice?.customerPhone}</div>
                  <div className="text-slate-600">{generatedInvoice?.customerAddress}, {generatedInvoice?.customerCity}</div>
                  {generatedInvoice?.isHypothecated && (
                    <div className="text-blue-700 font-semibold mt-1">
                      Hypothecated to: {generatedInvoice.financierName} ({generatedInvoice.loanReference})
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase">Vehicle Particulars:</span>
                  <div className="font-bold text-slate-900 mt-1">{generatedInvoice?.items[0].modelName}</div>
                  <div className="text-slate-600">Color: {generatedInvoice?.items[0].colorName}</div>
                  <div className="font-mono font-bold text-blue-700">Chassis No: {generatedInvoice?.items[0].chassisNumber}</div>
                  <div className="font-mono text-slate-600">Engine No: {generatedInvoice?.items[0].engineNumber}</div>
                </div>
              </div>

              {/* Invoice Totals */}
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
                      <td className="p-2.5 font-bold">{generatedInvoice?.items[0].modelName}</td>
                      <td className="p-2.5 font-mono">8711</td>
                      <td className="p-2.5 text-right font-mono">₹{generatedInvoice?.subtotal.toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-mono">₹{generatedInvoice?.taxAmount.toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-mono font-bold">₹{generatedInvoice?.billValue.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-400 italic text-center pt-2">
                This is a computer-generated tax invoice and authorized showroom gate pass.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          {!isInvoiceGenerated ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/30 transition-all"
              >
                Generate Tax Invoice & Lock Unit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsInvoiceGenerated(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Done / Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice & Gate Pass</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

