"use client";

import React, { useState, useMemo } from "react";
import { StockMovement } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { ExportService } from "@/services/export.service";
import { X, History, Download, Search, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface MovementAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MovementAuditModal: React.FC<MovementAuditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const movements = useMemo(() => InventoryService.getMovements(), [isOpen]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return movements;
    const q = searchTerm.trim().toLowerCase();
    return movements.filter(
      (m) =>
        m.chassisNumber.toLowerCase().includes(q) ||
        m.movementType.toLowerCase().includes(q) ||
        (m.referenceId && m.referenceId.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q))
    );
  }, [movements, searchTerm]);

  if (!isOpen) return null;

  const handleExport = () => {
    ExportService.exportMovementLedger(filtered);
    toast.success("Stock movement ledger exported to CSV!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Stock Movement Audit Ledger</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  Append-Only Traceability
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Complete record of every vehicle movement from manufacturer inward receipt to customer delivery.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Chassis No, Movement Type, or Reference ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Ledger (CSV)</span>
          </button>
        </div>

        {/* Ledger Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle w-12 font-bold text-slate-600 uppercase">S.No</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Movement Type</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Chassis No (VIN)</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Movement Path</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Reference Doc</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Operator</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap align-middle">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No matching movement records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, idx) => {
                    const isPurchase = m.movementType === "PURCHASE";
                    const isSale = m.movementType === "SALE";
                    const isTransfer = m.movementType.includes("TRANSFER");

                    return (
                      <tr key={m.movementId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-500 text-xs align-middle">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle">
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPurchase
                                ? "bg-emerald-100 text-emerald-800"
                                : isSale
                                ? "bg-blue-100 text-blue-800"
                                : isTransfer
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-900 align-middle">
                          {m.chassisNumber}
                        </td>
                        <td className="py-2.5 px-3 text-center align-middle font-sans text-xs whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="font-semibold text-slate-700">
                              {m.fromBranchName || "Factory Inward"}
                            </span>
                            <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="font-bold text-slate-800">
                              {m.toBranchName || "Customer Delivery"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle text-blue-700 font-bold">
                          {m.referenceId}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle font-sans text-slate-600">
                          {m.createdBy}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap align-middle text-slate-400">
                          {m.movementDate ? m.movementDate.replace("T", " ").slice(0, 19) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} total events recorded in append-only ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

