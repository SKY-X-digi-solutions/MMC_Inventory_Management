"use client";

import React, { useMemo } from "react";
import { VehicleRecord } from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import {
  X,
  Bike,
  Building2,
  Key,
  Battery,
  Calendar,
  History,
  ReceiptText,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface VehicleDetailDrawerProps {
  vehicle: VehicleRecord | null;
  onClose: () => void;
  onOpenSale: (vehicle: VehicleRecord) => void;
  onOpenTransfer: (vehicle: VehicleRecord) => void;
  onStatusUpdated?: () => void;
}

export const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
  vehicle,
  onClose,
  onOpenSale,
  onOpenTransfer,
  onStatusUpdated,
}) => {
  if (!vehicle) return null;

  const handleUpdateStatus = (newStatus: any, reason: string) => {
    InventoryService.updateVehicleStatus(vehicle.vehicleId, newStatus, reason);
    vehicle.status = newStatus;
    onStatusUpdated?.();
  };

  // Retrieve movement history for this specific physical motorcycle
  const movements = useMemo(() => {
    return InventoryService.getMovements(vehicle.vehicleId);
  }, [vehicle]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideInRight">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                1 Document / Vehicle
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {vehicle.vehicleId}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight mt-1">
              {vehicle.modelName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{vehicle.colorName}</span>
              <span>•</span>
              <span className="font-mono">{vehicle.modelCode}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status & Location Pill */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Status:</span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 font-black text-xs rounded-full border ${
                  vehicle.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                  vehicle.status === "DAMAGED" ? "bg-red-100 text-red-800 border-red-200" :
                  vehicle.status === "SERVICE" ? "bg-amber-100 text-amber-800 border-amber-200" :
                  "bg-slate-200 text-slate-800 border-slate-300"
                }`}>
                  {vehicle.status}
                </span>

                {vehicle.status === "AVAILABLE" && (
                  <button
                    onClick={() => handleUpdateStatus("DAMAGED", "Transit damage reported at yard")}
                    className="text-[10px] text-red-600 hover:bg-red-50 px-2 py-0.5 rounded border border-red-200 font-semibold"
                  >
                    Flag Damage
                  </button>
                )}
                {(vehicle.status === "DAMAGED" || vehicle.status === "SERVICE") && (
                  <button
                    onClick={() => handleUpdateStatus("AVAILABLE", "PDI cleared & restored to stock")}
                    className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold"
                  >
                    Clear to Available
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-start justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{vehicle.branchName || "Main Showroom"}</div>
                  <div className="text-[11px] text-slate-500">{vehicle.locationName || "Yard Floor"}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Bay Code</span>
                <div className="font-mono font-black text-blue-700 text-xs">
                  {vehicle.binCode || "YARD-A1"}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Identifiers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Unique Physical Identifiers</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-sans font-medium">Chassis No (VIN):</span>
                <span className="font-black text-blue-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {vehicle.chassisNumber}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-sans font-medium">Engine Number:</span>
                <span className="font-bold text-slate-800">{vehicle.engineNumber}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-sans font-medium">Key Code:</span>
                <span className="font-bold text-slate-800">{vehicle.keyNumber || "KY-01"}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-sans font-medium">Battery Number:</span>
                <span className="font-bold text-slate-800">{vehicle.batteryNumber || "EXIDE-12V"}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-sans font-medium">Manufacturing Date:</span>
                <span className="font-bold text-slate-800">{vehicle.manufacturingDate || "2026-10-15"}</span>
              </div>
            </div>
          </div>

          {/* Customer Association (if sold or reserved) */}
          {vehicle.customerName && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Assigned Customer Record:
              </span>
              <div className="text-xs">
                <div className="font-bold text-slate-900">{vehicle.customerName}</div>
                <div className="text-slate-600 font-mono">{vehicle.customerPhone}</div>
                {vehicle.salesInvoiceId && (
                  <div className="text-blue-700 font-mono font-semibold mt-1">
                    Invoice: {vehicle.salesInvoiceId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifecycle Movement Ledger Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600" />
              <span>Unit Movement History ({movements.length} Events)</span>
            </h3>

            {movements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No movement events logged yet.</p>
            ) : (
              <div className="border-l-2 border-blue-200 ml-2 space-y-4 py-1">
                {movements.map((m) => (
                  <div key={m.movementId} className="relative pl-5 text-xs">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full absolute -left-[5.5px] top-1 ring-4 ring-white" />
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{m.movementType}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {m.movementDate ? m.movementDate.replace("T", " ").slice(0, 16) : ""}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{m.notes}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Ref: {m.referenceId} ({m.createdBy})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex items-center gap-3">
          {vehicle.status === "AVAILABLE" && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenSale(vehicle);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <ReceiptText className="w-4 h-4" />
                <span>Sell Unit</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer(vehicle);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

