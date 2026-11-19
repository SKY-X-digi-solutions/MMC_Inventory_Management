"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  SubDealerLedgerEntry,
  YbcDealerSummary,
  LedgerTransactionType,
} from "@/types/inventory";
import {
  YbcLedgerService,
  INITIAL_YBC_SUMMARIES,
} from "@/services/ybcLedger.service";
import {
  DEFAULT_BANKS,
  DEFAULT_FINANCIERS,
  DEFAULT_SUB_DEALERS,
} from "@/services/modelCatalog.service";
import {
  Landmark,
  Building2,
  Wallet,
  FileText,
  Plus,
  Search,
  ArrowLeft,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Calendar,
  X,
  Bike,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Boxes,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

interface YbcAccountsLedgerDashboardViewProps {
  onRefresh?: () => void;
  initialSubDealerId?: string | null;
}

export const YbcAccountsLedgerDashboardView: React.FC<
  YbcAccountsLedgerDashboardViewProps
> = ({ onRefresh, initialSubDealerId }) => {
  const [summaries, setSummaries] = useState<YbcDealerSummary[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(
    initialSubDealerId || null
  );

  // Filters for Master View
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<"ALL" | "DUE" | "ADVANCE" | "ZERO">("ALL");

  // Filters for Single Dealer Ledger View
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isPrintStatementOpen, setIsPrintStatementOpen] = useState(false);

  // Form State: Payment Receipt
  const [receiptForm, setReceiptForm] = useState({
    subDealerId: "",
    date: new Date().toISOString().split("T")[0],
    receiptType: "FINANCE_PAYOUT" as "BANK_RECEIPT" | "FINANCE_PAYOUT" | "CASH",
    bankName: DEFAULT_BANKS[0],
    financierName: DEFAULT_FINANCIERS[0],
    customerName: "",
    referenceNo: "",
    amount: "",
    notes: "",
  });

  // Form State: Spares / Adjustment
  const [adjustmentForm, setAdjustmentForm] = useState({
    subDealerId: "",
    date: new Date().toISOString().split("T")[0],
    adjustmentType: "SPARES_BILL" as "SPARES_BILL" | "ADJUSTMENT",
    nature: "CREDIT" as "CREDIT" | "DEBIT", // Credit = Charge to dealer (increases debt), Debit = Credit note
    billNo: "",
    amount: "",
    particular: "",
    notes: "",
  });

  // Refresh summaries
  const loadData = () => {
    setSummaries(YbcLedgerService.getYbcSummaries());
    onRefresh?.();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialSubDealerId) {
      setSelectedDealerId(initialSubDealerId);
    }
  }, [initialSubDealerId]);

  // Selected Dealer Object
  const selectedDealer = useMemo(() => {
    if (!selectedDealerId) return null;
    return (
      summaries.find((s) => s.subDealerId === selectedDealerId) ||
      INITIAL_YBC_SUMMARIES.find((s) => s.subDealerId === selectedDealerId) ||
      null
    );
  }, [selectedDealerId, summaries]);

  // Selected Dealer's Ledger Entries
  const ledgerEntries = useMemo(() => {
    if (!selectedDealerId) return [];
    return YbcLedgerService.getSubDealerLedger(selectedDealerId);
  }, [selectedDealerId, summaries]);

  // Filtered Summaries for Master Report Table
  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.dealerName.toLowerCase().includes(q) ||
        s.dealerCode.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.rtoZone && s.rtoZone.toLowerCase().includes(q));

      const matchesBalance =
        balanceFilter === "ALL"
          ? true
          : balanceFilter === "DUE"
          ? s.balance < 0
          : balanceFilter === "ADVANCE"
          ? s.balance > 0
          : s.balance === 0;

      return matchesSearch && matchesBalance;
    });
  }, [summaries, searchTerm, balanceFilter]);

  // Aggregate Master Stats
  const masterStats = useMemo(() => {
    let totalDue = 0;
    let totalAdvance = 0;
    let netBalance = 0;
    let totalStock = 0;
    let totalPendingReg = 0;

    summaries.forEach((s) => {
      if (s.balance < 0) totalDue += Math.abs(s.balance);
      else if (s.balance > 0) totalAdvance += s.balance;
      netBalance += s.balance;
      totalStock += s.stockSales.stock;
      totalPendingReg += s.registration.closing;
    });

    return {
      totalOutlets: summaries.length,
      totalDue,
      totalAdvance,
      netBalance,
      totalStock,
      totalPendingReg,
    };
  }, [summaries]);

  // Filtered Ledger Entries for Selected Dealer
  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter((e) => {
      const q = ledgerSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.particular.toLowerCase().includes(q) ||
        (e.chassisNumber && e.chassisNumber.toLowerCase().includes(q)) ||
        (e.billNo && e.billNo.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      const matchesType =
        typeFilter === "ALL"
          ? true
          : typeFilter === "VEHICLES"
          ? e.transactionType === "VEHICLE_DISPATCH" || e.transactionType === "VEHICLE_RETURN"
          : typeFilter === "RECEIPTS"
          ? e.transactionType === "BANK_RECEIPT" || e.transactionType === "FINANCE_PAYOUT"
          : typeFilter === "SPARES"
          ? e.transactionType === "SPARES_BILL"
          : e.transactionType === "ADJUSTMENT" || e.transactionType === "OPENING_BALANCE";

      return matchesSearch && matchesType;
    });
  }, [ledgerEntries, ledgerSearch, typeFilter]);

  // Handlers for Submitting Modals
  const handleOpenReceiptModal = (dealerId?: string) => {
    setReceiptForm({
      subDealerId: dealerId || selectedDealerId || summaries[0]?.subDealerId || "",
      date: new Date().toISOString().split("T")[0],
      receiptType: "FINANCE_PAYOUT",
      bankName: DEFAULT_BANKS[0],
      financierName: DEFAULT_FINANCIERS[0],
      customerName: "",
      referenceNo: "",
      amount: "",
      notes: "",
    });
    setIsReceiptModalOpen(true);
  };

  const handleOpenAdjustmentModal = (dealerId?: string) => {
    setAdjustmentForm({
      subDealerId: dealerId || selectedDealerId || summaries[0]?.subDealerId || "",
      date: new Date().toISOString().split("T")[0],
      adjustmentType: "SPARES_BILL",
      nature: "CREDIT",
      billNo: `SSI-${Math.floor(300 + Math.random() * 90)}`,
      amount: "",
      particular: "SPARES - Genuine Yamaha Parts Consignment",
      notes: "",
    });
    setIsAdjustmentModalOpen(true);
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(receiptForm.amount);
    if (!receiptForm.subDealerId || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid receipt amount and select a sub-dealer.");
      return;
    }

    const sub = summaries.find((s) => s.subDealerId === receiptForm.subDealerId);
    if (!sub) return;

    let particular = "";
    if (receiptForm.receiptType === "FINANCE_PAYOUT") {
      particular = `${receiptForm.customerName || "Customer"} - ${receiptForm.financierName} PAYOUT`;
    } else if (receiptForm.receiptType === "BANK_RECEIPT") {
      particular = `${receiptForm.bankName.toUpperCase()} - RECEIVED DIRECT PAYMENT`;
    } else {
      particular = `CASH PAYMENT RECEIVED`;
    }

    YbcLedgerService.addLedgerEntry({
      subDealerId: sub.subDealerId,
      subDealerCode: sub.dealerCode,
      subDealerName: sub.dealerName,
      date: receiptForm.date,
      particular,
      transactionType: receiptForm.receiptType === "FINANCE_PAYOUT" ? "FINANCE_PAYOUT" : "BANK_RECEIPT",
      bankName: receiptForm.bankName,
      financierName: receiptForm.receiptType === "FINANCE_PAYOUT" ? receiptForm.financierName : undefined,
      customerName: receiptForm.customerName || undefined,
      referenceNo: receiptForm.referenceNo || undefined,
      debit: amt,
      credit: 0,
      notes: receiptForm.notes || undefined,
    });

    toast.success(`Receipt of ₹${amt.toLocaleString("en-IN")} credited to ${sub.dealerCode}!`);
    setIsReceiptModalOpen(false);
    loadData();
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(adjustmentForm.amount);
    if (!adjustmentForm.subDealerId || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount and select a sub-dealer.");
      return;
    }

    const sub = summaries.find((s) => s.subDealerId === adjustmentForm.subDealerId);
    if (!sub) return;

    const isCredit = adjustmentForm.nature === "CREDIT";

    YbcLedgerService.addLedgerEntry({
      subDealerId: sub.subDealerId,
      subDealerCode: sub.dealerCode,
      subDealerName: sub.dealerName,
      date: adjustmentForm.date,
      particular: adjustmentForm.particular || (adjustmentForm.adjustmentType === "SPARES_BILL" ? "SPARES BILL" : "LEDGER ADJUSTMENT"),
      transactionType: adjustmentForm.adjustmentType,
      billNo: adjustmentForm.billNo || undefined,
      debit: isCredit ? 0 : amt,
      credit: isCredit ? amt : 0,
      notes: adjustmentForm.notes || undefined,
    });

    toast.success(`${adjustmentForm.adjustmentType === "SPARES_BILL" ? "Spares Bill" : "Adjustment"} recorded for ${sub.dealerCode}!`);
    setIsAdjustmentModalOpen(false);
    loadData();
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // =========================================================================
  // VIEW 2: DEDICATED SUB-DEALER ACCOUNT STATEMENT VIEW
  // =========================================================================
  if (selectedDealer) {
    const isDue = selectedDealer.balance < 0;
    const isAdvance = selectedDealer.balance > 0;

    return (
      <div className="space-y-4 animate-fadeIn pb-8">
        {/* Navigation & Header Strip */}
        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSelectedDealerId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors shrink-0 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to YBC Master</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {selectedDealer.dealerName}
                </h1>
                <span className="font-mono bg-blue-50 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-md border border-blue-200/60">
                  {selectedDealer.dealerCode}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{selectedDealer.city}</span>
                <span>•</span>
                <span>Zone: {selectedDealer.rtoZone || "HQ Area"}</span>
                <span>•</span>
                <span>Contact: {selectedDealer.contactPerson || "Manager"} ({selectedDealer.mobile || "+91 94432..."})</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenReceiptModal(selectedDealer.subDealerId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Receipt / Loan Payout</span>
            </button>

            <button
              onClick={() => handleOpenAdjustmentModal(selectedDealer.subDealerId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors shadow-2xs"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Add Spares (SSI)</span>
            </button>

            <button
              onClick={() => setIsPrintStatementOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>

            <button
              onClick={() => YbcLedgerService.exportSubDealerStatementCsv(selectedDealer.subDealerId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs"
              title="Download Statement as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Financial Balance & Stock Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Closing Financial Balance */}
          <div className={`p-4 rounded-2xl border shadow-xs ${
            isDue
              ? "bg-amber-50/60 border-amber-200 text-amber-950"
              : isAdvance
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Closing Account Balance
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                isDue ? "bg-amber-200 text-amber-900" : isAdvance ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-700"
              }`}>
                {isDue ? "RECEIVABLE DUE" : isAdvance ? "ADVANCE CREDIT" : "SETTLED"}
              </span>
            </div>
            <div className="text-2xl font-black mt-1 font-mono tracking-tight">
              ₹{Math.abs(selectedDealer.balance).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isDue ? "Sub-dealer owes Maruthi Motors" : isAdvance ? "Advance credit balance held by dealer" : "Account fully settled"}
            </div>
          </div>

          {/* Card 2: Ground Stock at Sub-Dealer */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ground Stock on Hand
              </span>
              <Boxes className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900 font-mono">
              {selectedDealer.stockSales.stock} <span className="text-sm font-normal text-slate-500">Units</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>Open: {selectedDealer.stockSales.openStock}</span>
              <span>•</span>
              <span>Transfers In: +{selectedDealer.stockSales.tra}</span>
              <span>•</span>
              <span>Sales: {selectedDealer.stockSales.sale}</span>
            </div>
          </div>

          {/* Card 3: Pending RTO Registrations */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending RTO Registrations
              </span>
              <AlertTriangle className={`w-4 h-4 ${selectedDealer.registration.closing > 0 ? "text-amber-500" : "text-emerald-500"}`} />
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900 font-mono">
              {selectedDealer.registration.closing} <span className="text-sm font-normal text-slate-500">Pending</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>RTO Completed: {selectedDealer.registration.regDone} units</span>
              {selectedDealer.registration.closing > 0 && (
                <button
                  onClick={() => {
                    YbcLedgerService.markRegistrationDone(selectedDealer.subDealerId, 1);
                    toast.success("1 RTO registration marked as completed!");
                    loadData();
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[10px] underline"
                >
                  +1 Reg Done
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Ledger Audit Stats */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Ledger Activity
              </span>
              <Receipt className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900 font-mono">
              {ledgerEntries.length} <span className="text-sm font-normal text-slate-500">Entries</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Live automated passbook record
            </div>
          </div>
        </div>

        {/* Ledger Entries Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search particular, chassis, bill no..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs w-full md:w-auto">
              {[
                { id: "ALL", label: "All Transactions" },
                { id: "VEHICLES", label: "Vehicles" },
                { id: "RECEIPTS", label: "Bank & Loan Payouts" },
                { id: "SPARES", label: "Spares (SSI)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    typeFilter === t.id
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">S.No</th>
                  <th className="py-3 px-3 w-28">Date</th>
                  <th className="py-3 px-4">Particular / Transaction Details</th>
                  <th className="py-3 px-3 w-44">Chassis / Code</th>
                  <th className="py-3 px-3 w-28">Bill No</th>
                  <th className="py-3 px-4 text-right w-32 text-emerald-700">Debit (₹)</th>
                  <th className="py-3 px-4 text-right w-32 text-slate-700">Credit (₹)</th>
                  <th className="py-3 px-4 text-right w-36">Running Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLedgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No transactions found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredLedgerEntries.map((e, idx) => {
                    const isBalNegative = e.runningBalance < 0;
                    return (
                      <tr key={e.entryId} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                          {e.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-snug">
                            {e.particular}
                          </div>
                          {e.notes && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {e.notes}
                            </div>
                          )}
                          {e.financierName && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                              {e.financierName} {e.customerName ? `• ${e.customerName}` : ""}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {e.chassisNumber ? (
                            <div>
                              <span className="font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] border border-blue-200/60">
                                {e.chassisNumber}
                              </span>
                              {e.modelCode && (
                                <span className="ml-1 text-[10px] text-slate-400 font-sans">
                                  ({e.modelCode})
                                </span>
                              )}
                            </div>
                          ) : e.modelCode ? (
                            <span className="font-bold text-slate-700">{e.modelCode}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {e.billNo || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                          {e.debit > 0 ? `₹${e.debit.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                          {e.credit > 0 ? `₹${e.credit.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            isBalNegative
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}>
                            ₹{e.runningBalance.toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Official Statement Modal */}
        {isPrintStatementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
              {/* Modal Actions */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-slate-900 text-base">
                    Official Sub-Dealer Account Statement
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerPrint}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Print Document
                  </button>
                  <button
                    onClick={() => setIsPrintStatementOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              <div className="space-y-6 text-xs text-slate-800 font-sans print:p-0">
                {/* Dealership Letterhead */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">
                    MARUTHI MOTORS YAMAHA
                  </h2>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Authorized Main Dealer: India Yamaha Motor Pvt. Ltd.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    #1/10, Don Bosco Nagar, Vaniyambadi Main Road, Tirupattur - 635601 | GSTIN: 33AAHPJ3257M1ZH
                  </p>
                </div>

                {/* Sub-Dealer Statement Header */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sub-Dealer / YBC</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {selectedDealer.dealerName}
                    </strong>
                    <div className="text-slate-500 mt-1">
                      Location: {selectedDealer.city} ({selectedDealer.dealerCode})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Statement Date</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </strong>
                    <div className="text-slate-500 mt-1 font-mono font-bold">
                      Closing Balance: ₹{selectedDealer.balance.toLocaleString("en-IN")} ({selectedDealer.balance >= 0 ? "Advance" : "Due"})
                    </div>
                  </div>
                </div>

                {/* Print Statement Table */}
                <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="border p-2 text-center">S.No</th>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Particular</th>
                      <th className="border p-2">Chassis / Bill</th>
                      <th className="border p-2 text-right">Debit (₹)</th>
                      <th className="border p-2 text-right">Credit (₹)</th>
                      <th className="border p-2 text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.map((e, idx) => (
                      <tr key={e.entryId} className="border-b">
                        <td className="border p-1.5 text-center font-mono">{idx + 1}</td>
                        <td className="border p-1.5 font-mono">{e.date}</td>
                        <td className="border p-1.5 font-medium">{e.particular}</td>
                        <td className="border p-1.5 font-mono">{e.chassisNumber || e.billNo || "—"}</td>
                        <td className="border p-1.5 text-right font-mono text-emerald-700">{e.debit ? `₹${e.debit.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="border p-1.5 text-right font-mono">{e.credit ? `₹${e.credit.toLocaleString("en-IN")}` : "—"}</td>
                        <td className="border p-1.5 text-right font-mono font-bold">₹{e.runningBalance.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bank Account Details for RTGS & Signatory */}
                <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-200">
                  <div className="bg-slate-50 p-3 rounded-lg border text-[11px]">
                    <span className="font-bold text-slate-700 block">Bank Details for RTGS/NEFT:</span>
                    <span>Bank: Indian Bank (I.BANK) | Current A/c No: 66291002931</span><br />
                    <span>IFSC: IDIB000T041 | Branch: Tirupattur Main</span>
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <span className="font-bold text-slate-800">For MARUTHI MOTORS YAMAHA</span>
                    <span className="text-slate-400 text-[10px] mt-6">Authorized Signatory / Accounts Manager</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: MASTER CONSOLIDATED DASHBOARD (THE EXACT 4 PANELS FROM REPORT.XLSX)
  // =========================================================================
  return (
    <div className="space-y-4 animate-fadeIn pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              YBC & Sub-Dealer Accounts Ledger
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => handleOpenReceiptModal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Record Receipt / Loan Payout</span>
          </button>

          <button
            onClick={() => handleOpenAdjustmentModal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>+ Record Spares (SSI)</span>
          </button>

          <button
            onClick={() => YbcLedgerService.exportYbcMasterCsv()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors shadow-2xs"
            title="Download Full Consolidated YBC Report as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 5 High-Level KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Card 1: Outlets */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            YBC Outlets
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {masterStats.totalOutlets} <span className="text-xs font-normal text-slate-500">Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ambur, SVM, Hosur, etc.</div>
        </div>

        {/* Card 2: Total Receivables Due */}
        <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">
            Sub-Dealer Receivables Due
          </span>
          <div className="text-xl font-black text-amber-950 mt-1 font-mono">
            ₹{masterStats.totalDue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">Owed to Maruthi Motors</div>
        </div>

        {/* Card 3: Total Advance Credits */}
        <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">
            Sub-Dealer Advance Held
          </span>
          <div className="text-xl font-black text-emerald-950 mt-1 font-mono">
            ₹{masterStats.totalAdvance.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Advance deposits & credits</div>
        </div>

        {/* Card 4: Net Balance Position */}
        <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">
            Net Dealership Balance
          </span>
          <div className="text-xl font-black text-blue-950 mt-1 font-mono">
            ₹{masterStats.netBalance.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-blue-700 mt-0.5">Exact match with Report.xlsx</div>
        </div>

        {/* Card 5: Live Ground Stock */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
            Network Ground Stock
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">
            {masterStats.totalStock} <span className="text-xs font-normal text-slate-500">Units</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Pending RTO: {masterStats.totalPendingReg} units
          </div>
        </div>
      </div>

      {/* Filter and Quick Chips Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sub-dealer by name, code, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Balance:
          </span>
          {[
            { id: "ALL", label: `All Outlets (${summaries.length})` },
            { id: "DUE", label: "Receivable Due" },
            { id: "ADVANCE", label: "Advance Credit" },
            { id: "ZERO", label: "Settled / Nil" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setBalanceFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                balanceFilter === f.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-in-1 Synchronized Consolidated Master Table (Matching Report.xlsx) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs min-w-[1200px] border-collapse">
            {/* Top Super-Headers matching Report.xlsx */}
            <thead className="bg-slate-900 text-white font-bold text-[11px] tracking-wide border-b border-slate-800">
              <tr>
                <th colSpan={3} className="py-2.5 px-3 border-r border-slate-700 bg-slate-900 text-left pl-4">
                  1. SUB-DEALER &amp; LIVE BALANCE
                </th>
                <th colSpan={6} className="py-2.5 px-3 border-r border-slate-700 bg-blue-950 text-blue-200">
                  2. STOCK &amp; SALES PIPELINE (GROUND VEHICLES)
                </th>
                <th colSpan={4} className="py-2.5 px-3 border-r border-slate-700 bg-slate-900">
                  3. RTO REGISTRATION TRACKER
                </th>
                <th colSpan={2} className="py-2.5 px-3 border-r border-slate-700 bg-amber-950/80 text-amber-200">
                  4. TODAY
                </th>
                <th className="py-2.5 px-3 bg-slate-900">
                  ACTION
                </th>
              </tr>
              {/* Sub-Headers */}
              <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 px-2 text-center w-10 border-r border-slate-200">S.No</th>
                <th className="py-2 px-3 text-left border-r border-slate-200">Dealer Name / Code</th>
                <th className="py-2 px-3 text-right border-r border-slate-300">Balance (₹)</th>

                {/* Stock & Sales Columns */}
                <th className="py-2 px-2 border-r border-slate-200">Open</th>
                <th className="py-2 px-2 border-r border-slate-200">Pur</th>
                <th className="py-2 px-2 border-r border-slate-200 text-blue-700">Tra</th>
                <th className="py-2 px-2 border-r border-slate-200 text-amber-700">Ret</th>
                <th className="py-2 px-2 border-r border-slate-200 text-purple-700">Sale</th>
                <th className="py-2 px-3 border-r border-slate-300 bg-emerald-50 text-emerald-900 font-black">Stock</th>

                {/* RTO Registration Columns */}
                <th className="py-2 px-2 border-r border-slate-200">Open</th>
                <th className="py-2 px-2 border-r border-slate-200">Sale</th>
                <th className="py-2 px-2 border-r border-slate-200 text-emerald-700">Reg Done</th>
                <th className="py-2 px-2 border-r border-slate-300 font-bold text-amber-800">Closing</th>

                {/* Today Columns */}
                <th className="py-2 px-2 border-r border-slate-200">Sale</th>
                <th className="py-2 px-2 border-r border-slate-300 text-emerald-700">Reg Done</th>

                <th className="py-2 px-2">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    No sub-dealers match your search filter.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((s) => {
                  const isDue = s.balance < 0;
                  const isAdvance = s.balance > 0;

                  return (
                    <tr
                      key={s.subDealerId}
                      onClick={() => setSelectedDealerId(s.subDealerId)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* S.No */}
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400 border-r border-slate-100">
                        {s.sNo}
                      </td>

                      {/* Dealer Name */}
                      <td className="py-2.5 px-3 text-left border-r border-slate-100">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {s.dealerName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-700">
                            {s.dealerCode}
                          </span>
                          <span>•</span>
                          <span>{s.city}</span>
                        </div>
                      </td>

                      {/* Balance (Matches Report.xlsx) */}
                      <td className="py-2.5 px-3 text-right font-mono font-black border-r border-slate-200 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isDue
                            ? "bg-amber-100 text-amber-900 border border-amber-200/60"
                            : isAdvance
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200/60"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {isDue ? `-₹${Math.abs(s.balance).toLocaleString("en-IN")}` : isAdvance ? `+₹${s.balance.toLocaleString("en-IN")}` : "₹0"}
                        </span>
                      </td>

                      {/* Stock & Sales Columns */}
                      <td className="py-2.5 px-2 font-mono text-slate-600 border-r border-slate-100">{s.stockSales.openStock || "—"}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 border-r border-slate-100">{s.stockSales.pur || "—"}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-blue-700 border-r border-slate-100">{s.stockSales.tra || "—"}</td>
                      <td className="py-2.5 px-2 font-mono text-amber-700 border-r border-slate-100">{s.stockSales.ret || "—"}</td>
                      <td className="py-2.5 px-2 font-mono text-purple-700 border-r border-slate-100">{s.stockSales.sale || "—"}</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-800 bg-emerald-50/50 border-r border-slate-200">
                        {s.stockSales.stock}
                      </td>

                      {/* Registration Columns */}
                      <td className="py-2.5 px-2 font-mono text-slate-600 border-r border-slate-100">{s.registration.open || "—"}</td>
                      <td className="py-2.5 px-2 font-mono text-slate-600 border-r border-slate-100">{s.registration.sale || "—"}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-emerald-600 border-r border-slate-100">{s.registration.regDone || "—"}</td>
                      <td className="py-2.5 px-2 font-mono font-black text-amber-900 border-r border-slate-200">
                        {s.registration.closing}
                      </td>

                      {/* Today Columns */}
                      <td className="py-2.5 px-2 font-mono text-slate-600 border-r border-slate-100">{s.today.sal || "—"}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-emerald-600 border-r border-slate-200">{s.today.regDone || "—"}</td>

                      {/* Action */}
                      <td className="py-2.5 px-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedDealerId(s.subDealerId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[11px] rounded-lg border border-blue-200 transition-colors shadow-2xs group-hover:border-blue-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Grand Total Row Matching Client's Report.xlsx */}
            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-[11px]">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-left font-black uppercase tracking-wider pl-4 border-r border-slate-300">
                  NETWORK CONSOLIDATED TOTAL ({summaries.length} OUTLETS)
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-900 border-r border-slate-300 whitespace-nowrap">
                  ₹{masterStats.netBalance.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-2 font-mono border-r border-slate-200">215</td>
                <td className="py-3 px-2 font-mono border-r border-slate-200">1</td>
                <td className="py-3 px-2 font-mono text-blue-800 border-r border-slate-200">159</td>
                <td className="py-3 px-2 font-mono text-amber-800 border-r border-slate-200">15</td>
                <td className="py-3 px-2 font-mono text-purple-800 border-r border-slate-200">223</td>
                <td className="py-3 px-3 font-mono text-emerald-900 bg-emerald-100 border-r border-slate-300">
                  {masterStats.totalStock}
                </td>
                <td className="py-3 px-2 font-mono border-r border-slate-200">45</td>
                <td className="py-3 px-2 font-mono border-r border-slate-200">223</td>
                <td className="py-3 px-2 font-mono text-emerald-800 border-r border-slate-200">203</td>
                <td className="py-3 px-2 font-mono text-amber-900 border-r border-slate-300">
                  {masterStats.totalPendingReg}
                </td>
                <td className="py-3 px-2 font-mono border-r border-slate-200">7</td>
                <td className="py-3 px-2 font-mono text-emerald-800 border-r border-slate-300">27</td>
                <td className="py-3 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ==================== MODAL 1: RECORD RECEIPT / LOAN PAYOUT ==================== */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Record Sub-Dealer Payment / Financier Payout
                </h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceipt} className="space-y-4 text-xs">
              {/* Sub-Dealer Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Sub-Dealer (YBC) *</label>
                <select
                  value={receiptForm.subDealerId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, subDealerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                >
                  <option value="">-- Choose Sub-Dealer --</option>
                  {summaries.map((s) => (
                    <option key={s.subDealerId} value={s.subDealerId}>
                      {s.dealerName} ({s.dealerCode}) — Balance: ₹{s.balance.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Receipt Type */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "FINANCE_PAYOUT", label: "Financier Loan Payout" },
                  { id: "BANK_RECEIPT", label: "Direct Bank RTGS" },
                  { id: "CASH", label: "Cash Receipt" },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setReceiptForm({ ...receiptForm, receiptType: t.id as any })}
                    className={`py-2 px-2 text-center rounded-xl font-bold border transition-colors ${
                      receiptForm.receiptType === t.id
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    value={receiptForm.date}
                    onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount Credited (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={receiptForm.amount}
                    onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields: Financier or Bank */}
              {receiptForm.receiptType === "FINANCE_PAYOUT" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Approved Financier</label>
                    <select
                      value={receiptForm.financierName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, financierName: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {DEFAULT_FINANCIERS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Customer Name (End-Buyer)</label>
                    <input
                      type="text"
                      placeholder="e.g. Adnan Khan"
                      value={receiptForm.customerName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, customerName: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              ) : receiptForm.receiptType === "BANK_RECEIPT" ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deposited Into Bank Account</label>
                  <select
                    value={receiptForm.bankName}
                    onChange={(e) => setReceiptForm({ ...receiptForm, bankName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {DEFAULT_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Reference / UTR */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reference / UTR / Cheque No (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RTGS-HDFC-99120 or LT-DISB-44"
                  value={receiptForm.referenceNo}
                  onChange={(e) => setReceiptForm({ ...receiptForm, referenceNo: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Narration</label>
                <input
                  type="text"
                  placeholder="e.g. Sub-dealer advance payment received"
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Post Receipt (Debit Entry)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: RECORD SPARES (SSI) / ADJUSTMENT ==================== */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Record Spares (`SSI`) Bill or Ledger Adjustment
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              {/* Sub-Dealer Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Sub-Dealer (YBC) *</label>
                <select
                  value={adjustmentForm.subDealerId}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, subDealerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                >
                  <option value="">-- Choose Sub-Dealer --</option>
                  {summaries.map((s) => (
                    <option key={s.subDealerId} value={s.subDealerId}>
                      {s.dealerName} ({s.dealerCode}) — Balance: ₹{s.balance.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Nature */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentForm({ ...adjustmentForm, nature: "CREDIT" })}
                  className={`py-2 px-3 text-center rounded-xl font-bold border transition-colors ${
                    adjustmentForm.nature === "CREDIT"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  Charge to Dealer (Credit)
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Spares bill, charges (increases due)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentForm({ ...adjustmentForm, nature: "DEBIT" })}
                  className={`py-2 px-3 text-center rounded-xl font-bold border transition-colors ${
                    adjustmentForm.nature === "DEBIT"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  Credit to Dealer (Debit)
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Incentive, discount (reduces due)</span>
                </button>
              </div>

              {/* Bill No & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bill / Invoice No (SSI No) *</label>
                  <input
                    type="text"
                    placeholder="e.g. SSI 355"
                    value={adjustmentForm.billNo}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, billNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 13629"
                    value={adjustmentForm.amount}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Entry Date *</label>
                <input
                  type="date"
                  value={adjustmentForm.date}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              {/* Particular */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Particular / Description *</label>
                <input
                  type="text"
                  placeholder="e.g. SPARES - Yamaha Genuine Parts Consignment"
                  value={adjustmentForm.particular}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, particular: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly consumables delivery via van"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xs"
                >
                  Post Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

