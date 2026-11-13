
"use client";

import React, { useState, useMemo } from "react";
import {
  PurchaseVoucher,
  VehicleModel,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
  DEFAULT_VEHICLE_MODELS,
} from "@/services/modelCatalog.service";
import { OfficialPurchaseVoucherDocument } from "@/components/inventory/OfficialPurchaseVoucherDocument";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  Printer,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

interface PurchaseVouchersDashboardViewProps {
  selectedBranch: string;
  onRefresh: () => void;
}

interface TempChassisEntry {
  chassisNumber: string;
  engineNumber: string;
  keyNumber: string;
  batteryNumber: string;
  manufacturingDate: string;
}

export const PurchaseVouchersDashboardView: React.FC<PurchaseVouchersDashboardViewProps> = ({
  selectedBranch,
  onRefresh,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PurchaseVoucher | null>(null);

  // Load existing purchase vouchers
  const vouchers = useMemo(() => {
    return InventoryService.getPurchaseVouchers(selectedBranch);
  }, [selectedBranch, isCreating]);

  // Form states
  const [branchId, setBranchId] = useState(
    selectedBranch !== "ALL" ? selectedBranch : DEFAULT_BRANCHES[0].branchId
  );
  const [locationId, setLocationId] = useState(DEFAULT_LOCATIONS[1].locationId);
  const [binId, setBinId] = useState(DEFAULT_STORAGE_BINS[0].binId);
  const [voucherNo, setVoucherNo] = useState(`PV-${Date.now().toString().slice(-6)}`);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(`YMH-INV-${Date.now().toString().slice(-4)}`);

  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_VEHICLE_MODELS[0].modelId);
  const [selectedColorId, setSelectedColorId] = useState<string>(DEFAULT_VEHICLE_MODELS[0].colors[0].colorId);
  const [purchaseRate, setPurchaseRate] = useState<number>(DEFAULT_VEHICLE_MODELS[0].purchaseRate);

  const [chassisList, setChassisList] = useState<TempChassisEntry[]>([
    {
      chassisNumber: `ME1RG431000${Math.floor(200 + Math.random() * 800)}`,
      engineNumber: `EN1RG431000${Math.floor(200 + Math.random() * 800)}`,
      keyNumber: `KY-${Math.floor(100 + Math.random() * 900)}`,
      batteryNumber: `BAT-EX-${Math.floor(100 + Math.random() * 900)}`,
      manufacturingDate: new Date().toISOString().split("T")[0],
    },
  ]);

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

    const { voucher } = InventoryService.commitBulkImport(session, location.locationId, bin.binId, branch.branchId);
    if (voucher) {
      setSelectedVoucher(voucher);
    }
    toast.success(`Purchase Voucher ${voucherNo} posted! ${chassisList.length} units added to live stock.`);
    setIsCreating(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* If a voucher is selected, show the official voucher document directly on the dashboard */}
      {selectedVoucher ? (
        <OfficialPurchaseVoucherDocument
          voucher={selectedVoucher}
          onBack={() => setSelectedVoucher(null)}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Purchase Vouchers Dashboard</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official vehicle inward registry & commercial procurement vouchers
              </p>
            </div>

            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? "View Vouchers List" : "Create Purchase Voucher"}</span>
            </button>
          </div>

          {/* Voucher Creation Workspace */}
          {isCreating ? (
            <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">New Purchase Voucher & Chassis Entry</h3>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Voucher Number:</label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Supplier Invoice Number:</label>
                  <input
                    type="text"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Destination Branch:</label>
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
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Yard Bay Allocation:</label>
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

              {/* Line Item Model Config */}
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
                  <label className="text-[11px] font-bold text-blue-900 block mb-1">Dealer Purchase Rate (₹):</label>
                  <input
                    type="number"
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Chassis & Engine Details Grid (Fusil Popup Equivalent) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Chassis & Engine Number Registry Grid ({chassisList.length} Units)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Individual physical identifiers are saved to the <span className="font-mono text-blue-700">vehicles</span> collection with automated uniqueness locks.
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

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
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

              {/* Action Row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-600">
                  Total Inward Value: <span className="font-bold text-slate-900">₹{(purchaseRate * chassisList.length).toLocaleString("en-IN")}</span> ({chassisList.length} units)
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVoucher}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/30 transition-all"
                  >
                    Post Purchase Voucher & Inward Stock
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Existing Vouchers List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Registered Purchase Vouchers ({vouchers.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Official Inward Vouchers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Supplier & Invoice</th>
                    <th className="py-3 px-4">Branch / Yard</th>
                    <th className="py-3 px-4">Total Units</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.map((v) => (
                    <tr key={v.purchaseId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {v.voucherNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{v.supplierName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{v.supplierInvoiceNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{v.branchName || "Main Showroom"}</div>
                        <div className="text-[10px] font-mono text-blue-600">{v.binCode || "YARD-A1"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {v.totalQuantity} Units
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{v.grandTotal?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {v.createdAt ? v.createdAt.split("T")[0] : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedVoucher(v)}
                            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-xl border border-blue-200 hover:border-blue-600 transition-all shadow-2xs cursor-pointer whitespace-nowrap group"
                            title="View Official Voucher in Dashboard"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
                            <span>View Voucher</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

