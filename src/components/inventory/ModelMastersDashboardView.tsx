"use client";

import React, { useState } from "react";
import { VehicleModel, ColorVariant } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { Plus, X, Bike, LayoutGrid, List, ChevronDown, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface ModelMastersDashboardViewProps {
  onRefresh?: () => void;
}

export const ModelMastersDashboardView: React.FC<ModelMastersDashboardViewProps> = ({
  onRefresh,
}) => {
  const [models, setModels] = useState<VehicleModel[]>(InventoryService.getModels());
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedModelForDetails, setSelectedModelForDetails] = useState<VehicleModel | null>(null);

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
      ],
    };

    InventoryService.addVehicleModel(newModel);
    setModels(InventoryService.getModels());
    setIsAdding(false);
    toast.success(`Vehicle Model ${newModel.modelName} created in master registry!`);
    onRefresh?.();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vehicle Model Masters Dashboard</h1>
            <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200/60">
              Stage 2 Catalog Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Official Yamaha dealership model codes, pricing rates, statutory GST classes, color variant chips, and service intervals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
          {/* List / Grid View Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "list"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "grid"
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
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 ${isAdding
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

      {/* Model Catalog Grid / List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m) => (
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
                    onClick={() => setSelectedModelForDetails(m)}
                    className="ml-2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors shrink-0"
                    title="View Full Vehicle Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Model Name</th>
                  <th className="py-3.5 px-4">Model Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">HSN Code</th>
                  <th className="py-3.5 px-4">Purchase Rate</th>
                  <th className="py-3.5 px-4">Standard Sales</th>
                  <th className="py-3.5 px-4">Colors</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map((m) => (
                  <tr key={m.modelId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      {m.modelName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 font-mono font-bold text-blue-700">
                        {m.modelCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                        {m.vehicleType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {m.hsnCode}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      ₹{m.purchaseRate?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 whitespace-nowrap">
                      ₹{m.salesRate?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {/* Compact Dropdown Menu for Colors */}
                      <details className="relative inline-block text-left group">
                        <summary className="list-none cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs select-none">
                          <div className="flex -space-x-1 items-center">
                            {m.colors.slice(0, 3).map((c) => (
                              <span
                                key={c.colorId}
                                className="w-3 h-3 rounded-full border border-white ring-1 ring-slate-200"
                                style={{ backgroundColor: c.colorCode }}
                              />
                            ))}
                          </div>
                          <span>{m.colors.length} Colors</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                        </summary>

                        <div className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 space-y-1 animate-fadeIn text-left">
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
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedModelForDetails(m)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                        title="View Full Vehicle Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 text-xs text-slate-500 font-medium px-5">
            Showing {models.length} Yamaha vehicle models in Master Catalog
          </div>
        </div>
      )}

      {/* Full Vehicle Model Detail Modal - Ultra-Compact Fit */}
      {selectedModelForDetails && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedModelForDetails(null)}
          />

          <div className="bg-white w-full max-w-3xl flex flex-col rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden my-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="px-4 py-2.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 uppercase tracking-wider">
                  {selectedModelForDetails.vehicleType}
                </span>
                <h2 className="text-base font-black tracking-tight text-white">{selectedModelForDetails.modelName}</h2>
                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
                  {selectedModelForDetails.modelCode}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">• HSN: {selectedModelForDetails.hsnCode}</span>
              </div>
              <button
                onClick={() => setSelectedModelForDetails(null)}
                className="p-1 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Balanced Compact Dimensions */}
            <div className="p-3.5 space-y-2.5 text-xs text-slate-700">
              {/* Row 1: Pricing & Key Meta Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Purchase Rate (Ex-Factory)
                  </span>
                  <div className="text-base font-mono font-black text-slate-900 mt-0.5">
                    ₹{selectedModelForDetails.purchaseRate?.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Standard Sales Price
                  </span>
                  <div className="text-base font-mono font-black text-emerald-600 mt-0.5">
                    ₹{selectedModelForDetails.salesRate?.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    GST & Statutory Class
                  </span>
                  <span className="font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                    {selectedModelForDetails.taxClassId || "GST001"} (8711)
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    Catalog Status
                  </span>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[9px] mt-0.5 border border-emerald-200">
                      Active Catalog
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Color Variants Full Breakdown */}
              <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Available Color Variants ({selectedModelForDetails.colors.length}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedModelForDetails.colors.map((c) => (
                    <div
                      key={c.colorId}
                      className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.colorCode }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-[10px] truncate">{c.colorName}</div>
                        <div className="font-mono text-[8px] text-slate-400 leading-none">{c.colorCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Dealership Free Service Schedule */}
              {selectedModelForDetails.serviceSchedule && selectedModelForDetails.serviceSchedule.length > 0 && (
                <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Dealership Free Service Schedule:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedModelForDetails.serviceSchedule.map((s, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-blue-100 flex justify-between items-center shadow-2xs">
                        <span className="font-bold text-blue-900 text-[11px]">Service #{s.serviceNumber}</span>
                        <span className="text-slate-600 font-mono text-[10px] font-semibold">
                          {s.afterDays}d / {s.afterKm}km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">Official MMC Yamaha Dealership Identity</span>
              <button
                onClick={() => setSelectedModelForDetails(null)}
                className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};