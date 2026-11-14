"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  VehicleRecord,
  VehicleStatus,
  InventorySummary,
} from "@/types/inventory";
import {
  Search,
  Bike,
  Eye,
  Plus,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Download,
  Calendar,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";

interface StockYardViewProps {
  vehicles: VehicleRecord[];
  summaryList: InventorySummary[];
  selectedBranch: string;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onSelectVehicle: (vehicle: VehicleRecord) => void;
  onViewModelMaster?: (vehicle: VehicleRecord) => void;
  onOpenInward: () => void;
  onOpenVoucher: () => void;
  onOpenTransfer: (preSelectedVehicle?: VehicleRecord) => void;
  onOpenSale: (preSelectedVehicle?: VehicleRecord) => void;
  onExportStock: () => void;
}

const FIELD_CONFIG = [
  {
    key: "color" as const,
    label: "Vehicle Color",
    desc: "Paint shade & color swatch dot",
  },
  {
    key: "chassis" as const,
    label: "Chassis Number (VIN)",
    desc: "Factory VIN & last 6 digits highlight",
  },
  {
    key: "engine" as const,
    label: "Engine Number",
    desc: "Factory stamped engine block serial",
  },
  {
    key: "key" as const,
    label: "Key Number",
    desc: "Physical ignition & fuel tank key tag",
  },
  {
    key: "battery" as const,
    label: "Battery Number",
    desc: "Installed battery serial & manufacturer",
  },
];

export const StockYardView: React.FC<StockYardViewProps> = ({
  vehicles,
  summaryList,
  selectedBranch,
  statusFilter: propStatusFilter,
  onStatusFilterChange,
  onSelectVehicle,
  onViewModelMaster,
  onOpenInward,
  onOpenVoucher,
  onOpenTransfer,
  onOpenSale,
  onExportStock,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>("ALL");
  const statusFilter = propStatusFilter !== undefined ? propStatusFilter : internalStatusFilter;

  const handleStatusChange = (newStatus: string) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(newStatus);
    } else {
      setInternalStatusFilter(newStatus);
    }
  };

  // Vehicle Filters (Field Visibility & Series/Model Selection)
  const [filterTab, setFilterTab] = useState<"fields" | "models">("fields");
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    color: false,
    chassis: false,
    engine: false,
    key: false,
    battery: false,
  });
  const [selectedModels, setSelectedModels] = useState<Record<string, boolean>>({});

  // Date Filter State
  const [datePreset, setDatePreset] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Popover Toggles
  const [dateTubeOpen, setDateTubeOpen] = useState(false);
  const [fieldFiltersOpen, setFieldFiltersOpen] = useState(false);

  const dateTubeRef = useRef<HTMLDivElement>(null);
  const fieldFiltersRef = useRef<HTMLDivElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateTubeRef.current && !dateTubeRef.current.contains(e.target as Node)) {
        setDateTubeOpen(false);
      }
      if (fieldFiltersRef.current && !fieldFiltersRef.current.contains(e.target as Node)) {
        setFieldFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLocalDateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d} ${months[parseInt(m, 10) - 1]}`;
    } catch {
      return dateStr;
    }
  };

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    setCurrentPage(1);
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = getLocalDateStr(yest);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === "this_week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      setStartDate(getLocalDateStr(weekAgo));
      setEndDate(todayStr);
    } else if (preset === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getLocalDateStr(firstDay));
      setEndDate(todayStr);
    } else if (preset === "last_month") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(getLocalDateStr(firstDayLastMonth));
      setEndDate(getLocalDateStr(lastDayLastMonth));
    }
  };

  const parseRecordDate = (v: VehicleRecord): string => {
    const raw = v.createdAt || v.updatedAt || v.manufacturingDate || "";
    if (!raw) return "";
    if (raw.includes("T")) return raw.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return "";
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Unique model counts for Vehicle Filters
  const modelOptions = useMemo(() => {
    const map = new Map<string, { modelId: string; modelName: string; count: number; available: number }>();
    vehicles.forEach((v) => {
      if (selectedBranch !== "ALL" && v.branchId !== selectedBranch) return;
      const cur = map.get(v.modelId) || { modelId: v.modelId, modelName: v.modelName, count: 0, available: 0 };
      cur.count++;
      if (v.status === "AVAILABLE") cur.available++;
      map.set(v.modelId, cur);
    });
    return Array.from(map.values());
  }, [vehicles, selectedBranch]);

  // Keep selectedModels synced with available models
  useEffect(() => {
    if (modelOptions.length > 0 && Object.keys(selectedModels).length === 0) {
      const init: Record<string, boolean> = {};
      modelOptions.forEach((m) => {
        init[m.modelId] = true;
      });
      setSelectedModels(init);
    }
  }, [modelOptions, selectedModels]);

  const isAllModelsSelected = useMemo(() => {
    if (modelOptions.length === 0) return true;
    return modelOptions.every((m) => selectedModels[m.modelId] !== false);
  }, [modelOptions, selectedModels]);

  const activeModelsCount = useMemo(() => {
    if (modelOptions.length === 0) return 0;
    return modelOptions.filter((m) => selectedModels[m.modelId] !== false).length;
  }, [modelOptions, selectedModels]);

  const activeFieldsCount = useMemo(() => {
    return FIELD_CONFIG.filter((f) => visibleFields[f.key]).length;
  }, [visibleFields]);

  // Check All / Reset Handlers for popover
  const handleCheckAll = () => {
    if (filterTab === "fields") {
      const allCols: Record<string, boolean> = {};
      FIELD_CONFIG.forEach((f) => (allCols[f.key] = true));
      setVisibleFields(allCols);
    } else {
      const allMods: Record<string, boolean> = {};
      modelOptions.forEach((m) => (allMods[m.modelId] = true));
      setSelectedModels(allMods);
      setCurrentPage(1);
    }
  };

  const handleReset = () => {
    if (filterTab === "fields") {
      const noneCols: Record<string, boolean> = {};
      FIELD_CONFIG.forEach((f) => (noneCols[f.key] = false));
      setVisibleFields(noneCols);
    } else {
      const allMods: Record<string, boolean> = {};
      modelOptions.forEach((m) => (allMods[m.modelId] = true));
      setSelectedModels(allMods);
      setCurrentPage(1);
    }
  };

  const handleResetAllFilters = () => {
    setSearchTerm("");
    handleStatusChange("ALL");
    const allMods: Record<string, boolean> = {};
    modelOptions.forEach((m) => (allMods[m.modelId] = true));
    setSelectedModels(allMods);
    setVisibleFields({ color: false, chassis: false, engine: false, key: false, battery: false });
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Branch filter
      if (selectedBranch !== "ALL" && v.branchId !== selectedBranch) return false;

      // Status filter (from interactive KPI cards)
      if (statusFilter === "SOLD") {
        if (v.status !== "SOLD" && v.status !== "DELIVERED") return false;
      } else if (statusFilter !== "ALL" && statusFilter !== "TOTAL" && v.status !== statusFilter) {
        return false;
      }

      // Model filter (from Vehicle Filters popover)
      if (!isAllModelsSelected && selectedModels[v.modelId] === false) {
        return false;
      }

      // Date Range Filter
      if (startDate || endDate) {
        const vDate = parseRecordDate(v);
        if (vDate) {
          if (startDate && vDate < startDate) return false;
          if (endDate && vDate > endDate) return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const chassis = (v.chassisNumber || "").toLowerCase();
        const engine = (v.engineNumber || "").toLowerCase();
        const model = (v.modelName || "").toLowerCase();
        const color = (v.colorName || "").toLowerCase();
        const key = (v.keyNumber || "").toLowerCase();
        const bin = (v.binCode || "").toLowerCase();

        return (
          chassis.includes(q) ||
          engine.includes(q) ||
          model.includes(q) ||
          color.includes(q) ||
          key.includes(q) ||
          bin.includes(q)
        );
      }

      return true;
    });
  }, [vehicles, selectedBranch, statusFilter, isAllModelsSelected, selectedModels, searchTerm, startDate, endDate]);

  // Aggregate stats for KPI cards
  const stats = useMemo(() => {
    const relevant = selectedBranch === "ALL" 
      ? vehicles 
      : vehicles.filter((v) => v.branchId === selectedBranch);

    return {
      total: relevant.length,
      available: relevant.filter((v) => v.status === "AVAILABLE").length,
      reserved: relevant.filter((v) => v.status === "RESERVED").length,
      inTransit: relevant.filter((v) => v.status === "IN_TRANSIT" || v.status === "TRANSFER_PENDING").length,
      sold: relevant.filter((v) => v.status === "SOLD" || v.status === "DELIVERED").length,
    };
  }, [vehicles, selectedBranch]);

  // Pagination calculation
  const totalItems = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">AVAILABLE</span>;
      case "RESERVED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">RESERVED</span>;
      case "IN_TRANSIT":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">IN TRANSIT</span>;
      case "TRANSFER_PENDING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">TRANSFER REQ</span>;
      case "SOLD":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">SOLD</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">DELIVERED</span>;
      case "DAMAGED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">DAMAGED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    (statusFilter !== "ALL" && statusFilter !== "TOTAL") || 
    !isAllModelsSelected ||
    activeFieldsCount > 0 ||
    datePreset !== "all" || 
    startDate !== "" || 
    endDate !== "";

  return (
    <div className="space-y-3.5 animate-fadeIn font-sans">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Stock Yard & Live Inventory</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={onOpenInward}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Inward Upload</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoucher}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Manual Voucher</span>
          </button>

          <button
            type="button"
            onClick={onExportStock}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            title="Download stock inventory to CSV"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon - Interactive One-Click Status Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* 1. Total Stock */}
        <div
          onClick={() => {
            handleStatusChange("TOTAL");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-[1.01] ${
            statusFilter === "ALL" || statusFilter === "TOTAL"
              ? "bg-blue-50/40 border-2 border-blue-400/90 ring-2 ring-blue-100"
              : "bg-white border-slate-200/90 hover:border-slate-300"
          }`}
          title="Click to view all stock"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">Total Stock</span>
            {(statusFilter === "ALL" || statusFilter === "TOTAL") && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded-full">Active</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
          <span className="text-[10px] text-slate-400">Tracked Units</span>
        </div>

        {/* 2. Available */}
        <div
          onClick={() => {
            handleStatusChange("AVAILABLE");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-[1.01] ${
            statusFilter === "AVAILABLE"
              ? "bg-emerald-50/50 border-2 border-emerald-400 ring-2 ring-emerald-100"
              : "bg-white border-emerald-200/80 bg-emerald-50/15 hover:border-emerald-300"
          }`}
          title="Click to filter Ready for Sale units"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider">Available</span>
            {statusFilter === "AVAILABLE" && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded-full">Active</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{stats.available}</div>
          <span className="text-[10px] text-emerald-600/80 font-medium">Ready for Sale</span>
        </div>

        {/* 3. Reserved */}
        <div
          onClick={() => {
            handleStatusChange("RESERVED");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-[1.01] ${
            statusFilter === "RESERVED"
              ? "bg-amber-50/50 border-2 border-amber-400 ring-2 ring-amber-100"
              : "bg-white border-amber-200/80 bg-amber-50/15 hover:border-amber-300"
          }`}
          title="Click to filter Locked for Booking units"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider">Reserved</span>
            {statusFilter === "RESERVED" && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-600 text-white rounded-full">Active</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{stats.reserved}</div>
          <span className="text-[10px] text-amber-600/80 font-medium">Locked for Booking</span>
        </div>

        {/* 4. In Transit */}
        <div
          onClick={() => {
            handleStatusChange("IN_TRANSIT");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-[1.01] ${
            statusFilter === "IN_TRANSIT"
              ? "bg-sky-50/50 border-2 border-sky-400 ring-2 ring-sky-100"
              : "bg-white border-blue-200/80 bg-blue-50/15 hover:border-blue-300"
          }`}
          title="Click to filter Inter-branch / Sub-dealer units"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-blue-700 uppercase tracking-wider">In Transit</span>
            {statusFilter === "IN_TRANSIT" && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded-full">Active</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{stats.inTransit}</div>
          <span className="text-[10px] text-blue-600/80 font-medium">Inter-branch / Sub-dealer</span>
        </div>

        {/* 5. Sold / Delivered */}
        <div
          onClick={() => {
            handleStatusChange("SOLD");
            setCurrentPage(1);
          }}
          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-[1.01] ${
            statusFilter === "SOLD"
              ? "bg-slate-50 border-2 border-slate-300 ring-2 ring-slate-200"
              : "bg-white border-slate-200/90 hover:border-slate-300"
          }`}
          title="Click to filter Invoiced Handover units"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">Sold / Delivered</span>
            {statusFilter === "SOLD" && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-600 text-white rounded-full">Active</span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-700 mt-0.5">{stats.sold}</div>
          <span className="text-[10px] text-slate-400">Invoiced Handover</span>
        </div>
      </div>

      {/* SINGLE LINE CONTROL BAR: EXACT MMC DESIGN */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              maxLength={60}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search chassis number (VIN), engine, model, color, yard bay..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Showing Count | Date Tube | Field Filters Dropdown */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end shrink-0 flex-wrap sm:flex-nowrap">
            {/* Showing Vehicle Count */}
            <p className="text-xs text-slate-600 font-medium whitespace-nowrap">
              Showing <span className="font-bold text-slate-900">{totalItems === 0 ? 0 : `${startIndex + 1}–${endIndex}`}</span> of <span className="font-bold text-slate-900">{totalItems}</span>
            </p>

            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

            {/* 1. SEPARATE SMALL DATE FILTER TUBE (EXACT MMC PATTERN) */}
            <div ref={dateTubeRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setDateTubeOpen((prev) => !prev);
                  setFieldFiltersOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  startDate || endDate || datePreset !== "all"
                    ? "bg-blue-50 text-blue-700 border-blue-400 hover:bg-blue-100 ring-2 ring-blue-100"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50"
                }`}
                title="Filter by Inward or Registration Date"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>
                  {startDate && endDate
                    ? `${formatShortDate(startDate)} → ${formatShortDate(endDate)}`
                    : startDate
                    ? `From ${formatShortDate(startDate)}`
                    : endDate
                    ? `Up to ${formatShortDate(endDate)}`
                    : datePreset !== "all"
                    ? datePreset.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Date Filter"}
                </span>
                {(startDate || endDate || datePreset !== "all") && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
                )}
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 shrink-0 ${dateTubeOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {/* DATE FILTER FLOATING POPOVER */}
              {dateTubeOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Date Range Filter</span>
                    </div>
                    {(startDate || endDate || datePreset !== "all") && (
                      <button
                        type="button"
                        onClick={() => applyDatePreset("all")}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Quick Presets Grid */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Quick Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "all", label: "All Time" },
                        { id: "today", label: "Today" },
                        { id: "yesterday", label: "Yesterday" },
                        { id: "this_week", label: "This Week" },
                        { id: "this_month", label: "This Month" },
                        { id: "last_month", label: "Last Month" },
                      ].map((preset) => {
                        const isActive = datePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              applyDatePreset(preset.id);
                              if (preset.id !== "custom") setDateTubeOpen(false);
                            }}
                            className={`px-1.5 py-1 text-[10.5px] rounded-lg transition-all text-center cursor-pointer ${
                              isActive
                                ? "bg-blue-600 text-white font-bold shadow-xs"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium border border-slate-200"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Custom Date Range:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">From Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setDatePreset("custom");
                            setCurrentPage(1);
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-800 font-medium focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">To Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setDatePreset("custom");
                            setCurrentPage(1);
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-800 font-medium focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {totalItems} matching vehicles
                    </span>
                    <button
                      type="button"
                      onClick={() => setDateTubeOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] cursor-pointer transition-colors shadow-2xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. VEHICLE FILTERS DROPDOWN (FIELDS & SERIES POPUP MATCHING EXACT MMC DESIGN) */}
            <div ref={fieldFiltersRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setFieldFiltersOpen((prev) => !prev);
                  setDateTubeOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                  !isAllModelsSelected || activeFieldsCount > 0
                    ? "bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-100"
                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
                title="Filter vehicles by Model and customize column fields"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Vehicle Filters</span>
                {(!isAllModelsSelected || activeFieldsCount > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white leading-tight">
                    {(!isAllModelsSelected ? 1 : 0) + (activeFieldsCount > 0 ? activeFieldsCount : 0)}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 shrink-0 ${fieldFiltersOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {/* VEHICLE FILTERS FLOATING POPOVER (MATCHING MMC EXACT SPEC) */}
              {fieldFiltersOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <SlidersHorizontal className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">Vehicle Filters</span>
                        <span className="text-[10px] text-slate-400 block">Toggle columns & series</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={handleCheckAll}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Check All
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="font-semibold text-slate-500 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Filter Type Tabs: Fields vs Series */}
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFilterTab("fields")}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                        filterTab === "fields"
                          ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900 font-semibold"
                      }`}
                    >
                      Fields ({activeFieldsCount}/{FIELD_CONFIG.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab("models")}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                        filterTab === "models"
                          ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900 font-semibold"
                      }`}
                    >
                      Series ({activeModelsCount}/{modelOptions.length})
                    </button>
                  </div>

                  {/* CHECKBOX LIST (COMPACT SCROLLABLE) */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {filterTab === "fields" ? (
                      FIELD_CONFIG.map((col, idx) => {
                        const isChecked = !!visibleFields[col.key];
                        return (
                          <label
                            key={col.key}
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs cursor-pointer transition-colors select-none ${
                              isChecked
                                ? "border-blue-400 bg-blue-50/70 text-blue-950 font-bold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 font-mono w-3.5">
                                  {idx + 1}.
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate">{col.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-normal truncate pl-5">
                                {col.desc}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setVisibleFields((prev) => ({
                                  ...prev,
                                  [col.key]: !prev[col.key],
                                }))
                              }
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                          </label>
                        );
                      })
                    ) : (
                      modelOptions.map((opt, idx) => {
                        const isChecked = selectedModels[opt.modelId] !== false;
                        return (
                          <label
                            key={opt.modelId}
                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border text-xs cursor-pointer transition-colors select-none ${
                              isChecked
                                ? "border-blue-400 bg-blue-50/70 text-blue-950 font-bold shadow-2xs"
                                : "border-slate-200 bg-white text-slate-400 font-medium hover:bg-slate-50"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 font-mono w-3.5">
                                  {idx + 1}.
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate">{opt.modelName}</span>
                                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                  {opt.available} Avail
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-normal truncate pl-5">
                                {opt.count} total in stock
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedModels((prev) => ({
                                  ...prev,
                                  [opt.modelId]: prev[opt.modelId] === false ? true : false,
                                }));
                                setCurrentPage(1);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10.5px] text-slate-500 font-medium">
                      {filteredVehicles.length} of {vehicles.length} vehicles visible
                    </span>
                    <button
                      type="button"
                      onClick={() => setFieldFiltersOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-2xs transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Summary Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active:
            </span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                Search: &quot;{searchTerm}&quot;
                <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => handleSearchChange("")} />
              </span>
            )}

            {statusFilter !== "ALL" && statusFilter !== "TOTAL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                Status: {statusFilter === "SOLD" ? "Sold / Delivered" : statusFilter === "IN_TRANSIT" ? "In Transit" : statusFilter === "AVAILABLE" ? "Available" : statusFilter === "RESERVED" ? "Reserved" : statusFilter}
                <X className="w-3 h-3 cursor-pointer hover:text-emerald-950" onClick={() => handleStatusChange("ALL")} />
              </span>
            )}

            {!isAllModelsSelected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                Series: {activeModelsCount}/{modelOptions.length}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-blue-900"
                  onClick={() => {
                    const allMods: Record<string, boolean> = {};
                    modelOptions.forEach((m) => (allMods[m.modelId] = true));
                    setSelectedModels(allMods);
                  }}
                />
              </span>
            )}

            {activeFieldsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                Fields: {activeFieldsCount} visible
                <X
                  className="w-3 h-3 cursor-pointer hover:text-blue-900"
                  onClick={() =>
                    setVisibleFields({ color: false, chassis: false, engine: false, key: false, battery: false })
                  }
                />
              </span>
            )}

            {(startDate || endDate || datePreset !== "all") && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                <Calendar className="w-3 h-3 text-blue-600" />
                Date: {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `From ${startDate}` : endDate ? `To ${endDate}` : datePreset}
                <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => applyDatePreset("all")} />
              </span>
            )}

            <button
              onClick={handleResetAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-1 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Vehicle Table with Built-in Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12 text-slate-400">S.No</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Model & Variant</th>
                {visibleFields.color && <th className="py-3 px-4">Color</th>}
                {visibleFields.chassis && <th className="py-3 px-4">Chassis Number (VIN)</th>}
                {visibleFields.engine && <th className="py-3 px-4">Engine Number</th>}
                <th className="py-3 px-4">Yard Location / Bay</th>
                {visibleFields.key && <th className="py-3 px-4">Key Number</th>}
                {visibleFields.battery && <th className="py-3 px-4">Battery Number</th>}
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      5 +
                      (visibleFields.color ? 1 : 0) +
                      (visibleFields.chassis ? 1 : 0) +
                      (visibleFields.engine ? 1 : 0) +
                      (visibleFields.key ? 1 : 0) +
                      (visibleFields.battery ? 1 : 0)
                    }
                    className="py-12 text-center text-slate-400"
                  >
                    <Bike className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-600">No vehicles match your search or filter.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting the search bar, date filters, or branch selection.</p>
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v, index) => {
                  const serialNumber = startIndex + index + 1;
                  const chassisTail = v.chassisNumber.slice(-6);
                  const chassisHead = v.chassisNumber.slice(0, -6);

                  return (
                    <tr
                      key={v.vehicleId}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectVehicle(v)}
                    >
                      <td className="py-3.5 px-3 text-center text-xs font-mono font-bold text-slate-400">
                        {serialNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(v.status)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div>{v.modelName}</div>
                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1 py-0.2 rounded">{v.modelCode || "YAMAHA"}</span>
                          <span>•</span>
                          <span>₹{v.purchaseRate?.toLocaleString("en-IN")}</span>
                        </div>
                      </td>

                      {visibleFields.color && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                              style={{ backgroundColor: v.colorCode || "#64748b" }}
                            />
                            <span className="font-semibold text-slate-800">{v.colorName}</span>
                          </div>
                        </td>
                      )}

                      {visibleFields.chassis && (
                        <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                          <span className="text-slate-400 font-normal">{chassisHead}</span>
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-black">
                            {chassisTail}
                          </span>
                        </td>
                      )}

                      {visibleFields.engine && (
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {v.engineNumber || "—"}
                        </td>
                      )}

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{v.locationName || "Main Showroom"}</div>
                        <div className="text-[10px] text-blue-600 font-mono font-bold">
                          {v.binCode || "BAY-01"}
                        </div>
                      </td>

                      {visibleFields.key && (
                        <td className="py-3.5 px-4 text-slate-700 font-mono whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-[11px] text-slate-800 border border-slate-200">
                            {v.keyNumber || "KY-01"}
                          </span>
                        </td>
                      )}

                      {visibleFields.battery && (
                        <td className="py-3.5 px-4 text-slate-700 font-mono whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-[11px] text-slate-800 border border-slate-200">
                            {v.batteryNumber || "EXIDE"}
                          </span>
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {v.status === "AVAILABLE" && (
                            <button
                              onClick={() => onOpenTransfer(v)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] border border-slate-300 transition-colors cursor-pointer"
                              title="Transfer to Branch or Sub-Dealer"
                            >
                              Transfer
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (onViewModelMaster) {
                                onViewModelMaster(v);
                              } else {
                                onSelectVehicle(v);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold rounded-lg text-[11px] border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-2xs group"
                            title="View in Model Masters Dashboard"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Interactive Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          {/* Left: Total counts & Page size selector */}
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-900">{totalItems}</span> vehicles
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
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Previous / Page Numbers / Next */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
                  return <span key={pageNum} className="text-slate-400 px-0.5">...</span>;
                }
                return null;
              })}
            </div>

            <button
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
    </div>
  );
};
