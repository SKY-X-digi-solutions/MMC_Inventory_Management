"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { VehiclePricingMaster } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  IndianRupee,
  Printer,
  Download,
  Edit3,
  Search,
  Bike,
  Building2,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface PricingMasterDashboardViewProps {
  onOpenSale?: () => void;
}

export const PricingMasterDashboardView: React.FC<PricingMasterDashboardViewProps> = ({
  onOpenSale,
}) => {
  const [pricingList, setPricingList] = useState<VehiclePricingMaster[]>(() =>
    InventoryService.getPricingMasters()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [editingPricing, setEditingPricing] = useState<VehiclePricingMaster | null>(null);
  const [showQuotationSheet, setShowQuotationSheet] = useState(false);

  // Field Filter Popover state
  const [seriesFilterOpen, setSeriesFilterOpen] = useState(false);
  const seriesFilterRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Close series popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seriesFilterRef.current && !seriesFilterRef.current.contains(e.target as Node)) {
        setSeriesFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Filtered pricing records
  const filteredList = useMemo(() => {
    return pricingList.filter((p) => {
      const matchSearch =
        p.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.modelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === "ALL") return matchSearch;
      if (selectedCategory === "SCOOTER") return matchSearch && p.vehicleType === "SCOOTER";
      if (selectedCategory === "COMMUTER") return matchSearch && p.vehicleType === "FZ SERIES";
      if (selectedCategory === "SPORTS")
        return matchSearch && (p.vehicleType.includes("SPORTS") || p.vehicleType.includes("RACING"));
      return matchSearch;
    });
  }, [pricingList, searchQuery, selectedCategory]);

  // Pagination calculations
  const totalItems = filteredList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedList = filteredList.slice(startIndex, endIndex);

  // Quick stats
  const totalModels = pricingList.length;
  const avgMargin = Math.round(
    pricingList.reduce((acc, curr) => acc + curr.dealerGrossMargin, 0) / (totalModels || 1)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Model Name",
      "Model Code",
      "Segment",
      "OEM Purchase Cost (INR)",
      "Ex-Showroom Taxable Base (INR)",
      "GST Rate (%)",
      "GST Amount (INR)",
      "Ex-Showroom Price (INR)",
      "TN RTO Tax & Charges (INR)",
      "Comprehensive Insurance (INR)",
      "Mandatory Accessories (INR)",
      "Extended Warranty (INR)",
      "Total On-Road Price (INR)",
      "Dealer Gross Margin (INR)",
      "Sub-Dealer Wholesale Rate (INR)",
      "Sub-Dealer Margin (INR)",
    ];

    const rows = pricingList.map((p) => [
      p.modelName,
      p.modelCode,
      p.vehicleType,
      p.oemPurchaseCost.toString(),
      p.exShowroomBase.toString(),
      "28%",
      p.gstAmount.toString(),
      p.exShowroomPrice.toString(),
      (p.rtoRoadTax + p.rtoSmartCardPlate).toString(),
      p.insurance1Plus5.toString(),
      p.mandatoryAccessories.toString(),
      p.extendedWarranty5Yr.toString(),
      p.totalOnRoadPrice.toString(),
      p.dealerGrossMargin.toString(),
      p.subDealerWholesaleRate.toString(),
      p.subDealerMargin.toString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Maruthi_Motors_Yamaha_Price_Allocation_Master.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded official dealership price allocation CSV!");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricing) return;

    // Recompute auto-calculations
    const gstAmount = Math.round(editingPricing.exShowroomBase * editingPricing.gstRate);
    const exShowroomPrice = editingPricing.exShowroomBase + gstAmount;
    const totalOnRoadPrice =
      exShowroomPrice +
      editingPricing.rtoRoadTax +
      editingPricing.rtoSmartCardPlate +
      editingPricing.insurance1Plus5 +
      editingPricing.mandatoryAccessories +
      editingPricing.extendedWarranty5Yr;
    const dealerGrossMargin = editingPricing.exShowroomBase - editingPricing.oemPurchaseCost;

    const updated: VehiclePricingMaster = {
      ...editingPricing,
      gstAmount,
      exShowroomPrice,
      totalOnRoadPrice,
      dealerGrossMargin,
      updatedAt: new Date().toISOString(),
    };

    InventoryService.savePricingMaster(updated);
    setPricingList(InventoryService.getPricingMasters());
    setEditingPricing(null);
    toast.success(`Updated price allocation for ${updated.modelName}!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Official Customer Quotation Sheet View (When Triggered) */}
      {showQuotationSheet ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
            <button
              onClick={() => setShowQuotationSheet(false)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer"
            >
              ← Back to Pricing Master
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Customer Price List (A4)</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-48 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Maruthi Motors Yamaha"
                    fill
                    sizes="200px"
                    className="object-contain object-left"
                    priority
                    unoptimized
                  />
                </div>
              </div>
              <div className="text-left sm:text-right text-[11px] text-slate-600">
                <div className="font-black text-slate-900 text-sm">MARUTHI MOTORS YAMAHA</div>
                <div className="text-blue-700 font-bold">Official Dealership On-Road Price Quotation Sheet</div>
                <div className="text-slate-500">Tirupattur • Vaniyambadi • Natrampalli • Kandhili • Ambur</div>
                <div className="font-mono text-slate-800 font-bold">GSTIN: 33AAACM1234F1Z5 | State: 33 (TN)</div>
              </div>
            </div>

            {/* Price Matrix Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead className="bg-slate-100 font-extrabold text-[10.5px] text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-center min-w-[50px]">S.No</th>
                    <th className="py-2.5 px-3">Vehicle Model & Code</th>
                    <th className="py-2.5 px-3 text-right">Ex-Showroom (₹)</th>
                    <th className="py-2.5 px-3 text-right">TN RTO Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right">Insurance 1+5 (₹)</th>
                    <th className="py-2.5 px-3 text-right">Accessories (₹)</th>
                    <th className="py-2.5 px-3 text-right">Warranty 5Y (₹)</th>
                    <th className="py-2.5 px-3 text-right font-black text-emerald-900 bg-emerald-50">On-Road Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricingList.map((p, idx) => (
                    <tr key={p.pricingId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {p.modelName}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.modelCode} • {p.vehicleType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        ₹{p.exShowroomPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        ₹{(p.rtoRoadTax + p.rtoSmartCardPlate).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        ₹{p.insurance1Plus5.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        ₹{p.mandatoryAccessories.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        ₹{p.extendedWarranty5Yr.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/60 text-sm whitespace-nowrap">
                        ₹{p.totalOnRoadPrice.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 leading-relaxed">
              * Note: Prices are subject to prevailing Tamil Nadu RTO tax notifications and India Yamaha Motor factory revisions. On-Road prices include 1 Year Own Damage + 5 Years Third Party Insurance, Life Time Road Tax, Smart Card RC, HSRP number plates, ISI Helmet, and 5 Years Yamaha Shield Extended Warranty.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Vehicle Pricing & On-Road Allocation Masters</h1>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                title="Download Price Master CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQuotationSheet(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
                title="View Customer Price Quotation Sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Customer Price Sheet</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards (Uniform Symmetric Layout) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 min-h-[84px]">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Active Yamaha Models</span>
                <span className="text-base sm:text-lg font-black text-slate-900">{totalModels} Models</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 min-h-[84px]">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Statutory GST Rate</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-emerald-900 font-mono">28.00%</span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">HSN 8711</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 min-h-[84px]">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Avg Dealer Margin</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-black text-amber-900 font-mono">₹{avgMargin.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] font-semibold text-slate-400">/unit</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 min-h-[84px]">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Sub-Dealer Margin</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-base font-black text-indigo-900 font-mono">₹2,500 – ₹4,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Vehicle Series Field Filter Bar (Matching Exact MMC Field Filters Design) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model name, model code, segment..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
              {/* Active Filter Pill (if not ALL) */}
              {selectedCategory !== "ALL" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold">
                  <span>
                    Series:{" "}
                    <strong>
                      {selectedCategory === "SCOOTER"
                        ? "Scooters 125cc"
                        : selectedCategory === "COMMUTER"
                        ? "FZ Series"
                        : "Sports 155cc"}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className="text-blue-500 hover:text-blue-800 cursor-pointer ml-1"
                    title="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Vehicle Series Filter Dropdown Button matching MMC Field Filters design */}
              <div ref={seriesFilterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSeriesFilterOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                    selectedCategory !== "ALL"
                      ? "bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-100"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                  title="Filter models by vehicle segment"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Vehicle Series Filter</span>
                  {selectedCategory !== "ALL" && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white leading-tight">
                      1
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      seriesFilterOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Floating Popover (Compact, Small Cards, Zero Subtitles) */}
                {seriesFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 z-40 w-56 sm:w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">Vehicle Series</span>
                      </div>
                      {selectedCategory !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory("ALL")}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {[
                        { id: "ALL", label: "All Segments", count: totalModels },
                        { id: "SCOOTER", label: "Scooters 125cc", count: 2 },
                        { id: "COMMUTER", label: "FZ Series", count: 1 },
                        { id: "SPORTS", label: "Sports 155cc", count: 3 },
                      ].map((seg) => {
                        const isSelected = selectedCategory === seg.id;
                        return (
                          <div
                            key={seg.id}
                            onClick={() => {
                              setSelectedCategory(seg.id);
                              setSeriesFilterOpen(false);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer border transition-all ${
                              isSelected
                                ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                                : "bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium"
                            }`}
                          >
                            <span className="leading-tight">{seg.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                                {seg.count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {filteredList.length} models
                      </span>
                      <button
                        type="button"
                        onClick={() => setSeriesFilterOpen(false)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Allocation Master Table (Clean, Aligned, Zero-Wrapping) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Configured Model Pricing & Tax Allocations ({filteredList.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px] border-collapse">
                <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5 text-center min-w-[55px] whitespace-nowrap">S.No</th>
                    <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">Model & Variant</th>
                    <th className="py-3 px-3.5 text-right min-w-[105px] whitespace-nowrap">OEM Cost</th>
                    <th className="py-3 px-3.5 text-right min-w-[125px] whitespace-nowrap">Ex-Showroom</th>
                    <th className="py-3 px-3.5 text-right min-w-[105px] whitespace-nowrap">TN RTO Tax</th>
                    <th className="py-3 px-3.5 text-right min-w-[110px] whitespace-nowrap">Insurance 1+5</th>
                    <th className="py-3 px-3.5 text-right min-w-[110px] whitespace-nowrap">Kit & Fitments</th>
                    <th className="py-3 px-3.5 text-right min-w-[100px] whitespace-nowrap">Warranty 5Y</th>
                    <th className="py-3 px-4 text-right min-w-[135px] whitespace-nowrap font-black text-emerald-900 bg-emerald-50/90 border-x border-emerald-100">
                      On-Road Total
                    </th>
                    <th className="py-3 px-3.5 text-right min-w-[115px] whitespace-nowrap">Sub-Dealer Rate</th>
                    <th className="py-3 px-3.5 text-center min-w-[90px] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400 text-xs font-medium">
                        No models match the selected series or search filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((p, index) => (
                      <tr key={p.pricingId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 whitespace-nowrap font-mono">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{p.modelName}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {p.modelCode} • <span className="text-blue-600 font-semibold">{p.vehicleType}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono text-slate-600 whitespace-nowrap font-medium">
                          ₹{p.oemPurchaseCost.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900">₹{p.exShowroomPrice.toLocaleString("en-IN")}</div>
                          <span className="block text-[9.5px] text-slate-400 font-mono">Base: ₹{p.exShowroomBase.toLocaleString("en-IN")}</span>
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₹{(p.rtoRoadTax + p.rtoSmartCardPlate).toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₹{p.insurance1Plus5.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₹{p.mandatoryAccessories.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₹{p.extendedWarranty5Yr.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 bg-emerald-50/50 border-x border-emerald-100/70 text-sm whitespace-nowrap">
                          ₹{p.totalOnRoadPrice.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-right font-mono font-semibold text-indigo-700 whitespace-nowrap">
                          ₹{p.subDealerWholesaleRate.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setEditingPricing({ ...p })}
                              className="inline-flex items-center justify-center gap-1.5 h-7 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-lg border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs group"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600 group-hover:text-white transition-colors" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Matching MMC System Pattern */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              {/* Left: Total counts & Page size selector */}
              <div className="flex items-center gap-3">
                <span>
                  Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
                  <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
                  <span className="font-bold text-slate-900">{totalItems}</span> models
                </span>

                <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                  <span className="text-[11px] text-slate-400">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-300 text-slate-800 font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              {/* Right: Previous / Page Numbers / Next */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Edit Pricing Allocation Modal */}
          {editingPricing && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Edit Price Allocation: {editingPricing.modelName}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Model Code: {editingPricing.modelCode} | Segment: {editingPricing.vehicleType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPricing(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Ex-Showroom Taxable Base (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.exShowroomBase}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            exShowroomBase: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">
                        GST 28% Auto: <strong className="font-mono text-slate-700">₹{Math.round(editingPricing.exShowroomBase * 0.28).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        TN RTO Life Time Road Tax (LTT) (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.rtoRoadTax}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            rtoRoadTax: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Insurance 1+5 Yrs Comprehensive (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.insurance1Plus5}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            insurance1Plus5: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Mandatory Accessories & Helmet (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.mandatoryAccessories}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            mandatoryAccessories: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Yamaha Shield Extended Warranty (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.extendedWarranty5Yr}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            extendedWarranty5Yr: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Sub-Dealer Wholesale Rate (₹):
                      </label>
                      <input
                        type="number"
                        value={editingPricing.subDealerWholesaleRate}
                        onChange={(e) =>
                          setEditingPricing({
                            ...editingPricing,
                            subDealerWholesaleRate: Number(e.target.value),
                          })
                        }
                        className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Real-time Calculation Summary */}
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-950 block">Calculated Ex-Showroom:</span>
                      <span className="font-mono text-emerald-800">
                        ₹{(editingPricing.exShowroomBase + Math.round(editingPricing.exShowroomBase * 0.28)).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-950 block">Net On-Road Price:</span>
                      <span className="font-mono text-base font-black text-emerald-700">
                        ₹{(
                          editingPricing.exShowroomBase +
                          Math.round(editingPricing.exShowroomBase * 0.28) +
                          editingPricing.rtoRoadTax +
                          editingPricing.rtoSmartCardPlate +
                          editingPricing.insurance1Plus5 +
                          editingPricing.mandatoryAccessories +
                          editingPricing.extendedWarranty5Yr
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingPricing(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/30 cursor-pointer"
                    >
                      Save Pricing Allocation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
