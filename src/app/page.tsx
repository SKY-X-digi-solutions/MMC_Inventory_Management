"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  VehicleRecord,
  InventorySummary,
  TransferRecord,
} from "@/types/inventory";
import { InventoryService } from "@/services/inventory.service";
import { ExportService } from "@/services/export.service";
import { DEFAULT_BRANCHES } from "@/services/modelCatalog.service";
import { AuthService } from "@/services/auth.service";

import { Sidebar, ActiveTab } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import { StockYardView } from "@/components/inventory/StockYardView";
import { InwardDashboardView } from "@/components/inventory/InwardDashboardView";
import { PurchaseVouchersDashboardView } from "@/components/inventory/PurchaseVouchersDashboardView";
import { TransfersView } from "@/components/inventory/TransfersView";
import { SalesInvoicingDashboardView } from "@/components/inventory/SalesInvoicingDashboardView";
import { ModelMastersDashboardView } from "@/components/inventory/ModelMastersDashboardView";
import { MovementAuditDashboardView } from "@/components/inventory/MovementAuditDashboardView";
import { VehicleDetailDrawer } from "@/components/inventory/VehicleDetailDrawer";

import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

export default function InventoryDashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>("stock-yard");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [kpiStatusFilter, setKpiStatusFilter] = useState<string>("ALL");

  // Core Data State
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [summaryList, setSummaryList] = useState<InventorySummary[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Modals & Drawer State
  const [selectedVehicleForDrawer, setSelectedVehicleForDrawer] = useState<VehicleRecord | null>(null);
  const [preSelectedVehicleForAction, setPreSelectedVehicleForAction] = useState<VehicleRecord | null>(null);

  // Authenticate session on client
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.replace("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Load Data
  const refreshData = useCallback(() => {
    const vList = InventoryService.getVehicles(selectedBranch);
    const sList = InventoryService.getInventorySummary(selectedBranch);
    const tList = InventoryService.getTransfers(selectedBranch);
    setVehicles(vList);
    setSummaryList(sList);
    setTransfers(tList);
  }, [selectedBranch]);

  useEffect(() => {
    if (!isCheckingAuth) {
      refreshData();
    }
  }, [refreshData, isCheckingAuth]);

  // Count in-transit items for badge
  const inTransitCount = transfers.filter((t) => t.status === "IN_TRANSIT").length;

  // Handle Tab Switch directly without opening popup modals
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== "stock-yard") {
      setKpiStatusFilter("ALL");
    }
  };

  // Derive dynamic breadcrumb folder sub-path from active KPI filter
  const getKpiSubPath = (): string | null => {
    if (activeTab !== "stock-yard") return null;
    switch (kpiStatusFilter) {
      case "TOTAL":
        return "Total Stock";
      case "AVAILABLE":
        return "Available";
      case "RESERVED":
        return "Reserved";
      case "IN_TRANSIT":
        return "In Transit";
      case "SOLD":
        return "Sold / Delivered";
      default:
        return null;
    }
  };

  const handleNavigateHub = () => {
    setActiveTab("stock-yard");
    setKpiStatusFilter("ALL");
  };

  const handleNavigateTabRoot = () => {
    setKpiStatusFilter("ALL");
  };

  // Actions
  const handleExportStock = () => {
    const currentBranchName = DEFAULT_BRANCHES.find((b) => b.branchId === selectedBranch)?.branchName || "All Locations";
    ExportService.exportCurrentStock(vehicles, currentBranchName);
    toast.success("Current stock yard inventory downloaded to CSV!");
  };

  const handleOpenSale = (vehicle?: VehicleRecord) => {
    setPreSelectedVehicleForAction(vehicle || null);
    setActiveTab("sales-invoicing");
  };

  const handleOpenTransfer = (vehicle?: VehicleRecord) => {
    setPreSelectedVehicleForAction(vehicle || null);
    setActiveTab("transfers");
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 font-sans p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 border border-slate-200/80 shadow-xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <Image
            src="/logo.png"
            alt="Maruthi Motors Yamaha"
            width={180}
            height={45}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-black tracking-tight text-slate-900">
              Dealership Session Check
            </h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Verifying authorized credentials...
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Straight Vertical Sidebar with Company Logo at Top */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        inTransitCount={inTransitCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Viewport Area: Header at Top + Scrollable Content Below */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0">
        <Header
          selectedBranch={selectedBranch}
          onBranchChange={(b) => setSelectedBranch(b)}
          activeTabTitle={
            activeTab === "stock-yard"
              ? "Stock Yard (Current Stock)"
              : activeTab === "inward-upload"
              ? "Bulk Inward Invoices"
              : activeTab === "purchase-voucher"
              ? "Purchase Vouchers"
              : activeTab === "transfers"
              ? "Stock Transfers"
              : activeTab === "sales-invoicing"
              ? "Sales & Gate Pass"
              : activeTab === "model-masters"
              ? "Model Masters"
              : "Movement Audit Log"
          }
          activeSubPath={getKpiSubPath()}
          onNavigateHub={handleNavigateHub}
          onNavigateTabRoot={handleNavigateTabRoot}
        />

        {/* Dynamic Full Dashboard Workspace View */}
        <main className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4 min-w-0">
          <div className="max-w-7xl mx-auto space-y-4">
            {activeTab === "stock-yard" && (
              <StockYardView
                vehicles={vehicles}
                summaryList={summaryList}
                selectedBranch={selectedBranch}
                statusFilter={kpiStatusFilter}
                onStatusFilterChange={setKpiStatusFilter}
                onSelectVehicle={(v) => setSelectedVehicleForDrawer(v)}
                onOpenInward={() => setActiveTab("inward-upload")}
                onOpenVoucher={() => setActiveTab("purchase-voucher")}
                onOpenTransfer={handleOpenTransfer}
                onOpenSale={handleOpenSale}
                onExportStock={handleExportStock}
              />
            )}

            {activeTab === "inward-upload" && (
              <InwardDashboardView
                selectedBranch={selectedBranch}
                onRefresh={refreshData}
              />
            )}

            {activeTab === "purchase-voucher" && (
              <PurchaseVouchersDashboardView
                selectedBranch={selectedBranch}
                onRefresh={refreshData}
              />
            )}

            {activeTab === "transfers" && (
              <TransfersView
                transfers={transfers}
                vehicles={vehicles}
                selectedBranch={selectedBranch}
                onRefresh={refreshData}
                preSelectedVehicle={preSelectedVehicleForAction}
                onClearPreSelected={() => setPreSelectedVehicleForAction(null)}
              />
            )}

            {activeTab === "sales-invoicing" && (
              <SalesInvoicingDashboardView
                vehicles={vehicles}
                selectedBranch={selectedBranch}
                onRefresh={refreshData}
                preSelectedVehicle={preSelectedVehicleForAction}
                onClearPreSelected={() => setPreSelectedVehicleForAction(null)}
              />
            )}

            {activeTab === "model-masters" && (
              <ModelMastersDashboardView
                onRefresh={refreshData}
              />
            )}

            {activeTab === "movement-audit" && (
              <MovementAuditDashboardView />
            )}
          </div>
        </main>
      </div>

      {/* Slide-out Vehicle Identity & Lifecycle Drawer */}
      <VehicleDetailDrawer
        vehicle={selectedVehicleForDrawer}
        onClose={() => setSelectedVehicleForDrawer(null)}
        onOpenSale={handleOpenSale}
        onOpenTransfer={handleOpenTransfer}
        onStatusUpdated={refreshData}
      />
    </div>
  );
}
