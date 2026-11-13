"use client";

import React, { useState } from "react";
import {
  VehicleModel,
  ColorVariant,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
  DEFAULT_VEHICLE_MODELS,
} from "@/services/modelCatalog.service";
import { X, Plus, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface PurchaseVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBranchId: string;
}

interface TempChassisEntry {
  chassisNumber: string;
  engineNumber: string;
  keyNumber: string;
  batteryNumber: string;
  manufacturingDate: string;
}

export const PurchaseVoucherModal: React.FC<PurchaseVoucherModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultBranchId,
}) => {
  const [branchId, setBranchId] = useState(
    defaultBranchId !== "ALL" ? defaultBranchId : DEFAULT_BRANCHES[0].branchId
  );
  const [locationId, setLocationId] = useState(DEFAULT_LOCATIONS[1].locationId);
  const [binId, setBinId] = useState(DEFAULT_STORAGE_BINS[0].binId);
  const [voucherNo, setVoucherNo] = useState(`PV-${Date.now().toString().slice(-6)}`);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(`YMH-INV-${Date.now().toString().slice(-4)}`);

  // Selected Model & Color for voucher line item
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_VEHICLE_MODELS[0].modelId);
  const [selectedColorId, setSelectedColorId] = useState<string>(DEFAULT_VEHICLE_MODELS[0].colors[0].colorId);
  const [purchaseRate, setPurchaseRate] = useState<number>(DEFAULT_VEHICLE_MODELS[0].purchaseRate);

  // Chassis entries grid
  const [chassisList, setChassisList] = useState<TempChassisEntry[]>([
    {
      chassisNumber: `ME1RG431000${Math.floor(200 + Math.random() * 800)}`,
      engineNumber: `EN1RG431000${Math.floor(200 + Math.random() * 800)}`,
      keyNumber: `KY-${Math.floor(100 + Math.random() * 900)}`,
      batteryNumber: `BAT-EX-${Math.floor(100 + Math.random() * 900)}`,
      manufacturingDate: new Date().toISOString().split("T")[0],
    },
  ]);

  if (!isOpen) return null;

  const currentModel = DEFAULT_VEHICLE_MODELS.find((m) => m.modelId === selectedModelId) || DEFAULT_VEHICLE_MODELS[0];

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = DEFAULT_VEHICLE_MODELS.find((mod) => mod.modelId === modelId);
    if (m) {
      setSelectedColorId(m.colors[0]?.colorId || "");
      setPurchaseRate(m.purchaseRate);
    }
  };

  const handleAddChassisRow = () => {
    setChassisList([
      ...chassisList,
      {
        chassisNumber: `ME1RG431000${Math.floor(200 + Math.random() * 800)}`,
        engineNumber: `EN1RG431000${Math.floor(200 + Math.random() * 800)}`,
        keyNumber: `KY-${Math.floor(100 + Math.random() * 900)}`,
        batteryNumber: `BAT-EX-${Math.floor(100 + Math.random() * 900)}`,
        manufacturingDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (chassisList.length <= 1) {
      toast.error("At least one vehicle entry is required.");
      return;
    }
    setChassisList(chassisList.filter((_, i) => i !== index));
  };

  const handleSaveVoucher = () => {
    const existingChassis = InventoryService.getExistingChassisSet();

    // Validate chassis list
    for (const c of chassisList) {
      if (!c.chassisNumber.trim()) {
        toast.error("All chassis numbers must be filled.");
        return;
      }
      if (existingChassis.has(c.chassisNumber.toUpperCase().trim())) {
        toast.error(`Chassis number ${c.chassisNumber} already exists in inventory!`);
        return;
      }
    }

    const branch = DEFAULT_BRANCHES.find((b) => b.branchId === branchId) || DEFAULT_BRANCHES[0];
    const location = DEFAULT_LOCATIONS.find((l) => l.locationId === locationId) || DEFAULT_LOCATIONS[1];
    const bin = DEFAULT_STORAGE_BINS.find((b) => b.binId === binId) || DEFAULT_STORAGE_BINS[0];
    const color = currentModel.colors.find((c) => c.colorId === selectedColorId) || currentModel.colors[0];

    // Convert into import session to reuse the validated atomic commit logic
    const session = {
      importId: voucherNo,
      fileName: `Manual_Voucher_${voucherNo}`,
      supplierInvoiceNo,
      branchId,
      totalRows: chassisList.length,
      validRows: chassisList.length,
      duplicateRows: 0,
      invalidRows: 0,
      rows: chassisList.map((c, i) => ({
        rowNumber: i + 1,
        chassisNumber: c.chassisNumber.toUpperCase().trim(),
        engineNumber: c.engineNumber.toUpperCase().trim(),
        modelName: currentModel.modelName,
        modelCode: currentModel.modelCode,
        color: color.colorName,
        keyNumber: c.keyNumber,
        batteryNumber: c.batteryNumber,
        manufacturingDate: c.manufacturingDate,
        purchaseRate,
        isValid: true,
        isDuplicate: false,
      })),
      uploadedAt: new Date().toISOString(),
    };

    InventoryService.commitBulkImport(session, location.locationId, bin.binId, branch.branchId);
    toast.success(`Purchase Voucher ${voucherNo} posted! ${chassisList.length} units added to stock.`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Vehicle Purchase Voucher</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                Dealer Inward
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Record incoming vehicle purchase invoice with individual chassis and engine identification.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Voucher Header Config */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Voucher No:</label>
              <input
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Supplier Invoice No:</label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Branch Destination:</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              >
                {DEFAULT_BRANCHES.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Yard Bay:</label>
              <select
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              >
                {DEFAULT_STORAGE_BINS.map((b) => (
                  <option key={b.binId} value={b.binId}>
                    {b.binCode} ({b.binName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model & Line Item Configuration */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-blue-900 block mb-1">Vehicle Model:</label>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              >
                {DEFAULT_VEHICLE_MODELS.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    {m.modelName} ({m.modelCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-blue-900 block mb-1">Color Variant:</label>
              <select
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              >
                {currentModel.colors.map((c) => (
                  <option key={c.colorId} value={c.colorId}>
                    {c.colorName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-blue-900 block mb-1">Purchase Rate (₹):</label>
              <input
                type="number"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Chassis & Engine Entry Grid (The Fusil Popup equivalent) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chassis & Engine Details Grid ({chassisList.length} Units)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enter unique physical identifiers. Duplicate detection is enforced automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChassisRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle Unit</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Chassis No (Mandatory VIN)</th>
                    <th className="py-2.5 px-3">Engine No (Mandatory)</th>
                    <th className="py-2.5 px-3">Key No</th>
                    <th className="py-2.5 px-3">Battery No</th>
                    <th className="py-2.5 px-3">Mfg Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {chassisList.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.chassisNumber}
                          onChange={(e) => {
                            const updated = [...chassisList];
                            updated[idx].chassisNumber = e.target.value.toUpperCase();
                            setChassisList(updated);
                          }}
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.engineNumber}
                          onChange={(e) => {
                            const updated = [...chassisList];
                            updated[idx].engineNumber = e.target.value.toUpperCase();
                            setChassisList(updated);
                          }}
                          className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-1.5 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.keyNumber}
                          onChange={(e) => {
                            const updated = [...chassisList];
                            updated[idx].keyNumber = e.target.value;
                            setChassisList(updated);
                          }}
                          className="w-24 text-xs font-mono bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.batteryNumber}
                          onChange={(e) => {
                            const updated = [...chassisList];
                            updated[idx].batteryNumber = e.target.value;
                            setChassisList(updated);
                          }}
                          className="w-28 text-xs font-mono bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={row.manufacturingDate}
                          onChange={(e) => {
                            const updated = [...chassisList];
                            updated[idx].manufacturingDate = e.target.value;
                            setChassisList(updated);
                          }}
                          className="text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total Voucher Value: <span className="font-bold text-slate-900">₹{(purchaseRate * chassisList.length).toLocaleString("en-IN")}</span> ({chassisList.length} units)
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVoucher}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/30 transition-all"
            >
              Post Voucher to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

