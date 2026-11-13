"use client";

import React, { useState } from "react";
import {
  StockImportSession,
} from "@/types/inventory";
import { ImportParserService } from "@/services/importParser.service";
import { InventoryService } from "@/services/inventory.service";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
} from "@/services/modelCatalog.service";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

interface InwardUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBranchId: string;
}

export const InwardUploadModal: React.FC<InwardUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultBranchId,
}) => {
  const [branchId, setBranchId] = useState(
    defaultBranchId !== "ALL" ? defaultBranchId : DEFAULT_BRANCHES[0].branchId
  );
  const [locationId, setLocationId] = useState(DEFAULT_LOCATIONS[1].locationId); // Yard A
  const [binId, setBinId] = useState(DEFAULT_STORAGE_BINS[0].binId); // YARD-A1
  const [isOpeningStock, setIsOpeningStock] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState(`YMH-INV-${Date.now().toString().slice(-5)}`);
  const [session, setSession] = useState<StockImportSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleOpeningStock = (val: boolean) => {
    setIsOpeningStock(val);
    setInvoiceNo(val ? "OPENING-STOCK-MMC" : `YMH-INV-${Date.now().toString().slice(-5)}`);
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const existingChassis = InventoryService.getExistingChassisSet();
        const parsed = ImportParserService.parseDispatchSheet(
          content,
          file.name,
          invoiceNo,
          branchId,
          existingChassis
        );
        setSession(parsed);
        toast.success(`Parsed ${parsed.totalRows} rows from ${file.name}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to parse file");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    try {
      const sampleContent = ImportParserService.getSampleYamahaDispatchCSV();
      const existingChassis = InventoryService.getExistingChassisSet();
      const parsed = ImportParserService.parseDispatchSheet(
        sampleContent,
        "YAMAHA_FACTORY_DISPATCH_OCT2026.csv",
        invoiceNo,
        branchId,
        existingChassis
      );
      setSession(parsed);
      toast.success("Loaded sample Yamaha dispatch sheet with pre-configured duplicates for testing!");
    } catch (err: any) {
      toast.error(err.message || "Failed to load sample");
    }
  };

  const handleCommit = () => {
    if (!session) return;
    if (session.validRows === 0) {
      toast.error("No valid vehicles to import. All rows are invalid or duplicates.");
      return;
    }

    setIsProcessing(true);
    try {
      const { addedCount, deductedCount } = InventoryService.commitBulkImport(
        session,
        locationId,
        binId,
        branchId
      );

      toast.success(
        `Successfully registered ${addedCount} vehicles to stock! (${deductedCount} duplicates deducted)`,
        { duration: 5000 }
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to commit inventory");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {isOpeningStock ? "Opening Stock Onboarding" : "Bulk Inward Load Ingestion"}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  {isOpeningStock ? "Existing Showroom Bikes" : "Factory Dispatch File"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isOpeningStock
                  ? "Import already-present showroom bikes into the new system without needing a purchase invoice."
                  : "Directly upload Yamaha factory dispatch sheet with automated duplicate deduction."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-200/80 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => toggleOpeningStock(false)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  !isOpeningStock ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yamaha Invoice
              </button>
              <button
                type="button"
                onClick={() => toggleOpeningStock(true)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  isOpeningStock ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Opening Stock
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Inward Destination & Invoice Config */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Branch:</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {DEFAULT_BRANCHES.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Yard Location:</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {DEFAULT_LOCATIONS.filter((l) => l.branchId === branchId).map((l) => (
                  <option key={l.locationId} value={l.locationId}>
                    {l.locationName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Storage Bay:</label>
              <select
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {DEFAULT_STORAGE_BINS.map((b) => (
                  <option key={b.binId} value={b.binId}>
                    {b.binCode} ({b.binName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Yamaha Invoice Ref:</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="YMH-INV-XXXX"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          {!session ? (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center bg-slate-50/50 transition-colors">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">
                Drag and drop your Yamaha Dispatch Sheet here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Accepts CSV / Excel files with Chassis No, Engine No, Model Name, Color, Key No, Battery No.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs shadow-blue-600/20 transition-all">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <span className="text-xs text-slate-400">or</span>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Load Sample Yamaha Invoice (1-Click Test)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Parse Summary Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Rows</span>
                  <div className="text-xl font-black text-slate-900">{session.totalRows}</div>
                  <span className="text-[10px] text-slate-400 truncate block">{session.fileName}</span>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Valid to Inward</span>
                  <div className="text-xl font-black text-emerald-600">{session.validRows}</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Ready to Push</span>
                </div>

                <div className="bg-red-50 p-3.5 rounded-xl border border-red-200">
                  <span className="text-[10px] font-bold text-red-700 uppercase">Duplicates Deducted</span>
                  <div className="text-xl font-black text-red-600">{session.duplicateRows}</div>
                  <span className="text-[10px] text-red-700 font-semibold">Auto-Excluded</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <button
                    onClick={() => setSession(null)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>

              {/* Duplicate Notice Banner */}
              {session.duplicateRows > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">Client Requirement Met:</span> Duplicate chassis numbers were detected and automatically deducted from the registration count to prevent double stock entry.
                  </div>
                </div>
              )}

              {/* Rows Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Chassis No (VIN)</th>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3">Color</th>
                      <th className="py-2.5 px-3">Engine No</th>
                      <th className="py-2.5 px-3">Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {session.rows.map((r) => (
                      <tr
                        key={r.rowNumber}
                        className={
                          r.isDuplicate
                            ? "bg-red-50/70 text-red-800"
                            : !r.isValid
                            ? "bg-amber-50/70 text-amber-800"
                            : "hover:bg-slate-50 text-slate-800"
                        }
                      >
                        <td className="py-2 px-3 font-bold">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              VALID
                            </span>
                          ) : r.isDuplicate ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800">
                              DUPLICATE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                              ERROR
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold">{r.chassisNumber}</td>
                        <td className="py-2 px-3 font-sans font-semibold">{r.modelName}</td>
                        <td className="py-2 px-3 font-sans">{r.color}</td>
                        <td className="py-2 px-3 text-slate-500">{r.engineNumber}</td>
                        <td className="py-2 px-3 font-sans text-xs">
                          {r.duplicateReason || r.validationError || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>

          {session && (
            <button
              onClick={handleCommit}
              disabled={isProcessing || session.validRows === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/30 transition-all"
            >
              <span>Confirm & Push {session.validRows} Vehicles to Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

