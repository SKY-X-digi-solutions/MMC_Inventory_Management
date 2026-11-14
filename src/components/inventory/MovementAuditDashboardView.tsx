"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { StockMovement } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { ExportService } from "@/services/export.service";
import {
  History,
  Download,
  Search,
  ShieldCheck,
  Filter,
  ArrowRight,
  ChevronDown,
  Check,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

interface EventTypeOption {
  value: string;
  code: string;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}

const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    value: "ALL",
    code: "ALL",
    label: "All Event Types",
    description: "Complete Audit Trail",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    badgeBorder: "border-slate-200",
    dotColor: "bg-slate-400",
  },
  {
    value: "PURCHASE",
    code: "PURCHASE",
    label: "PURCHASE (Inward)",
    description: "Inward Consignment",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  {
    value: "SALE",
    code: "SALE",
    label: "SALE (Invoiced)",
    description: "Customer Invoiced",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    value: "TRANSFER_OUT",
    code: "TRANSFER_OUT",
    label: "TRANSFER_OUT (Dispatched)",
    description: "Branch Dispatched",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  {
    value: "TRANSFER_IN",
    code: "TRANSFER_IN",
    label: "TRANSFER_IN (Received)",
    description: "Branch Received",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    value: "ADJUSTMENT",
    code: "ADJUSTMENT",
    label: "ADJUSTMENT (Damage / PDI)",
    description: "Damage / PDI Check",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    dotColor: "bg-purple-500",
  },
];

export const MovementAuditDashboardView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const movements = useMemo(() => InventoryService.getMovements(), []);

  // Quick event counts for quick filter chips
  const counts = useMemo(() => {
    return {
      all: movements.length,
      purchase: movements.filter((m) => m.movementType === "PURCHASE").length,
      transfer: movements.filter((m) => m.movementType.includes("TRANSFER")).length,
      sale: movements.filter((m) => m.movementType === "SALE").length,
      adjustment: movements.filter((m) => m.movementType === "ADJUSTMENT").length,
    };
  }, [movements]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, dateFilter]);

  // Filtration Logic (Location removed as requested)
  const filtered = useMemo(() => {
    return movements.filter((m) => {
      // Event Type Filter
      if (typeFilter !== "ALL") {
        if (typeFilter === "TRANSFER") {
          if (!m.movementType.includes("TRANSFER")) return false;
        } else if (m.movementType !== typeFilter) {
          return false;
        }
      }

      // Date Range Filter
      if (dateFilter !== "ALL") {
        const mDate = new Date(m.movementDate);
        const now = new Date();
        if (dateFilter === "TODAY") {
          if (mDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "WEEK") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (mDate < sevenDaysAgo) return false;
        } else if (dateFilter === "MONTH") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (mDate < thirtyDaysAgo) return false;
        }
      }

      // Search Term Filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        return (
          m.chassisNumber.toLowerCase().includes(q) ||
          m.movementType.toLowerCase().includes(q) ||
          (m.referenceId && m.referenceId.toLowerCase().includes(q)) ||
          (m.notes && m.notes.toLowerCase().includes(q)) ||
          (m.createdBy && m.createdBy.toLowerCase().includes(q)) ||
          (m.fromBranchName && m.fromBranchName.toLowerCase().includes(q)) ||
          (m.toBranchName && m.toBranchName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movements, searchTerm, typeFilter, dateFilter]);

  // Pagination Calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMovements = filtered.slice(startIndex, endIndex);

  const handleExport = () => {
    ExportService.exportMovementLedger(filtered);
    toast.success("Stock movement ledger exported to CSV!");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("ALL");
    setDateFilter("ALL");
    toast.success("All filters cleared!");
  };

  const isFiltered =
    searchTerm.trim() !== "" ||
    typeFilter !== "ALL" ||
    dateFilter !== "ALL";

  const selectedOption = useMemo(() => {
    return EVENT_TYPE_OPTIONS.find((opt) => opt.value === typeFilter) || EVENT_TYPE_OPTIONS[0];
  }, [typeFilter]);

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Stock Movement Audit Ledger
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200/60 uppercase">
              Immutable Audit Trail
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time chronological log of manufacturer inwards, branch transfers, customer deliveries, and stock adjustments.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Sleek & Compact Filtration Panel (Location removed, compact size) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        {/* Row 1: Search & Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Input - Full Breathing Room */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Chassis No (VIN), Reference Document, Operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter 1: Date Range Filter */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-7 pr-6 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">This Month</option>
              </select>
            </div>

            {/* Filter 2: Custom Event Type Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs min-w-[175px] select-none ${
                  isDropdownOpen
                    ? "bg-white border-2 border-blue-500 ring-2 ring-blue-500/20 text-slate-900"
                    : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.dotColor}`} />
                  <span className="truncate">{selectedOption.label}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isDropdownOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Floating Dropdown Menu Card with Perfect Alignment */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-76 sm:w-84 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-fadeIn space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Filter by Event Type</span>
                    <span className="font-mono text-slate-400">{EVENT_TYPE_OPTIONS.length} Options</span>
                  </div>

                  <div className="py-0.5 space-y-1">
                    {EVENT_TYPE_OPTIONS.map((opt) => {
                      const isSelected = typeFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTypeFilter(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all text-left ${
                            isSelected
                              ? "bg-blue-50 text-blue-900 font-bold border border-blue-200/80 shadow-2xs"
                              : "hover:bg-slate-50 text-slate-700 font-medium border border-transparent"
                          }`}
                        >
                          {/* Left Column: Event Badge */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.dotColor}`} />
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${opt.badgeBg} ${opt.badgeText} ${opt.badgeBorder}`}
                            >
                              {opt.code}
                            </span>
                          </div>

                          {/* Right Column: Clean Description & Checkmark */}
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {opt.description}
                            </span>
                            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Compact Quick Filter Chips & Reset */}
        <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quick Filter:
            </span>

            {[
              { label: "All Events", value: "ALL", count: counts.all },
              { label: "Purchases", value: "PURCHASE", count: counts.purchase },
              { label: "Transfers", value: "TRANSFER", count: counts.transfer },
              { label: "Sales", value: "SALE", count: counts.sale },
              { label: "Adjustments", value: "ADJUSTMENT", count: counts.adjustment },
            ].map((chip) => {
              const isActive =
                chip.value === "TRANSFER"
                  ? typeFilter.includes("TRANSFER")
                  : typeFilter === chip.value;

              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setTypeFilter(chip.value)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-2xs font-bold"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/70"
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                      isActive ? "bg-blue-700 text-white" : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table with Pagination Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Summary */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span className="font-bold text-slate-800">
            Showing <span className="text-blue-600 font-extrabold">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="text-blue-600 font-extrabold">{endIndex}</span> of{" "}
            <span className="text-slate-900 font-extrabold">{totalItems}</span> logged stock events
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/60 uppercase tracking-wide">
            Dealership Movement Log
          </span>
        </div>

        {/* Scrollable Table Area */}
        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-2 text-center whitespace-nowrap align-middle w-10 font-bold text-slate-600 uppercase">
                  S.No
                </th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Event Type</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Chassis Number (VIN)</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Movement Trail</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Reference Document</th>
                <th className="py-3 px-2.5 text-center align-middle">Notes / Reason</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Operator</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap align-middle">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div>No matching stock movement events found.</div>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((m, idx) => {
                  const isPurchase = m.movementType === "PURCHASE";
                  const isSale = m.movementType === "SALE";
                  const isTransfer = m.movementType.includes("TRANSFER");
                  const isAdjustment = m.movementType === "ADJUSTMENT";

                  return (
                    <tr key={m.movementId} className="hover:bg-blue-50/30 transition-colors">
                      {/* S.No */}
                      <td className="py-3 px-2 text-center whitespace-nowrap font-mono font-bold text-slate-500 text-xs align-middle">
                        {startIndex + idx + 1}
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap align-middle">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-2xs ${
                            isPurchase
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isSale
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : isTransfer
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPurchase
                                ? "bg-emerald-500"
                                : isSale
                                ? "bg-blue-500"
                                : isTransfer
                                ? "bg-indigo-500"
                                : "bg-purple-500"
                            }`}
                          />
                          {m.movementType}
                        </span>
                      </td>

                      {/* Chassis Number */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap font-mono align-middle">
                        <span className="font-bold text-slate-900 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg inline-flex items-center justify-center text-xs">
                          {m.chassisNumber}
                        </span>
                      </td>

                      {/* Movement Trail */}
                      <td className="py-3 px-2.5 text-center align-middle font-sans text-xs whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <span className="font-semibold text-slate-700">
                            {m.fromBranchName || "Factory Inward"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-bold text-slate-900">
                            {m.toBranchName || "Customer Delivery"}
                          </span>
                        </div>
                      </td>

                      {/* Reference Document */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap align-middle">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg text-xs inline-flex items-center justify-center">
                          {m.referenceId}
                        </span>
                      </td>

                      {/* Notes / Reason */}
                      <td className="py-3 px-2.5 text-center align-middle font-sans text-xs text-slate-600 max-w-xs truncate">
                        {m.notes || "—"}
                      </td>

                      {/* Operator */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap align-middle font-sans text-xs">
                        <span className="font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md inline-flex items-center justify-center text-center">
                          {m.createdBy}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap align-middle font-mono text-[11px] text-slate-500">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-50/80 border border-slate-200/80 px-2 py-0.5 rounded-lg inline-flex items-center justify-center">
                          {m.movementDate ? m.movementDate.replace("T", " ").slice(0, 19) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Interactive Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          {/* Left: Total counts & Rows per page selector */}
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
              <strong className="font-bold text-slate-900">{endIndex}</strong> of{" "}
              <strong className="font-bold text-slate-900">{totalItems}</strong> events
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
              <span className="text-[11px] text-slate-400 font-semibold">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 text-slate-800 font-bold rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Prev / Page Numbers / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-6.5 h-6.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === safeCurrentPage - 2 ||
                  pageNum === safeCurrentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="text-slate-400 px-0.5 select-none text-xs">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
