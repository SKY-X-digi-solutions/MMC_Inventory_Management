"use client";

import React, { useState } from "react";
import { VehicleModel, ColorVariant } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { Plus, Bike, Check, Sparkles, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface ModelMastersDashboardViewProps {
  onRefresh?: () => void;
}

export const ModelMastersDashboardView: React.FC<ModelMastersDashboardViewProps> = ({
  onRefresh,
}) => {
  const [models, setModels] = useState<VehicleModel[]>(InventoryService.getModels());
  const [isAdding, setIsAdding] = useState(false);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Vehicle Model Masters Dashboard</h1>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Cancel Form" : "Add New Vehicle Model"}</span>
        </button>
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

      {/* Model Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => (
          <div
            key={m.modelId}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{m.modelName}</h3>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold text-blue-700">
                    {m.modelCode}
                  </span>
                  <span>•</span>
                  <span>HSN: {m.hsnCode}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                {m.vehicleType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Purchase Rate:</span>
                <div className="font-mono font-bold text-slate-800">
                  ₹{m.purchaseRate?.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Standard Sales:</span>
                <div className="font-mono font-bold text-emerald-700">
                  ₹{m.salesRate?.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Available Colors ({m.colors.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {m.colors.map((c) => (
                  <span
                    key={c.colorId}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c.colorCode }}
                    />
                    <span>{c.colorName}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

