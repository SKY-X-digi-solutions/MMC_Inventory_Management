"use client";

import React, { useState, useMemo, useEffect } from "react";
import { StockImportSession, PurchaseVoucher } from "@/types/inventory";
import { ImportParserService } from "@/services/importParser.service";
import { InventoryService } from "@/services/inventory.service";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
} from "@/services/modelCatalog.service";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { OfficialPurchaseVoucherDocument } from "@/components/inventory/OfficialPurchaseVoucherDocument";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  History,
} from "lucide-react";
import toast from "react-hot-toast";

interface InwardDashboardViewProps {
  selectedBranch: string;
  onRefresh: () => void;
}

export const InwardDashboardView: React.FC<InwardDashboardViewProps> = ({
  selectedBranch,
  onRefresh,
}) => {
  const [branchId, setBranchId] = useState(
    selectedBranch !== "ALL" ? selectedBranch : DEFAULT_BRANCHES[0].branchId
  );
  const [locationId, setLocationId] = useState(DEFAULT_LOCATIONS[0].locationId); // Yard A
  const [binId, setBinId] = useState(DEFAULT_STORAGE_BINS[0].binId); // YARD-A1
  const [invoiceNo, setInvoiceNo] = useState(`YMH-INV-${Date.now().toString().slice(-5)}`);
  const [session, setSession] = useState<StockImportSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<PurchaseVoucher | null>(null);
  const [showVoucherDocument, setShowVoucherDocument] = useState(false);

  // Sync selected branch if changed from outside
  useEffect(() => {
    if (selectedBranch !== "ALL" && selectedBranch !== branchId) {
      handleBranchChange(selectedBranch);
    }
  }, [selectedBranch]);

  const handleBranchChange = (newBranchId: string) => {
    setBranchId(newBranchId);
    const branchLocs = DEFAULT_LOCATIONS.filter((l) => l.branchId === newBranchId);
    if (branchLocs.length > 0) {
      const firstLoc = branchLocs[0];
      setLocationId(firstLoc.locationId);
      const locBins = DEFAULT_STORAGE_BINS.filter((b) => b.locationId === firstLoc.locationId);
      if (locBins.length > 0) {
        setBinId(locBins[0].binId);
      }
    }
  };

  const handleLocationChange = (newLocId: string) => {
    setLocationId(newLocId);
    const locBins = DEFAULT_STORAGE_BINS.filter((b) => b.locationId === newLocId);
    if (locBins.length > 0) {
      setBinId(locBins[0].binId);
    }
  };

  const branchOptions = useMemo(() => {
    return DEFAULT_BRANCHES.map((b) => ({
      value: b.branchId,
      label: b.branchName,
    }));
  }, []);

  const locationOptions = useMemo(() => {
    return DEFAULT_LOCATIONS.filter((l) => l.branchId === branchId).map((l) => ({
      value: l.locationId,
      label: l.locationName,
    }));
  }, [branchId]);

  const binOptions = useMemo(() => {
    return DEFAULT_STORAGE_BINS.filter((b) => b.locationId === locationId).map((b) => ({
      value: b.binId,
      label: `${b.binCode} • ${b.binName.replace(/Yard [A-Z] - /, "")}`,
    }));
  }, [locationId]);

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
      const { addedCount, deductedCount, voucher } = InventoryService.commitBulkImport(
        session,
        locationId,
        binId,
        branchId
      );

      // Automatically display the official purchase voucher directly on the dashboard
      if (voucher) {
        setActiveVoucher(voucher);
        setShowVoucherDocument(true);
      }

      toast.success(
        `Successfully registered ${addedCount} vehicles to stock! Official Voucher ${voucher?.voucherNumber || ""} generated.`,
        { duration: 6000 }
      );
      setSession(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to commit inventory");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* If voucher view is active, render the official document inline directly on the dashboard */}
      {showVoucherDocument && activeVoucher ? (
        <OfficialPurchaseVoucherDocument
          voucher={activeVoucher}
          onBack={() => setShowVoucherDocument(false)}
        />
      ) : (
        <>
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Bulk Inward Invoices & Staging Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify chassis and inward Yamaha factory dispatches directly to yard inventory
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeVoucher && (
                <button
                  type="button"
                  onClick={() => setShowVoucherDocument(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                  title="View Official Purchase Voucher Document"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Voucher ({activeVoucher.voucherNumber})</span>
                </button>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Yamaha Factory Inward</span>
              </span>
            </div>
          </div>

      {/* Target Showroom & Bay Configuration Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
                Inward Receiving Parameters
              </h2>
              <span className="text-[10px] text-slate-400">
                Specify destination branch, PDI yard bay, and factory invoice for this shipment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
          {/* 1. Target Branch */}
          <CustomDropdown
            label="Target Showroom / Branch"
            value={branchId}
            onChange={handleBranchChange}
            options={branchOptions}
            placeholder="Select Branch"
          />

          {/* 2. Receiving Yard Location */}
          <CustomDropdown
            label="Receiving Yard Location"
            value={locationId}
            onChange={handleLocationChange}
            options={locationOptions}
            placeholder="Select Yard Location"
          />

          {/* 3. Storage Bay */}
          <CustomDropdown
            label="Storage Bay"
            value={binId}
            onChange={(val) => setBinId(val)}
            options={binOptions}
            placeholder="Select Storage Bay"
          />

          {/* 4. Yamaha Invoice Number */}
          <div className="w-full">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Yamaha Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="e.g. YMH-INV-17967"
              className="w-full h-9.5 px-3 bg-white rounded-xl border border-slate-300 hover:border-slate-400 focus:border-slate-900 text-xs font-bold font-mono text-blue-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Upload Zone & Parser Workspace */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {!session ? (
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 text-center bg-slate-50/50 transition-colors">
            <FileSpreadsheet className="w-14 h-14 mx-auto text-blue-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Drag and drop your Yamaha Factory Dispatch Sheet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
              Auto-detects columns: Chassis Number (VIN), Engine Number, Model Name, Color, Key No, Battery No, and Mfg Date.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs shadow-blue-600/20 transition-all flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV / Excel File</span>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Load Sample Yamaha Dispatch Load (1-Click Test)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Rows In File</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{session.totalRows}</div>
                <span className="text-[10px] text-slate-400 truncate block mt-0.5">{session.fileName}</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Valid to Inward</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{session.validRows}</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Ready to Push into Live Stock</span>
              </div>

              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Duplicates Deducted</span>
                <div className="text-2xl font-black text-red-600 mt-1">{session.duplicateRows}</div>
                <span className="text-[10px] text-red-700 font-semibold">Auto-Excluded (Zero Risk)</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center gap-2">
                <button
                  onClick={() => setSession(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
                >
                  Clear / Upload Different File
                </button>
              </div>
            </div>

            {/* Client Requirement Highlight */}
            {session.duplicateRows > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold">Client Usability Requirement Enforced:</span> {session.duplicateRows} duplicate chassis number(s) were identified and automatically deducted from the registration count.
                </div>
              </div>
            )}

            {/* Staging Data Grid */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-3 px-3">Row</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Chassis No (VIN)</th>
                    <th className="py-3 px-3">Model</th>
                    <th className="py-3 px-3">Color</th>
                    <th className="py-3 px-3">Engine No</th>
                    <th className="py-3 px-3">Key / Battery</th>
                    <th className="py-3 px-3">Reason / Flag</th>
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
                      <td className="py-2.5 px-3 font-bold">{r.rowNumber}</td>
                      <td className="py-2.5 px-3">
                        {r.isValid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            VALID
                          </span>
                        ) : r.isDuplicate ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            DUPLICATE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            ERROR
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-900">{r.chassisNumber}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold">{r.modelName}</td>
                      <td className="py-2.5 px-3 font-sans">{r.color}</td>
                      <td className="py-2.5 px-3 text-slate-500">{r.engineNumber}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">
                        {r.keyNumber || "KY-01"} • {r.batteryNumber || "EXIDE"}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs">
                        {r.duplicateReason || r.validationError || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-600">
                Ready to commit: <span className="font-bold text-slate-900">{session.validRows} vehicles</span> into {branchId}.
              </span>

              <button
                onClick={handleCommit}
                disabled={isProcessing || session.validRows === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Confirm & Inward {session.validRows} Vehicles to Stock</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

