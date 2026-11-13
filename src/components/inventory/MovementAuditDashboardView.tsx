"use client";

import React, { useState, useMemo } from "react";
import { StockMovement } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { ExportService } from "@/services/export.service";
import { History, Download, Search, ShieldCheck, Filter } from "lucide-react";
import toast from "react-hot-toast";

export const MovementAuditDashboardView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const movements = useMemo(() => InventoryService.getMovements(), []);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== "ALL" && m.movementType !== typeFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        return (
          m.chassisNumber.toLowerCase().includes(q) ||
          m.movementType.toLowerCase().includes(q) ||
          (m.referenceId && m.referenceId.toLowerCase().includes(q)) ||
          (m.notes && m.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movements, searchTerm, typeFilter]);

  const handleExport = () => {
    ExportService.exportMovementLedger(filtered);
    toast.success("Stock movement ledger exported to CSV!");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Stock Movement Audit Ledger</h1>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export Audit Ledger (CSV)</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Chassis No (VIN), Reference Document ID, or Operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="PURCHASE">PURCHASE (Inward)</option>
            <option value="SALE">SALE (Invoiced)</option>
            <option value="TRANSFER_OUT">TRANSFER_OUT (Dispatched)</option>
            <option value="TRANSFER_IN">TRANSFER_IN (Received)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Damage / PDI)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            Showing {filtered.length} of {movements.length} logged stock events
          </span>
          <span className="text-xs text-slate-500 font-semibold">Dealership Movement Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Chassis Number (VIN)</th>
                <th className="py-3 px-4">Movement Trail</th>
                <th className="py-3 px-4">Reference Document</th>
                <th className="py-3 px-4">Notes / Reason</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    No matching stock movement events found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isPurchase = m.movementType === "PURCHASE";
                  const isSale = m.movementType === "SALE";
                  const isTransfer = m.movementType.includes("TRANSFER");
                  const isAdjustment = m.movementType === "ADJUSTMENT";

                  return (
                    <tr key={m.movementId} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPurchase
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isSale
                              ? "bg-slate-200 text-slate-800 border border-slate-300"
                              : isTransfer
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-purple-100 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-blue-900">
                        {m.chassisNumber}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-xs">
                        {m.fromBranchName ? `${m.fromBranchName} → ` : ""}
                        <span className="font-semibold text-slate-800">
                          {m.toBranchName || "Customer Delivery"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-blue-700 font-bold">
                        {m.referenceId}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-xs text-slate-600 max-w-xs truncate">
                        {m.notes || "—"}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-600">
                        {m.createdBy}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
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
    </div>
  );
};

