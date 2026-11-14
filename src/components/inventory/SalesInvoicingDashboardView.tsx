"use client";

import React, { useState, useMemo } from "react";
import {
  VehicleRecord,
  SalesInvoiceRecord,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { DEFAULT_SUB_DEALERS } from "@/services/modelCatalog.service";
import { OfficialSalesInvoiceDocument } from "@/components/inventory/OfficialSalesInvoiceDocument";
import {
  ReceiptText,
  Plus,
  Printer,
  CheckCircle2,
  Building2,
  Bike,
  ShieldCheck,
  CreditCard,
  Eye,
  ArrowLeft,
  ArrowRight,
  User,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Coins,
  FileCheck,
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
  const [activePreviewInvoice, setActivePreviewInvoice] = useState<SalesInvoiceRecord | null>(null);

  const invoices = useMemo(() => {
    return InventoryService.getSalesInvoices(selectedBranch);
  }, [selectedBranch, isCreating]);

  // Available units for sale (AVAILABLE or RESERVED)
  const availableUnits = useMemo(() => {
    return vehicles.filter(
      (v) => (v.status === "AVAILABLE" || v.status === "RESERVED") &&
             (selectedBranch === "ALL" || v.branchId === selectedBranch)
    );
  }, [vehicles, selectedBranch]);

  const initialVehicleId = preSelectedVehicle
    ? preSelectedVehicle.vehicleId
    : availableUnits[0]?.vehicleId || "";

  // Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId);
  const [saleType, setSaleType] = useState<"RETAIL" | "SUB_DEALER">("RETAIL");
  const [subDealerName, setSubDealerName] = useState<string>(DEFAULT_SUB_DEALERS[0]?.dealerName || "Ambur Sub-Dealer Network");

  // Customer KYC
  const [customerName, setCustomerName] = useState("Arun Kumar");
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [customerAddress, setCustomerAddress] = useState("12/4 Gandhi Road");
  const [customerCity, setCustomerCity] = useState("Tirupattur");
  const [customerAadhaar, setCustomerAadhaar] = useState("9841 2309 8812");
  const [nomineeName, setNomineeName] = useState("P. Kavitha (Wife)");

  // Payment & Hypothecation
  const [paymentMode, setPaymentMode] = useState<"FINANCE" | "CASH" | "UPI">("FINANCE");
  const [financierName, setFinancierName] = useState("IDFC FIRST Bank");
  const [loanRef, setLoanRef] = useState("LN-2026-8891");
  const [downPayment, setDownPayment] = useState(25000);

  // Pricing Allocation Matrix
  const currentVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || preSelectedVehicle || availableUnits[0];

  const defaultBase = currentVehicle
    ? currentVehicle.purchaseRate ? Math.round(currentVehicle.purchaseRate * 1.25) : 85000
    : 85000;

  const [exShowroomBase, setExShowroomBase] = useState<number>(defaultBase);
  const [rtoCharges, setRtoCharges] = useState<number>(9500);
  const [insuranceCharges, setInsuranceCharges] = useState<number>(5400);
  const [accessoryCharges, setAccessoryCharges] = useState<number>(4890);
  const [extendedWarrantyCharges, setExtendedWarrantyCharges] = useState<number>(1850);
  const [discount, setDiscount] = useState<number>(1500);

  // Synchronize official pricing allocation from Pricing Master when vehicle changes
  React.useEffect(() => {
    if (currentVehicle) {
      const pricingMaster = InventoryService.getPricingByModelId(currentVehicle.modelId);
      if (pricingMaster) {
        setExShowroomBase(pricingMaster.exShowroomBase);
        setRtoCharges(pricingMaster.rtoRoadTax + pricingMaster.rtoSmartCardPlate);
        setInsuranceCharges(pricingMaster.insurance1Plus5);
        setAccessoryCharges(pricingMaster.mandatoryAccessories);
        setExtendedWarrantyCharges(pricingMaster.extendedWarranty5Yr);
      } else {
        const calcBase = currentVehicle.purchaseRate ? Math.round(currentVehicle.purchaseRate * 1.25) : 85000;
        setExShowroomBase(calcBase);
      }
    }
  }, [currentVehicle?.vehicleId, currentVehicle?.modelId]);

  // Derived Pricing Computations
  const gstAmount = Math.round(exShowroomBase * 0.28);
  const exShowroomTotal = exShowroomBase + gstAmount;
  const grandTotal = exShowroomTotal + rtoCharges + insuranceCharges + accessoryCharges + extendedWarrantyCharges - discount;

  // KPI Calculations
  const totalSoldUnits = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.billValue || 0), 0);
  const financedCount = invoices.filter((inv) => inv.isHypothecated).length;
  const cashCount = invoices.filter((inv) => !inv.isHypothecated).length;

  const handleGenerateInvoice = () => {
    if (!currentVehicle) {
      toast.error("Please select a motorcycle from stock to invoice.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer Name and Mobile Phone are required.");
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
        branchName: currentVehicle.branchName || "Tirupattur Main Showroom (HQ)",
        customerId: `CUS-${Date.now().toString().slice(-4)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        customerAadhaar: customerAadhaar.trim() || undefined,
        nomineeName: nomineeName.trim() || undefined,
        saleType,
        subDealerName: saleType === "SUB_DEALER" ? subDealerName : undefined,
        subtotal: exShowroomBase,
        discount,
        taxAmount: gstAmount,
        rtoCharges,
        insuranceCharges,
        productCharges: accessoryCharges,
        extendedWarrantyCharges,
        billValue: grandTotal,
        paidAmount: paymentMode === "FINANCE" ? downPayment : grandTotal,
        balanceAmount: paymentMode === "FINANCE" ? Math.max(0, grandTotal - downPayment) : 0,
        paymentMode,
        financierName: paymentMode === "FINANCE" ? financierName : undefined,
        loanReference: paymentMode === "FINANCE" ? loanRef : undefined,
        isHypothecated: paymentMode === "FINANCE",
        gatePassNumber: `GP-${invoiceNumber.slice(-4)}`,
        odometerReading: 4,
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
            rate: exShowroomBase,
            gross: exShowroomBase,
            discount,
            taxAmount: gstAmount,
            lineTotal: grandTotal,
          },
        ],
      };

      InventoryService.postSalesInvoice(invoiceRecord);
      setActivePreviewInvoice(invoiceRecord);
      toast.success(`Sales Invoice ${invoiceNumber} issued! Vehicle ${currentVehicle.chassisNumber} locked to SOLD.`);
      setIsCreating(false);
      onClearPreSelected?.();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue invoice");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* If an invoice document preview is active, render it directly on the dashboard canvas */}
      {activePreviewInvoice ? (
        <OfficialSalesInvoiceDocument
          invoice={activePreviewInvoice}
          onBack={() => setActivePreviewInvoice(null)}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Sales & Delivery Gate Pass Dashboard</h1>
            </div>

            <button
              onClick={() => {
                setIsCreating(!isCreating);
                setActivePreviewInvoice(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? "View Invoices List" : "Issue New Sales Invoice"}</span>
            </button>
          </div>

          {/* Dealership KPI Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Vehicles Invoiced</span>
                <span className="text-lg font-black text-slate-900">{totalSoldUnits} Units</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Sales Turnover</span>
                <span className="text-lg font-black text-blue-900 font-mono">₹{totalRevenue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bank Financed (Loan)</span>
                <span className="text-lg font-black text-indigo-900">{financedCount} Vehicles</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">1st Service Eligible</span>
                <span className="text-lg font-black text-amber-900">{totalSoldUnits} Units (Active)</span>
              </div>
            </div>
          </div>

          {/* New Sales Invoice Workspace */}
          {isCreating && (
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Vehicle Sales Allocation, On-Road Billing & Gate Pass Generation</h3>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* SECTION 1: Vehicle & Yard Stock Allocation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>1. Select Motorcycle from Live Yard Stock ({availableUnits.length} Available)</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={saleType === "RETAIL"}
                        onChange={() => setSaleType("RETAIL")}
                        className="text-emerald-600"
                      />
                      <span>End Customer Retail</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={saleType === "SUB_DEALER"}
                        onChange={() => setSaleType("SUB_DEALER")}
                        className="text-emerald-600"
                      />
                      <span>Sub-Dealer B2B Allocation</span>
                    </label>
                  </div>
                </div>

                {saleType === "SUB_DEALER" && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 text-xs">
                    <span className="font-bold text-amber-900">Select Sub-Dealer:</span>
                    <select
                      value={subDealerName}
                      onChange={(e) => setSubDealerName(e.target.value)}
                      className="bg-white border border-amber-300 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                    >
                      {DEFAULT_SUB_DEALERS.map((sd) => (
                        <option key={sd.subDealerId} value={sd.dealerName}>
                          {sd.dealerName} ({sd.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {availableUnits.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                    No available vehicles in live stock for the selected showroom location. Please inward vehicles first.
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 font-mono"
                    >
                      {availableUnits.map((u) => (
                        <option key={u.vehicleId} value={u.vehicleId}>
                          {u.modelName} ({u.colorName}) — VIN: {u.chassisNumber} | Eng: {u.engineNumber} | Bay: {u.binCode || "YARD-A1"}
                        </option>
                      ))}
                    </select>

                    {currentVehicle && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 font-medium">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9.5px]">Model & Code</span>
                          <span className="font-bold text-slate-900">{currentVehicle.modelName}</span>
                          <span className="text-slate-500 block font-mono text-[10px]">{currentVehicle.modelCode || "DG51"}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9.5px]">Chassis VIN</span>
                          <span className="font-bold text-blue-900 font-mono">{currentVehicle.chassisNumber}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9.5px]">Engine No</span>
                          <span className="font-bold text-slate-800 font-mono">{currentVehicle.engineNumber}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[9.5px]">Keys & Battery</span>
                          <span className="font-bold text-slate-800 font-mono">{currentVehicle.keyNumber || "KY-01"} • {currentVehicle.batteryNumber || "EXIDE"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: Customer Identity & KYC Particulars */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>2. Customer Identity & Statutory KYC (Form 21 / RTO Mandate)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Customer Full Name (as per Aadhaar):</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                      placeholder="e.g. Arun Kumar S"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Contact Number:</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                      placeholder="+91 98401 00000"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Aadhaar Number (UID / PAN):</label>
                    <input
                      type="text"
                      value={customerAadhaar}
                      onChange={(e) => setCustomerAadhaar(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Residential Address (Door & Street):</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                      placeholder="Door No, Street"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">City / Taluk & District:</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                      placeholder="Tirupattur"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Insurance Nominee & Relation:</label>
                    <input
                      type="text"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                      placeholder="e.g. Kavitha (Wife)"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Pricing Allocation Matrix (The Dealership Price Structure) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>3. Statutory Pricing Allocation Matrix (On-Road Price Breakdown)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    GST 28% Auto-Allocated
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Ex-Showroom Taxable Base (₹):
                    </label>
                    <input
                      type="number"
                      value={exShowroomBase}
                      onChange={(e) => setExShowroomBase(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      + GST 28%: <strong className="text-slate-800 font-mono">₹{gstAmount.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Tamil Nadu RTO Road Tax + Smart Card (₹):
                    </label>
                    <input
                      type="number"
                      value={rtoCharges}
                      onChange={(e) => setRtoCharges(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Govt Statutory Pass-Through</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Insurance 1+5 Yrs Comprehensive (₹):
                    </label>
                    <input
                      type="number"
                      value={insuranceCharges}
                      onChange={(e) => setInsuranceCharges(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">1 Yr OD + 5 Yr Mandatory TP</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Mandatory Accessories & Helmet Kit (₹):
                    </label>
                    <input
                      type="number"
                      value={accessoryCharges}
                      onChange={(e) => setAccessoryCharges(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Helmet, Crash Guard, Mirrors</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Yamaha Shield Extended Warranty & RSA (₹):
                    </label>
                    <input
                      type="number"
                      value={extendedWarrantyCharges}
                      onChange={(e) => setExtendedWarrantyCharges(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">5 Years Warranty Coverage</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Festive / Dealership Discount (₹):
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold bg-white border border-red-300 text-red-600 rounded-xl p-2"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Deducted from Final Invoice</span>
                  </div>
                </div>

                {/* Net Total Summary Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-xs text-emerald-900">
                    <span className="font-bold">Calculated Ex-Showroom Total: </span>
                    <span className="font-mono font-black">₹{exShowroomTotal.toLocaleString("en-IN")}</span> (Base ₹{exShowroomBase.toLocaleString("en-IN")} + 28% GST ₹{gstAmount.toLocaleString("en-IN")})
                  </div>
                  <div className="text-sm font-extrabold text-emerald-950 mt-2 sm:mt-0">
                    <span>Net On-Road Settlement: </span>
                    <span className="text-lg font-black text-emerald-700 font-mono">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Payment Mode & Hypothecation Finance */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>4. Payment Settlement & Loan Hypothecation (Bank Finance)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Settlement Method:</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl p-2.5"
                    >
                      <option value="FINANCE">Bank Loan Hypothecation (Finance)</option>
                      <option value="CASH">Full Cash Settlement</option>
                      <option value="UPI">Direct Bank UPI / NEFT Transfer</option>
                    </select>
                  </div>

                  {paymentMode === "FINANCE" ? (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Financier / Bank Name:</label>
                        <select
                          value={financierName}
                          onChange={(e) => setFinancierName(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
                        >
                          <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="IndusInd Bank">IndusInd Bank</option>
                          <option value="TVS Credit Services">TVS Credit Services</option>
                          <option value="L&T Financial Services">L&T Financial Services</option>
                          <option value="Cholamandalam Finance">Cholamandalam Finance</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Loan Ref Number / App ID:</label>
                        <input
                          type="text"
                          value={loanRef}
                          onChange={(e) => setLoanRef(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 font-mono"
                          placeholder="LN-2026-XXXX"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 flex items-center text-xs text-emerald-800 font-semibold p-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
                      Vehicle title will be unencumbered (No Hypothecation endorsement on RC).
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  disabled={availableUnits.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Issue Tax Invoice, Generate Gate Pass & Lock Vehicle to SOLD</span>
                </button>
              </div>
            </div>
          )}

          {/* Issued Invoices Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-emerald-600" />
                <span>Issued Sales Invoices & Customer Delivery Ledger ({invoices.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1050px] border-collapse">
                <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5 text-center min-w-[55px] whitespace-nowrap">S.No</th>
                    <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Invoice No</th>
                    <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Customer Details</th>
                    <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Vehicle Model</th>
                    <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Chassis Number (VIN)</th>
                    <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Payment & Finance</th>
                    <th className="py-3 px-4 text-right min-w-[120px] whitespace-nowrap">On-Road Total</th>
                    <th className="py-3 px-4 text-center min-w-[105px] whitespace-nowrap">Date</th>
                    <th className="py-3 px-4 text-center min-w-[110px] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs font-medium">
                        No sales invoices issued yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv, idx) => (
                      <tr key={inv.invoiceId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 whitespace-nowrap font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{inv.customerName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{inv.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{inv.items[0]?.modelName || "Yamaha Motorcycle"}</div>
                          <div className="text-[10px] text-slate-400">{inv.items[0]?.colorName || "Standard"}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                          {inv.items[0]?.chassisNumber || "—"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              inv.paymentMode === "FINANCE"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {inv.paymentMode === "FINANCE" ? "FINANCE" : inv.paymentMode}
                            </span>
                            {inv.isHypothecated && inv.financierName && (
                              <span className="text-[9.5px] text-slate-500 font-medium">
                                {inv.financierName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹{inv.billValue?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-mono whitespace-nowrap font-medium">
                          {inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setActivePreviewInvoice(inv)}
                              className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all shadow-2xs cursor-pointer whitespace-nowrap group"
                              title="View Official Tax Invoice, Gate Pass & Form 21"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white transition-colors" />
                              <span>View / Print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
