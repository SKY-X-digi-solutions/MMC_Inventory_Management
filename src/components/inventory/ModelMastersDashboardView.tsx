"use client";

import React, { useState, useEffect, useMemo } from "react";
import { VehicleModel, ColorVariant, VehicleRecord } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  ArrowLeft,
  Plus,
  X,
  Bike,
  LayoutGrid,
  List,
  ChevronDown,
  Eye,
  IndianRupee,
  Warehouse,
  Layers,
  Gauge,
  ShieldCheck,
  Printer,
  Wrench,
  Battery,
  Key,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
  FileText,
  Tag,
  Search,
  Filter,
  Package,
  Boxes,
  Truck,
  Disc,
  Check,
  Calendar,
  Sliders,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

interface ModelMastersDashboardViewProps {
  onRefresh?: () => void;
}

export const ModelMastersDashboardView: React.FC<ModelMastersDashboardViewProps> = ({
  onRefresh,
}) => {
  const [models, setModels] = useState<VehicleModel[]>(InventoryService.getModels());
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedModelForDetails, setSelectedModelForDetails] = useState<VehicleModel | null>(null);

  // Detail view state
  const [activeDetailTab, setActiveDetailTab] = useState<
    "units" | "specs" | "colors" | "service" | "ledger"
  >("units");
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>("ALL");
  const [unitSearch, setUnitSearch] = useState<string>("");

  // Model catalog filtration & pagination state
  const [modelSearch, setModelSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [modelCurrentPage, setModelCurrentPage] = useState<number>(1);
  const [modelPageSize, setModelPageSize] = useState<number>(5);

  // Extract unique categories for filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.vehicleType) set.add(m.vehicleType.toUpperCase());
    });
    return Array.from(set).sort();
  }, [models]);

  // Category counts for quick filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: models.length };
    models.forEach((m) => {
      const cat = m.vehicleType?.toUpperCase() || "OTHER";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [models]);

  // Reset page when search or category filter changes
  useEffect(() => {
    setModelCurrentPage(1);
  }, [modelSearch, categoryFilter]);

  // Filtered models
  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    return models.filter((m) => {
      const matchesCategory =
        categoryFilter === "ALL" ||
        (m.vehicleType && m.vehicleType.toUpperCase() === categoryFilter.toUpperCase());

      const matchesSearch =
        !q ||
        m.modelName.toLowerCase().includes(q) ||
        m.modelCode.toLowerCase().includes(q) ||
        (m.hsnCode && m.hsnCode.toLowerCase().includes(q)) ||
        (m.vehicleType && m.vehicleType.toLowerCase().includes(q)) ||
        m.colors.some((c) => c.colorName.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [models, modelSearch, categoryFilter]);

  // Pagination calculations
  const totalModelItems = filteredModels.length;
  const totalModelPages = Math.max(1, Math.ceil(totalModelItems / modelPageSize));
  const safeModelCurrentPage = Math.min(Math.max(1, modelCurrentPage), totalModelPages);
  const modelStartIndex = (safeModelCurrentPage - 1) * modelPageSize;
  const modelEndIndex = Math.min(modelStartIndex + modelPageSize, totalModelItems);
  const paginatedModels = useMemo(() => {
    return filteredModels.slice(modelStartIndex, modelEndIndex);
  }, [filteredModels, modelStartIndex, modelEndIndex]);

  const handleResetModelFilters = () => {
    setModelSearch("");
    setCategoryFilter("ALL");
    setModelCurrentPage(1);
  };

  useEffect(() => {
    setVehicles(InventoryService.getVehicles());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedModelForDetails(null);
      }
    };
    if (selectedModelForDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModelForDetails]);

  // Compute live stock statistics for currently selected model
  const modelVehicles = useMemo(() => {
    if (!selectedModelForDetails) return [];
    return vehicles.filter(
      (v) =>
        v.modelId === selectedModelForDetails.modelId ||
        v.modelCode.toUpperCase() === selectedModelForDetails.modelCode.toUpperCase() ||
        v.modelName.toLowerCase() === selectedModelForDetails.modelName.toLowerCase()
    );
  }, [selectedModelForDetails, vehicles]);

  const stockStats = useMemo(() => {
    const total = modelVehicles.length;
    const available = modelVehicles.filter((v) => v.status === "AVAILABLE").length;
    const inTransit = modelVehicles.filter(
      (v) => v.status === "IN_TRANSIT" || v.status === "TRANSFER_PENDING"
    ).length;
    const reserved = modelVehicles.filter((v) => v.status === "RESERVED").length;
    const sold = modelVehicles.filter(
      (v) => v.status === "SOLD" || v.status === "DELIVERED"
    ).length;

    const branchesMap: Record<string, number> = {};
    modelVehicles.forEach((v) => {
      const bName = v.branchName || "Main Yard";
      branchesMap[bName] = (branchesMap[bName] || 0) + 1;
    });

    return { total, available, inTransit, reserved, sold, branchesMap };
  }, [modelVehicles]);

  // Filtered physical units for Tab 1
  const filteredUnits = useMemo(() => {
    return modelVehicles.filter((v) => {
      const matchesStatus = unitStatusFilter === "ALL" || v.status === unitStatusFilter;
      const q = unitSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        v.chassisNumber.toLowerCase().includes(q) ||
        v.engineNumber.toLowerCase().includes(q) ||
        (v.keyNumber && v.keyNumber.toLowerCase().includes(q)) ||
        (v.colorName && v.colorName.toLowerCase().includes(q)) ||
        (v.binCode && v.binCode.toLowerCase().includes(q)) ||
        (v.batteryNumber && v.batteryNumber.toLowerCase().includes(q)) ||
        (v.customerName && v.customerName.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [modelVehicles, unitStatusFilter, unitSearch]);

  // New model state
  const [modelName, setModelName] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [vehicleType, setVehicleType] = useState("SCOOTER");
  const [purchaseRate, setPurchaseRate] = useState(75000);
  const [salesRate, setSalesRate] = useState(98000);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#2563EB");
  const [colorList, setColorList] = useState<ColorVariant[]>([
    { colorId: "CLR-NEW-1", colorName: "Racing Blue", colorCode: "#2563EB" },
  ]);

  const handleAddColor = () => {
    if (!colorName.trim()) return;
    setColorList([
      ...colorList,
      {
        colorId: `CLR-NEW-${colorList.length + 1}`,
        colorName: colorName.trim(),
        colorCode: colorHex,
      },
    ]);
    setColorName("");
  };

  const handleSaveModel = () => {
    if (!modelName.trim() || !modelCode.trim()) {
      toast.error("Model Name and Model Code are required.");
      return;
    }

    const newModel: VehicleModel = {
      modelId: `MOD-${Date.now().toString().slice(-4)}`,
      modelName: modelName.trim(),
      modelCode: modelCode.trim().toUpperCase(),
      vehicleType,
      purchaseRate,
      salesRate,
      taxClassId: "GST001",
      hsnCode: "8711",
      colors: colorList,
      isActive: true,
      serviceSchedule: [
        { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
        { serviceNumber: 2, afterDays: 90, afterKm: 4000 },
        { serviceNumber: 3, afterDays: 180, afterKm: 7000 },
      ],
    };

    InventoryService.addVehicleModel(newModel);
    setModels(InventoryService.getModels());
    setIsAdding(false);
    toast.success(`Vehicle Model ${newModel.modelName} created in master registry!`);
    onRefresh?.();
  };

  // ==================== DEDICATED FULL-PAGE VEHICLE DETAILS VIEW ====================
  if (selectedModelForDetails) {
    const purchase = selectedModelForDetails.purchaseRate || 0;
    const sales = selectedModelForDetails.salesRate || 0;
    const margin = sales - purchase;
    const marginPercent = purchase > 0 ? ((margin / purchase) * 100).toFixed(1) : "0.0";

    return (
      <div className="space-y-3 animate-fadeIn pb-6">
        {/* ROW 1: Master Header & Navigation Bar */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSelectedModelForDetails(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Bike className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {selectedModelForDetails.modelName}
                </h1>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold text-[11px] tracking-wide">
                  {selectedModelForDetails.modelCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                  {selectedModelForDetails.vehicleType}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded uppercase hidden sm:inline">
                  Active Master Catalog
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                <span>Official ID: <strong className="text-slate-700 font-mono">{selectedModelForDetails.modelId}</strong></span>
                <span>•</span>
                <span>HSN: <strong className="text-slate-700 font-mono">{selectedModelForDetails.hsnCode}</strong></span>
                <span>•</span>
                <span>Tax Class: <strong className="text-slate-700">{selectedModelForDetails.taxClassId || "GST001"} (28% GST)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            <div className="hidden lg:flex items-center gap-3 pr-3 border-r border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Showroom Baseline</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">₹{sales.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-l border-slate-100 pl-3">
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Gross Margin</span>
                <span className="font-mono font-bold text-blue-700 text-sm">₹{margin.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-2xs"
              title="Print Specification Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Spec Sheet</span>
            </button>
            <button
              onClick={() => setSelectedModelForDetails(null)}
              className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              <span>Back to List</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Commercial & Pricing Matrix (Row of 4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Purchase Rate (Ex-Factory)
            </span>
            <div className="text-lg font-mono font-black text-slate-900 mt-0.5">
              ₹{purchase.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              India Yamaha factory invoice baseline
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Standard Sales Rate (Ex-Showroom)
            </span>
            <div className="text-lg font-mono font-black text-emerald-600 mt-0.5">
              ₹{sales.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
              Dealership customer billing price
            </span>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Dealership Gross Margin / Spread
            </span>
            <div className="text-lg font-mono font-black text-blue-700 mt-0.5">
              ₹{margin.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-blue-700 font-bold block mt-0.5">
              +{marginPercent}% dealer unit markup
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Live Dealership Stock
            </span>
            <div className="text-lg font-mono font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>{stockStats.total} Units</span>
              <span className="text-xs font-semibold text-emerald-600">({stockStats.available} Yard)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {stockStats.inTransit} Transit • {stockStats.sold + stockStats.reserved} Sold/Reserved
            </span>
          </div>
        </div>

        {/* ROW 3: Factory Technical Specs & Equipment Strip (Section 3.11 & 4 Summary) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider shrink-0">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Factory Equipment:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-slate-500" />
              <span>Wheel: <strong>Alloy Wheels (Tubeless)</strong></span>
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Brake: <strong>Front Disc (UBS)</strong></span>
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>AutoStart: <strong>SMG Smart Motor Generator</strong></span>
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-blue-600" />
              <span>Battery: <strong>Exide 12V 5.0Ah MF</strong></span>
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>Keys: <strong>Dual Shutter Keys (KY-901)</strong></span>
            </span>

            <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
              <span>Yard Bay: <strong>YARD-A1 (PDI Bay)</strong></span>
            </span>
          </div>
        </div>

        {/* ROW 4: Interactive Tabs Switcher Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveDetailTab("units")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDetailTab === "units"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Physical Units in Stock</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                activeDetailTab === "units" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {modelVehicles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab("specs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDetailTab === "specs"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical & Equipment Specs</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                activeDetailTab === "specs" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              10 Specs
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab("colors")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDetailTab === "colors"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Available Color Variants</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                activeDetailTab === "colors" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {selectedModelForDetails.colors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab("service")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDetailTab === "service"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Free Service Schedule</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                activeDetailTab === "service" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {selectedModelForDetails.serviceSchedule?.length || 3}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab("ledger")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDetailTab === "ledger"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Supply Chain & Purchase Ledger</span>
          </button>
        </div>

        {/* ==================== TAB 1: PHYSICAL VEHICLE UNITS TABLE ==================== */}
        {activeDetailTab === "units" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "All Units", value: "ALL", count: stockStats.total },
                  { label: "Available in Yard", value: "AVAILABLE", count: stockStats.available },
                  { label: "Transit", value: "IN_TRANSIT", count: stockStats.inTransit },
                  { label: "Sold / Invoiced", value: "SOLD", count: stockStats.sold },
                  { label: "Reserved", value: "RESERVED", count: stockStats.reserved },
                ].map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setUnitStatusFilter(pill.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      unitStatusFilter === pill.value
                        ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white rounded-md border border-slate-200">
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  placeholder="Search Chassis, Engine, Key, Bin..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                />
                {unitSearch && (
                  <button
                    onClick={() => setUnitSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Units Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center">Chassis (VIN / Frame)</th>
                    <th className="py-3 px-3 text-center">Engine Serial</th>
                    <th className="py-3 px-3 text-center">Color Shade</th>
                    <th className="py-3 px-3 text-center">Key & Battery</th>
                    <th className="py-3 px-3 text-center">Wheel & Brake</th>
                    <th className="py-3 px-3 text-center">Storage Bay / Bin</th>
                    <th className="py-3 px-3 text-center">Inward Voucher</th>
                    <th className="py-3 px-3 text-center">Vehicle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnits.length > 0 ? (
                    filteredUnits.map((u) => {
                      const isAvail = u.status === "AVAILABLE";
                      const isSold = u.status === "SOLD" || u.status === "DELIVERED";
                      const isTransit = u.status === "IN_TRANSIT" || u.status === "TRANSFER_PENDING";
                      const isReserved = u.status === "RESERVED";

                      return (
                        <tr key={u.vehicleId} className="hover:bg-blue-50/30 transition-colors">
                          {/* Chassis Number */}
                          <td className="py-3 px-3 whitespace-nowrap text-center font-mono">
                            <div className="font-bold text-slate-900 text-xs">{u.chassisNumber}</div>
                            <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-700 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Normalized VIN</span>
                            </div>
                          </td>

                          {/* Engine Number */}
                          <td className="py-3 px-3 whitespace-nowrap text-center font-mono font-semibold text-slate-700">
                            {u.engineNumber}
                          </td>

                          {/* Color */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: u.colorCode || "#2563EB" }}
                              />
                              <span className="font-bold text-slate-800 text-[11px]">{u.colorName}</span>
                            </div>
                          </td>

                          {/* Key & Battery */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="font-mono font-semibold text-slate-800 text-[11px]">
                              Key: {u.keyNumber || "KY-901"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {u.batteryNumber || "BAT-EX-101"} ({u.batteryMake || "Exide"})
                            </div>
                          </td>

                          {/* Wheel & Brake */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="font-bold text-slate-800 text-[11px]">
                              {u.wheelType || "ALLOY"} • {u.disk ? "Front Disc" : "Drum"}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                              {u.autoStart ? "SMG AutoStart" : "Electric Start"}
                            </div>
                          </td>

                          {/* Storage Bay */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold rounded-md text-[11px]">
                              {u.binCode || "YARD-A1"}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px] mx-auto">
                              {u.locationName || "Yard A (PDI)"}
                            </div>
                          </td>

                          {/* Purchase Voucher */}
                          <td className="py-3 px-3 whitespace-nowrap text-center font-mono">
                            <div className="text-slate-800 font-semibold text-[11px]">{u.purchaseId || "PUR-101"}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.supplierInvoiceNo || "INV-YAM-2026-9921"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            {isAvail && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>AVAILABLE</span>
                              </span>
                            )}
                            {isSold && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span>SOLD</span>
                                </span>
                                {u.customerName && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {u.customerName} ({u.salesInvoiceId || "SAL-501"})
                                  </div>
                                )}
                              </div>
                            )}
                            {isTransit && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>IN-TRANSIT</span>
                              </span>
                            )}
                            {isReserved && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                  <span>RESERVED</span>
                                </span>
                                {u.customerName && (
                                  <div className="text-[10px] text-purple-600 mt-0.5">{u.customerName}</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                        <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div>No physical units match the selected status / search filter.</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Try selecting &apos;All Units&apos; or clearing your search.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Showing {filteredUnits.length} of {modelVehicles.length} physical units registered under{" "}
                <strong>{selectedModelForDetails.modelName}</strong>
              </span>
              <span className="font-mono text-slate-400">
                Primary Dealership: Tirupattur Main Showroom (HQ)
              </span>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: TECHNICAL & EQUIPMENT SPECS ==================== */}
        {activeDetailTab === "specs" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Spec 1: 17-Digit Chassis & VIN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>1. 17-Digit Chassis (VIN / Frame)</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  ISO 3779 Normalized Standard
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Strictly 17 alphanumeric uppercase characters. Guarded against duplicates via Firestore collection{" "}
                  <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px]">
                    vehicleIdentifiers/{`{normalizedIdentifier}`}
                  </code>.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Sample VIN:</span>
                  <span className="font-mono font-bold text-slate-800">ME1RG431000101</span>
                </div>
              </div>

              {/* Spec 2: Engine Identification */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>2. Engine Number Registry</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Yamaha Blue Core Fi Engine
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Air-cooled, 4-stroke, SOHC, 2-valve single cylinder engine with Fuel Injection (Fi) and smart sensor array. Normalized in system registry.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Sample Engine:</span>
                  <span className="font-mono font-bold text-slate-800">EN1RG431000101</span>
                </div>
              </div>

              {/* Spec 3: Wheel & Rim Type */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Disc className="w-4 h-4 text-amber-600" />
                  <span>3. Wheel & Rim Configuration</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Cast Alloy Wheels (Tubeless)
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  High-rigidity lightweight die-cast alloy wheels with tubeless commuter tyres (Front: 90/90-12, Rear: 110/90-10) for maximum stability.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">wheelType Field:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ALLOY</span>
                </div>
              </div>

              {/* Spec 4: Braking System (Disc/Drum) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>4. Braking System (Disc / Drum)</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Front Disc with Unified Braking (UBS)
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Front 190mm hydraulic disc brake with rear mechanical drum brake. Equipped with Yamaha Unified Braking System (UBS) for synchronized stopping.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">disk Field:</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Front Disc (UBS)</span>
                </div>
              </div>

              {/* Spec 5: AutoStart (Smart Motor Generator) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>5. AutoStart / SMG System</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Smart Motor Generator (SMG)
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  One-touch silent start system where the generator acts as an electric starter motor. Eliminates gear engagement noise and powers Auto Stop & Start (SSS).
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">autoStart Field:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">true (Enabled)</span>
                </div>
              </div>

              {/* Spec 6: Starter Battery (Primary) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Battery className="w-4 h-4 text-blue-600" />
                  <span>6. Primary Starter Battery</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Exide / Amaron 12V 5.0Ah MF
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Maintenance-Free VRLA battery individually registered by serial number upon factory inward inspection with 18 months dealer warranty tracking.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">batteryNumber / Make:</span>
                  <span className="font-mono font-bold text-slate-800">BAT-EX-101 (Exide)</span>
                </div>
              </div>

              {/* Spec 7: Secondary / Aux Battery */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Battery className="w-4 h-4 text-purple-600" />
                  <span>7. Secondary / Aux Battery Support</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Auxiliary Hybrid Assist Unit
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Secondary battery serial tracking for hybrid power assist / electric assist circuits and instrument cluster telemetry support.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">batteryNumber2:</span>
                  <span className="font-mono font-bold text-slate-800">BAT-AUX-001</span>
                </div>
              </div>

              {/* Spec 8: ECU Controller */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-slate-700" />
                  <span>8. ECU Controller Module</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Electronic Control Unit (MCU)
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Yamaha EFI microprocessor controlling fuel map injection timing, ignition advance, and SMG hybrid electric assist torque curves.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">controllerNumber:</span>
                  <span className="font-mono font-bold text-slate-800">CTRL-YAM-8821</span>
                </div>
              </div>

              {/* Spec 9: Battery Charger */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>9. Battery Charger Unit</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Yamaha OEM Float Charger Module
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Factory authorized regulated float charger module provided for pre-delivery yard maintenance and showroom battery health upkeep.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">chargerNumber:</span>
                  <span className="font-mono font-bold text-slate-800">CHG-YAM-4412</span>
                </div>
              </div>

              {/* Spec 10: Dual Key System */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>10. Dual Master Key Set</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Anti-Theft Shutter Key
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Dual matched master keys with magnetic anti-theft shutter lock mechanism. Operates ignition, under-seat storage, and fuel cap.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">keyNumber:</span>
                  <span className="font-mono font-bold text-slate-800">KY-901 (Pair)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: COLOR VARIANTS CATALOG ==================== */}
        {activeDetailTab === "colors" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Available Color Variants ({selectedModelForDetails.colors.length} Factory Shades)
                </h3>
                <p className="text-xs text-slate-500">
                  Official Yamaha color codes, swatch hex codes, and live stock allocation in yard.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                HSN: {selectedModelForDetails.hsnCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedModelForDetails.colors.map((c) => {
                const colorUnits = modelVehicles.filter(
                  (v) => v.colorName.toLowerCase() === c.colorName.toLowerCase()
                );
                const yardCount = colorUnits.filter((v) => v.status === "AVAILABLE").length;
                const soldCount = colorUnits.filter((v) => v.status === "SOLD").length;

                return (
                  <div
                    key={c.colorId}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full border-2 border-white shadow-xs shrink-0"
                        style={{ backgroundColor: c.colorCode }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{c.colorName}</div>
                        <div className="font-mono text-[10px] text-slate-400 uppercase">{c.colorCode}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-200/80">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">In Yard</span>
                        <span className="text-sm font-mono font-black text-emerald-600">{yardCount}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Sold</span>
                        <span className="text-sm font-mono font-black text-blue-600">{soldCount}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono text-center">
                      Color ID: <strong>{c.colorId}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: FREE SERVICE SCHEDULE ==================== */}
        {activeDetailTab === "service" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Authorized Yamaha Free Service Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Dealer warranty maintenance intervals and periodic inspection guidelines.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                Official Warranty Policy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {(selectedModelForDetails.serviceSchedule || [
                { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
                { serviceNumber: 2, afterDays: 90, afterKm: 4000 },
                { serviceNumber: 3, afterDays: 180, afterKm: 7000 },
              ]).map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <span className="font-black text-blue-900 text-sm">Service Coupon #{s.serviceNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md">
                      Free Labor
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">Time Interval:</span>
                      <strong className="font-mono text-slate-900">{s.afterDays} Days from Sale</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">Odometer Distance:</span>
                      <strong className="font-mono text-emerald-700">{s.afterKm.toLocaleString("en-IN")} KM</strong>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
                    {idx === 0 && "First safety inspection, engine oil & filter change, idle speed check & chain lube."}
                    {idx === 1 && "Engine tuning, brake play inspection, valve clearance check, and electrical testing."}
                    {idx >= 2 && "General service, spark plug cleaning, air cleaner element, and battery health diagnosis."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: SUPPLY CHAIN & PURCHASE LEDGER ==================== */}
        {activeDetailTab === "ledger" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Supply Chain & Purchase Ledger Linkage
                </h3>
                <p className="text-xs text-slate-500">
                  Inward purchase voucher, factory supplier details, and audit trail.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Voucher: PUR-101 (POSTED)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">OEM Supplier</span>
                <strong className="font-bold text-slate-900 block mt-0.5">India Yamaha Motor Pvt. Ltd.</strong>
                <span className="text-[10px] font-mono text-slate-400">Supplier ID: SUP001</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Supplier Factory Invoice</span>
                <strong className="font-mono font-bold text-slate-900 block mt-0.5">INV-YAM-2026-9921</strong>
                <span className="text-[10px] text-slate-400">Date: 15-Oct-2026</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Statutory GST Class</span>
                <strong className="font-mono font-bold text-slate-900 block mt-0.5">HSN 8711 (GST001)</strong>
                <span className="text-[10px] text-slate-400">28% GST (14% CGST + 14% SGST)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Receiving Yard</span>
                <strong className="font-bold text-slate-900 block mt-0.5">Tirupattur Main Yard A</strong>
                <span className="text-[10px] text-slate-400">Bay: YARD-A1 (LOC002)</span>
              </div>
            </div>

            {/* Inward Movement History */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stock Movements History (Audit Trail)
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Movement ID</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                      <th className="py-2.5 px-3 text-center">Reference Voucher</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-center">Destination Yard</th>
                      <th className="py-2.5 px-3 text-center">Audited By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-center">MOV-001</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                          PURCHASE INWARD
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 text-center">PUR-101</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 text-center">+4 Units</td>
                      <td className="py-2.5 px-3 text-slate-600 text-center">Yard A (New Arrivals & PDI)</td>
                      <td className="py-2.5 px-3 text-slate-500 text-center">Inventory Manager</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-center">MOV-003</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                          RETAIL SALE
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 text-center">SAL-501</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600 text-center">-1 Unit</td>
                      <td className="py-2.5 px-3 text-slate-600 text-center">Customer Handover (R. Anitha)</td>
                      <td className="py-2.5 px-3 text-slate-500 text-center">Sales Executive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Micro Footer */}
        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official MMC Yamaha Dealership Identity • Maruthi Motors Yamaha Tirupattur</span>
          </div>
          <button
            onClick={() => setSelectedModelForDetails(null)}
            className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
          >
            ← Back to Models List
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN MODEL MASTERS LIST / GRID DASHBOARD ====================
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vehicle Model Masters Dashboard</h1>
            <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200/60">
              Stage 2 Catalog Configuration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
          {/* List / Grid View Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 ${
              isAdding
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? "Cancel" : "Add New Vehicle Model"}</span>
          </button>
        </div>
      </div>

      {/* Add Model Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
            <Bike className="w-4 h-4 text-blue-600" />
            <span>Configure New Yamaha Model Master</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Vehicle Model Name:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. FZ-X Hybrid"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Factory Model Code:</label>
              <input
                type="text"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. B891"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Category / Displacement:</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              >
                <option value="SCOOTER">Scooter (125cc Fi)</option>
                <option value="FZ SERIES">FZ Series (150cc)</option>
                <option value="SPORTS - 155 CC">Sports (155cc)</option>
                <option value="RACING - 150CC">Racing SuperSport</option>
                <option value="ELECTRIC">Yamaha EV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Dealer Purchase Rate (₹):</label>
              <input
                type="number"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Standard Sales Rate (₹):</label>
              <input
                type="number"
                value={salesRate}
                onChange={(e) => setSalesRate(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          {/* Color list config */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 block">Color Variants:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Color Name (e.g. Matte Titan)"
                className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl p-2"
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-9 p-0.5 border border-slate-300 rounded-xl cursor-pointer"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-xs font-bold rounded-xl"
              >
                Add Color
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {colorList.map((c, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.colorCode }} />
                  <span>{c.colorName}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveModel}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Model to Master Catalog
            </button>
          </div>
        </div>
      )}

      {/* Sleek Compact Model Masters Filtration Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Model Name, Model Code (e.g. DG51, B3P1), or HSN..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {modelSearch && (
              <button
                type="button"
                onClick={() => setModelSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Chips & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === "ALL"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Models ({models.length})
            </button>
            {categoriesList.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(active ? "ALL" : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}{" "}
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-white text-slate-500 font-bold"
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {(modelSearch || categoryFilter !== "ALL") && (
            <button
              type="button"
              onClick={handleResetModelFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Model Catalog Grid / List View */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          {paginatedModels.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <Bike className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">No vehicle models match your filters</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or category filters.
              </p>
              <button
                type="button"
                onClick={handleResetModelFilters}
                className="mt-3 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedModels.map((m) => (
                <div
                  key={m.modelId}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">{m.modelName}</h3>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-1">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60 font-bold">
                            {m.modelCode}
                          </span>
                          <span>•</span>
                          <span>HSN: {m.hsnCode}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                        {m.vehicleType}
                      </span>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Purchase Rate</span>
                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                          ₹{m.purchaseRate?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard Sales</span>
                        <div className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                          ₹{m.salesRate?.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Colors with Dropdown */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                      <details className="relative inline-block text-left group flex-1">
                        <summary className="list-none cursor-pointer inline-flex items-center justify-between w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs select-none">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1 items-center">
                              {m.colors.slice(0, 3).map((c) => (
                                <span
                                  key={c.colorId}
                                  className="w-3 h-3 rounded-full border border-white ring-1 ring-slate-200"
                                  style={{ backgroundColor: c.colorCode }}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-medium text-slate-600">{m.colors.length} Available Colors</span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                        </summary>

                        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 space-y-1 animate-fadeIn text-left">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100">
                            Available Color Variants
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1 pt-1">
                            {m.colors.map((c) => (
                              <div
                                key={c.colorId}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                              >
                                <span
                                  className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: c.colorCode }}
                                />
                                <span className="truncate">{c.colorName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>

                      {/* View Details Eye Icon Button */}
                      <button
                        onClick={() => {
                          setSelectedModelForDetails(m);
                          setActiveDetailTab("units");
                        }}
                        className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
                        title="View Vehicle Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View Pagination Footer Card */}
          <div className="bg-white p-3.5 sm:px-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Summary & Rows Selector */}
            <div className="flex items-center gap-4 text-slate-500">
              <span>
                {totalModelItems > 0 ? (
                  <>
                    Showing <span className="font-bold text-slate-800">{modelStartIndex + 1}</span>-
                    <span className="font-bold text-slate-800">{modelEndIndex}</span> of{" "}
                    <span className="font-bold text-slate-800">{totalModelItems}</span> vehicle models
                  </>
                ) : (
                  "No vehicle models found"
                )}
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="text-[11px] text-slate-400 font-semibold">Per page:</span>
                <select
                  value={modelPageSize}
                  onChange={(e) => {
                    setModelPageSize(Number(e.target.value));
                    setModelCurrentPage(1);
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
            {totalModelPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModelCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeModelCurrentPage <= 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalModelPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setModelCurrentPage(pageNum)}
                      className={`w-6.5 h-6.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        safeModelCurrentPage === pageNum
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
                  onClick={() => setModelCurrentPage((p) => Math.min(totalModelPages, p + 1))}
                  disabled={safeModelCurrentPage >= totalModelPages}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-10 font-bold text-slate-500 uppercase">
                    S.No
                  </th>
                  <th className="py-2.5 px-2.5 text-center font-bold text-slate-500 uppercase">
                    Model Name
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    Model Code
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    HSN Code
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    Purchase Rate
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    Standard Sales
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap font-bold text-slate-500 uppercase">
                    Colors
                  </th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-20 font-bold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedModels.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Bike className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-semibold text-slate-600">No vehicle models match your filters</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your search query or category filters.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetModelFilters}
                        className="mt-3 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedModels.map((m, idx) => (
                    <tr
                      key={m.modelId}
                      onClick={() => {
                        setSelectedModelForDetails(m);
                        setActiveDetailTab("units");
                      }}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-2 whitespace-nowrap text-center font-mono font-bold text-slate-500 text-xs">
                        {modelStartIndex + idx + 1}
                      </td>
                      <td className="py-3 px-2.5 font-bold text-slate-900 text-center group-hover:text-blue-600 transition-colors leading-snug">
                        {m.modelName}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        <span className="inline-block bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 font-mono font-bold text-blue-700 text-xs">
                          {m.modelCode}
                        </span>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {m.vehicleType}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 whitespace-nowrap text-center">
                        {m.hsnCode}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-slate-800 whitespace-nowrap text-center">
                        ₹{m.purchaseRate?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-emerald-600 whitespace-nowrap text-center">
                        ₹{m.salesRate?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        {/* Compact Dropdown Menu for Colors */}
                        <details className="relative inline-block text-left group">
                          <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs select-none">
                            <div className="flex -space-x-1 items-center">
                              {m.colors.slice(0, 3).map((c) => (
                                <span
                                  key={c.colorId}
                                  className="w-2.5 h-2.5 rounded-full border border-white ring-1 ring-slate-200"
                                  style={{ backgroundColor: c.colorCode }}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-medium">{m.colors.length} Colors</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                          </summary>

                          <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 space-y-1 animate-fadeIn text-left">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100">
                              Available Color Variants
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1 pt-1">
                              {m.colors.map((c) => (
                                <div
                                  key={c.colorId}
                                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                                >
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: c.colorCode }}
                                  />
                                  <span className="truncate">{c.colorName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedModelForDetails(m);
                            setActiveDetailTab("units");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                          title="View Vehicle Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* List View Pagination Footer */}
          <div className="p-3.5 sm:px-6 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Summary & Rows Selector */}
            <div className="flex items-center gap-4 text-slate-500">
              <span>
                {totalModelItems > 0 ? (
                  <>
                    Showing <span className="font-bold text-slate-800">{modelStartIndex + 1}</span>-
                    <span className="font-bold text-slate-800">{modelEndIndex}</span> of{" "}
                    <span className="font-bold text-slate-800">{totalModelItems}</span> vehicle models
                  </>
                ) : (
                  "No vehicle models found"
                )}
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="text-[11px] text-slate-400 font-semibold">Rows:</span>
                <select
                  value={modelPageSize}
                  onChange={(e) => {
                    setModelPageSize(Number(e.target.value));
                    setModelCurrentPage(1);
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
            {totalModelPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModelCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeModelCurrentPage <= 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalModelPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setModelCurrentPage(pageNum)}
                      className={`w-6.5 h-6.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        safeModelCurrentPage === pageNum
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
                  onClick={() => setModelCurrentPage((p) => Math.min(totalModelPages, p + 1))}
                  disabled={safeModelCurrentPage >= totalModelPages}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs text-xs"
                  title="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
