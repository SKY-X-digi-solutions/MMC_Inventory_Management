"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Building2, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  X,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { DEFAULT_BRANCHES } from "@/services/modelCatalog.service";
import { AuthService, AuthUser } from "@/services/auth.service";

interface HeaderProps {
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  activeTabTitle?: string;
  activeSubPath?: string | null;
  onNavigateHub?: () => void;
  onNavigateTabRoot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBranch,
  onBranchChange,
  activeTabTitle = "Stock Yard & Live Inventory",
  activeSubPath = null,
  onNavigateHub,
  onNavigateTabRoot,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  // Close branch dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchOpen(false);
      }
    };
    if (isBranchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBranchOpen]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the inventory system?")) {
      AuthService.logout();
    }
  };

  const currentBranchName = 
    selectedBranch === "ALL" 
      ? "All Locations" 
      : DEFAULT_BRANCHES.find((b) => b.branchId === selectedBranch)?.branchName || selectedBranch;

  return (
    <>
      {/* Top Navbar Header aligned straight to the right of the Sidebar */}
      <header className="w-full h-16 border-b border-slate-200 bg-white px-5 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0 font-sans">
        {/* Left: Section Context Breadcrumb (Interactive Folder Path) */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={onNavigateHub}
            className="text-slate-400 font-medium hover:text-blue-600 transition-colors cursor-pointer"
            title="Navigate to Inventory Hub overview"
          >
            Inventory Hub
          </button>
          <span className="text-slate-300 select-none">/</span>
          {activeSubPath ? (
            <>
              <button
                type="button"
                onClick={onNavigateTabRoot}
                className="text-slate-500 font-medium hover:text-blue-600 transition-colors cursor-pointer"
                title={`Back to ${activeTabTitle}`}
              >
                {activeTabTitle}
              </button>
              <span className="text-slate-300 select-none">/</span>
              <span className="text-slate-900 font-bold">
                {activeSubPath}
              </span>
            </>
          ) : (
            <span className="text-slate-900 font-bold">{activeTabTitle}</span>
          )}
        </div>

        {/* Right: Locations Button nearby Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Showroom Location Switcher Button */}
          <div className="relative" ref={branchRef}>
            <button
              type="button"
              onClick={() => setIsBranchOpen((prev) => !prev)}
              className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                selectedBranch !== "ALL"
                  ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100/80 hover:border-blue-400"
                  : isBranchOpen
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
              title={`Switch showroom: currently ${currentBranchName}`}
            >
              <div className="flex items-center justify-center h-5 w-5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="truncate max-w-[130px] sm:max-w-xs">{currentBranchName}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isBranchOpen ? "rotate-180 text-blue-600" : ""}`} />
            </button>

            {/* Showroom Floating Popover (opens right-aligned) */}
            {isBranchOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dealership Showrooms
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Filter stock yard & units by location
                  </p>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onBranchChange("ALL");
                      setIsBranchOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                      selectedBranch === "ALL"
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Locations (Combined)</span>
                    {selectedBranch === "ALL" && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>

                  {DEFAULT_BRANCHES.map((b) => {
                    const isSelected = selectedBranch === b.branchId;
                    return (
                      <button
                        key={b.branchId}
                        type="button"
                        onClick={() => {
                          onBranchChange(b.branchId);
                          setIsBranchOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{b.branchName}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-0.5" />

          {/* Profile Button - Icon Only with Hover Tooltip */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:ring-2 hover:ring-blue-400/40 transition-all cursor-pointer shadow-2xs"
              aria-label="Profile"
              title="View Profile"
            >
              <UserIcon className="h-4 w-4 text-blue-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
              Profile
            </div>
          </div>

          {/* Logout Button - Icon Only with Hover Tooltip */}
          <div className="relative group">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          </div>
        </div>
      </header>

      {/* Dealership Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/30">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {currentUser?.name || "Dealership Admin"}
                  </h3>
                  <p className="text-xs text-blue-600 font-bold">
                    {currentUser?.role || "Inventory Administrator"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Information List */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </span>
                <span className="font-bold text-slate-800">{currentUser?.email || "admin@maruthimotors.com"}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Assigned Showroom
                </span>
                <span className="font-bold text-slate-800">{currentUser?.showroom || "Tirupattur HQ"}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Access Level
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Full Dealership Access
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-500 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Dealership
                </span>
                <span className="font-bold text-slate-800">Maruthi Motors Yamaha</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
