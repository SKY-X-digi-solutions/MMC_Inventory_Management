"use client";

import React, { useState } from "react";
import {
  VehicleRecord,
  TransferRecord,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
  DEFAULT_SUB_DEALERS,
} from "@/services/modelCatalog.service";
import {
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Bike,
  Building2,
  Send,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface TransfersViewProps {
  transfers: TransferRecord[];
  vehicles: VehicleRecord[];
  selectedBranch: string;
  onRefresh: () => void;
  preSelectedVehicle?: VehicleRecord | null;
  onClearPreSelected?: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  transfers,
  vehicles,
  selectedBranch,
  onRefresh,
  preSelectedVehicle,
  onClearPreSelected,
}) => {
  const [isCreating, setIsCreating] = useState(!!preSelectedVehicle);
  const [transferType, setTransferType] = useState<"BRANCH_TO_BRANCH" | "SUB_DEALER">("BRANCH_TO_BRANCH");
  const [fromBranchId, setFromBranchId] = useState(
    preSelectedVehicle ? preSelectedVehicle.branchId : (selectedBranch !== "ALL" ? selectedBranch : DEFAULT_BRANCHES[0].branchId)
  );
  const [toBranchId, setToBranchId] = useState(DEFAULT_BRANCHES[1].branchId); // VNB
  const [subDealerId, setSubDealerId] = useState(DEFAULT_SUB_DEALERS[0].subDealerId);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(
    preSelectedVehicle ? [preSelectedVehicle.vehicleId] : []
  );

  // Available units at source branch
  const availableAtSource = vehicles.filter(
    (v) => v.branchId === fromBranchId && v.status === "AVAILABLE"
  );

  const handleToggleSelect = (vehicleId: string) => {
    if (selectedVehicleIds.includes(vehicleId)) {
      setSelectedVehicleIds(selectedVehicleIds.filter((id) => id !== vehicleId));
    } else {
      setSelectedVehicleIds([...selectedVehicleIds, vehicleId]);
    }
  };

  const handleDispatch = () => {
    if (selectedVehicleIds.length === 0) {
      toast.error("Please select at least one vehicle to dispatch.");
      return;
    }

    const fromBranch = DEFAULT_BRANCHES.find((b) => b.branchId === fromBranchId) || DEFAULT_BRANCHES[0];
    const toBranch = transferType === "BRANCH_TO_BRANCH"
      ? DEFAULT_BRANCHES.find((b) => b.branchId === toBranchId)
      : null;
    const subDealer = transferType === "SUB_DEALER"
      ? DEFAULT_SUB_DEALERS.find((s) => s.subDealerId === subDealerId)
      : null;

    const chosenVehicles = vehicles.filter((v) => selectedVehicleIds.includes(v.vehicleId));

    const newTransfer: TransferRecord = {
      transferId: `TRF-${Date.now().toString().slice(-6)}`,
      transferNumber: `TR-0000${Math.floor(10 + Math.random() * 90)}`,
      transferType,
      destinationType: transferType === "BRANCH_TO_BRANCH" ? "BRANCH" : "SUB_DEALER",
      fromBranchId: fromBranch.branchId,
      fromBranchName: fromBranch.branchName,
      toBranchId: toBranch ? toBranch.branchId : null,
      toBranchName: toBranch ? toBranch.branchName : undefined,
      subDealerId: subDealer ? subDealer.subDealerId : null,
      subDealerName: subDealer ? subDealer.dealerName : undefined,
      status: "IN_TRANSIT",
      initiatedBy: "P. Rajan (Store Manager)",
      initiatedAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
      items: chosenVehicles.map((v, i) => ({
        itemId: `ITEM-${i + 1}`,
        vehicleId: v.vehicleId,
        modelName: v.modelName,
        colorName: v.colorName,
        chassisNumber: v.chassisNumber,
        engineNumber: v.engineNumber,
        fromLocationId: v.locationId,
        toLocationId: "LOC004",
        itemStatus: "IN_TRANSIT",
        remarks: "Stock transfer dispatched via truck delivery",
      })),
    };

    InventoryService.createAndDispatchTransfer(newTransfer);
    toast.success(`Transfer ${newTransfer.transferNumber} dispatched! (${selectedVehicleIds.length} units in transit)`);
    setIsCreating(false);
    setSelectedVehicleIds([]);
    onClearPreSelected?.();
    onRefresh();
  };

  const handleConfirmReceipt = (transferId: string) => {
    // Receive into destination default yard and bay
    InventoryService.receiveTransfer(transferId, "LOC004", "BIN005");
    toast.success("Transfer receipt confirmed! Vehicles are now AVAILABLE at destination showroom yard.");
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Vehicle Transfers Hub</h1>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? "View Transfer List" : "Initiate Stock Transfer"}</span>
        </button>
      </div>

      {/* Transfer Creation Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">New Transfer Dispatch Request</h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Transfer Destination Type:</label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value as any)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRANCH_TO_BRANCH">Branch-to-Branch (Internal MMC)</option>
                <option value="SUB_DEALER">Sub-Dealer Transfer (Consignment / Sale)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Source Showroom / Yard:</label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              >
                {DEFAULT_BRANCHES.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {transferType === "BRANCH_TO_BRANCH" ? "Destination Branch:" : "Destination Sub-Dealer:"}
              </label>
              {transferType === "BRANCH_TO_BRANCH" ? (
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  {DEFAULT_BRANCHES.filter((b) => b.branchId !== fromBranchId).map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={subDealerId}
                  onChange={(e) => setSubDealerId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  {DEFAULT_SUB_DEALERS.map((s) => (
                    <option key={s.subDealerId} value={s.subDealerId}>
                      {s.dealerName} ({s.city})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Vehicle Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Available Vehicles to Transfer ({selectedVehicleIds.length} Selected)
              </span>
              <span className="text-[11px] text-slate-500">
                {availableAtSource.length} available at source yard
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-10">Select</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3">Chassis No</th>
                    <th className="py-2.5 px-3">Engine No</th>
                    <th className="py-2.5 px-3">Current Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {availableAtSource.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                        No available vehicles found at this source branch.
                      </td>
                    </tr>
                  ) : (
                    availableAtSource.map((v) => {
                      const isSelected = selectedVehicleIds.includes(v.vehicleId);
                      return (
                        <tr
                          key={v.vehicleId}
                          onClick={() => handleToggleSelect(v.vehicleId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 font-sans">{v.modelName}</td>
                          <td className="py-2 px-3 font-sans">{v.colorName}</td>
                          <td className="py-2 px-3">{v.chassisNumber}</td>
                          <td className="py-2 px-3 text-slate-500">{v.engineNumber}</td>
                          <td className="py-2 px-3 font-sans text-slate-600">{v.binCode || "YARD"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={selectedVehicleIds.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch {selectedVehicleIds.length} Vehicle(s)</span>
            </button>
          </div>
        </div>
      )}

      {/* Active In-Transit & History Transfers List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Active Transfers & Transit Queue</span>
          <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-bold">
            {transfers.length} Records
          </span>
        </h2>

        {transfers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm text-slate-600">No transfer records found.</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Initiate Stock Transfer" to move stock between branches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {transfers.map((t) => (
              <div
                key={t.transferId}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Transfer Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                      {t.transferNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === "IN_TRANSIT"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : t.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t.transferType === "BRANCH_TO_BRANCH" ? "Internal Branch Movement" : "Sub-Dealer Dispatch"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.fromBranchName}</span>
                    </div>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.toBranchName || t.subDealerName}</span>
                    </div>
                  </div>

                  {/* Units Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                      >
                        {item.modelName} ({item.colorName}) • {item.chassisNumber.slice(-6)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <div className="text-[11px] text-slate-400">
                    Dispatched: {t.dispatchedAt ? t.dispatchedAt.replace("T", " ").slice(0, 16) : "—"}
                  </div>

                  {t.status === "IN_TRANSIT" ? (
                    <button
                      onClick={() => handleConfirmReceipt(t.transferId)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Inward Receipt ({t.items.length} Units)</span>
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Received & Stock Reconciled</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

