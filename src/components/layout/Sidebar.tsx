"use client";

import React from "react";
import Image from "next/image";
import {
  Layers,
  UploadCloud,
  FileSpreadsheet,
  ArrowRightLeft,
  ReceiptText,
  Bike,
  History,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export type ActiveTab =
  | "stock-yard"
  | "inward-upload"
  | "purchase-voucher"
  | "transfers"
  | "sales-invoicing"
  | "model-masters"
  | "movement-audit";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inTransitCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  inTransitCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const menuItems = [
    {
      id: "stock-yard" as ActiveTab,
      label: "Stock Yard (Current Stock)",
      icon: Layers,
      badge: null,
    },
    {
      id: "inward-upload" as ActiveTab,
      label: "Bulk Inward Invoices",
      icon: UploadCloud,
      badge: null,
    },
    {
      id: "purchase-voucher" as ActiveTab,
      label: "Purchase Vouchers",
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: "transfers" as ActiveTab,
      label: "Stock Transfers",
      icon: ArrowRightLeft,
      badge: inTransitCount > 0 ? `${inTransitCount} In Transit` : null,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "sales-invoicing" as ActiveTab,
      label: "Sales & Gate Pass",
      icon: ReceiptText,
      badge: null,
    },
    {
      id: "model-masters" as ActiveTab,
      label: "Model Masters",
      icon: Bike,
      badge: null,
    },
    {
      id: "movement-audit" as ActiveTab,
      label: "Movement Audit Log",
      icon: History,
      badge: null,
    },
  ];

  return (
    <aside
      className={`border-r border-slate-200 bg-white text-slate-800 flex flex-col h-screen shrink-0 font-sans shadow-xs select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Top Header: Logo strictly (No Close Toggle above) */}
      <div className="h-16 px-4 border-b border-slate-200 flex items-center shrink-0 bg-white">
        {!isCollapsed ? (
          <div className="flex items-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="Maruthi Motors Yamaha"
              width={160}
              height={40}
              className="h-8 sm:h-8.5 w-auto object-contain"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src="/mm-emblem.png"
              alt="Maruthi Motors Yamaha"
              width={70}
              height={50}
              className="h-9 sm:h-9.5 w-auto max-w-[46px] object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Section Header */}
      {!isCollapsed ? (
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-white border-b border-blue-100/80 flex items-center gap-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider truncate">
            Inventory Workflows
          </span>
        </div>
      ) : (
        <div className="py-2 border-b border-blue-100/80 flex items-center justify-center bg-blue-50/40 shrink-0" title="Inventory Workflows">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        </div>
      )}

      {/* Navigation Cards: Reduced Size Cards and Icons */}
      <nav className={`space-y-1.5 flex-1 overflow-y-auto ${isCollapsed ? "p-2" : "p-2.5"}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (isCollapsed) {
            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`h-9.5 w-9.5 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isActive
                      ? "bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/20 text-blue-600"
                      : "bg-slate-50/90 hover:bg-slate-100 border-slate-200/80 hover:border-slate-300 text-blue-600"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-700" : "text-blue-600"}`} />
                </button>

                {/* Floating tooltip on hover when collapsed */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all text-left cursor-pointer border ${
                isActive
                  ? "bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                  : "bg-slate-50/90 hover:bg-slate-100 border-slate-200/80 hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-blue-600"}`} />
                </div>
                <span
                  className={`text-[11.5px] font-bold leading-snug truncate ${
                    isActive ? "text-blue-950 font-extrabold" : "text-slate-800"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : item.badgeColor || "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer: Open and Close Drawer Toggle below options */}
      {onToggleCollapse && (
        <div
          className={`border-t border-slate-200/80 bg-white shrink-0 ${
            isCollapsed ? "p-2 flex items-center justify-center" : "p-2.5 flex items-center justify-end"
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-2xs group ${
              isCollapsed
                ? "h-9 w-9 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60"
                : "h-8.5 w-8.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
            title={isCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
            aria-label={isCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
