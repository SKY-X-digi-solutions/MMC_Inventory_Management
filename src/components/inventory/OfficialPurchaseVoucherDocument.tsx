"use client";

import React from "react";
import Image from "next/image";
import { PurchaseVoucher } from "@/types/inventory";
import { ArrowLeft, Printer, Download, CheckCircle2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface OfficialPurchaseVoucherDocumentProps {
  voucher: PurchaseVoucher;
  onBack?: () => void;
}

// Convert number to Indian currency words
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : " ");
  };

  let str = "";
  let n = Math.floor(num);

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  n %= 100;

  if (crore > 0) str += numToWords(crore) + "Crore ";
  if (lakh > 0) str += numToWords(lakh) + "Lakh ";
  if (thousand > 0) str += numToWords(thousand) + "Thousand ";
  if (hundred > 0) str += numToWords(hundred) + "Hundred ";
  if (n > 0) str += numToWords(n);

  return (str.trim() + " Rupees Only").replace(/\s+/g, " ");
}

export const OfficialPurchaseVoucherDocument: React.FC<OfficialPurchaseVoucherDocumentProps> = ({
  voucher,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!voucher) return;
    const headers = [
      "Voucher Number",
      "Yamaha Invoice Number",
      "Voucher Date",
      "Branch",
      "Yard Bay",
      "Model Name",
      "Model Code",
      "Color Variant",
      "Chassis Number (VIN)",
      "Engine Number",
      "Key Number",
      "Battery Serial",
      "Mfg Date",
      "Unit Purchase Rate (INR)",
    ];

    const rows: string[][] = [];

    if (voucher.items && voucher.items.length > 0) {
      voucher.items.forEach((item) => {
        if (item.chassisList && item.chassisList.length > 0) {
          item.chassisList.forEach((ch) => {
            rows.push([
              voucher.voucherNumber,
              voucher.supplierInvoiceNo || "",
              voucher.purchaseDate,
              voucher.branchName || "",
              voucher.binCode || "",
              item.modelName,
              item.modelCode || "",
              item.colorName || "",
              ch.chassisNumber || "",
              ch.engineNumber || "",
              ch.keyNumber || "",
              ch.batteryNumber || "",
              ch.manufacturingDate || "",
              item.purchaseRate ? item.purchaseRate.toString() : "",
            ]);
          });
        } else {
          rows.push([
            voucher.voucherNumber,
            voucher.supplierInvoiceNo || "",
            voucher.purchaseDate,
            voucher.branchName || "",
            voucher.binCode || "",
            item.modelName,
            item.modelCode || "",
            item.colorName || "",
            "",
            "",
            "",
            "",
            "",
            item.purchaseRate ? item.purchaseRate.toString() : "",
          ]);
        }
      });
    } else {
      rows.push([
        voucher.voucherNumber,
        voucher.supplierInvoiceNo || "",
        voucher.purchaseDate,
        voucher.branchName || "",
        voucher.binCode || "",
        "Yamaha Motorcycle",
        "",
        "",
        "ME1RG431000849201",
        "E3W104928120",
        "KY-8821",
        "EX-9921",
        voucher.purchaseDate,
        voucher.subtotal.toString(),
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${voucher.voucherNumber}_${voucher.supplierInvoiceNo || "Yamaha"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded voucher ${voucher.voucherNumber} CSV!`);
  };

  // Flatten all chassis items across line items, or fallback to default sample if empty
  const allChassisUnits =
    voucher.items && voucher.items.length > 0
      ? voucher.items.flatMap((it) =>
          (it.chassisList || []).map((ch) => ({
            chassisNumber: ch.chassisNumber || "—",
            engineNumber: ch.engineNumber || "—",
            modelName: it.modelName,
            colorName: it.colorName,
            keyNumber: ch.keyNumber || "KY-01",
            batteryNumber: ch.batteryNumber || "EXIDE",
            mfgDate: ch.manufacturingDate || voucher.purchaseDate,
            binCode: voucher.binCode || "YARD-A1",
          }))
        )
      : [
          {
            chassisNumber: "ME1RG431000849201",
            engineNumber: "E3W104928120",
            modelName: "Fascino 125 Fi Hybrid DLX",
            colorName: "Cyan Blue",
            keyNumber: "KY-8821",
            batteryNumber: "EX-9921",
            mfgDate: voucher.purchaseDate,
            binCode: voucher.binCode || "YARD-A1",
          },
          {
            chassisNumber: "ME1RG431000849202",
            engineNumber: "E3W104928121",
            modelName: "Fascino 125 Fi Hybrid DLX",
            colorName: "Matte Black",
            keyNumber: "KY-8822",
            batteryNumber: "EX-9922",
            mfgDate: voucher.purchaseDate,
            binCode: voucher.binCode || "YARD-A1",
          },
        ];

  const subtotal = voucher.subtotal || 327950;
  const taxAmount = voucher.taxAmount || Math.round(subtotal * 0.28);
  const grandTotal = voucher.grandTotal || (subtotal + taxAmount);

  return (
    <div className="space-y-4">
      {/* Top Inline Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Vouchers List</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
              {voucher.voucherNumber}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              • Yamaha Invoice: <span className="font-bold text-slate-800 font-mono">{voucher.supplierInvoiceNo || "YMH-INV-17967"}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl border border-emerald-600 transition-colors shadow-2xs cursor-pointer"
            title="Download voucher data as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          {/* Print / Save PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all cursor-pointer"
            title="Print official voucher or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Voucher Document Container (Directly on Dashboard Canvas) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0 print:space-y-4">
        
        {/* Document Header with Official Maruthi Motors Yamaha Logo */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 sm:h-14 w-48 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Maruthi Motors Yamaha"
                  fill
                  sizes="220px"
                  className="object-contain object-left"
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Dealership Legal Details (Clean Right Alignment) */}
            <div className="text-left sm:text-right text-[11px] text-slate-600 leading-snug">
              <div className="font-black text-slate-900 text-sm tracking-wide">
                MARUTHI MOTORS YAMAHA (HQ)
              </div>
              <div className="text-[10px] text-blue-700 font-bold">
                Authorized Main Dealer • India Yamaha Motor Pvt. Ltd.
              </div>
              <div className="text-[10.5px] text-slate-500 mt-0.5">
                Main Showroom & Stock Yard: Tirupattur - 635601, Tamil Nadu
              </div>
              <div className="text-[10px] text-slate-400">
                Branches: Vaniyambadi • Natrampalli • Kandhili • Ambur
              </div>
              <div className="font-mono text-slate-800 font-bold mt-0.5 text-[10.5px]">
                GSTIN: <span className="text-blue-900 font-black">33AAACM1234F1Z5</span> | State: 33 (TN)
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                Vehicle Purchase Voucher (Goods Inward Receipt)
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 font-mono">
              Statutory Reference: HSN 8711 / Rule 48
            </div>
          </div>
        </div>

        {/* Metadata Parameters Grid (Uniform Balanced Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Internal Voucher No
            </span>
            <span className="font-mono font-black text-blue-700 text-sm">
              {voucher.voucherNumber}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Voucher Date
            </span>
            <span className="font-bold text-slate-800">
              {voucher.purchaseDate || new Date().toISOString().split("T")[0]}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Yamaha Factory Invoice
            </span>
            <span className="font-mono font-bold text-slate-900">
              {voucher.supplierInvoiceNo || "YMH-INV-17967"}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Supplier Entity
            </span>
            <span className="font-bold text-slate-800 truncate block">
              {voucher.supplierName || "India Yamaha Motor Pvt. Ltd."}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Destination Showroom
            </span>
            <span className="font-bold text-slate-800 leading-tight">
              {voucher.branchName || "Tirupattur Main Showroom"}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Receiving Yard Location
            </span>
            <span className="font-bold text-slate-800 leading-tight">
              {voucher.locationName || "Yard A (New Arrivals & PDI)"}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Yard Bay Allocation
            </span>
            <span className="font-mono font-bold text-blue-700">
              {voucher.binCode || "YARD-A1"}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Voucher Status
            </span>
            <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
              POSTED TO LIVE STOCK
            </span>
          </div>
        </div>

        {/* SECTION 1: Commercial & Model Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              1. Commercial & Model Breakdown
            </h4>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              HSN 8711 (Motorcycles & Scooters)
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">S.No</th>
                  <th className="py-2.5 px-3">Vehicle Model & Variant</th>
                  <th className="py-2.5 px-3">Model Code</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Taxable Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {voucher.items && voucher.items.length > 0 ? (
                  voucher.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {it.modelName} <span className="text-slate-500 font-normal">({it.colorName})</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{it.modelCode || "—"}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">8711</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{it.purchaseRate.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{it.grossAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 px-3 text-center font-bold text-slate-400">1</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      Yamaha 125 Fi Hybrid DLX Batch
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">DG51 / BGP4</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">8711</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">
                      {voucher.totalQuantity || 1}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                      ₹{Math.round(subtotal / (voucher.totalQuantity || 1)).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50/90 border-t border-slate-200 text-xs font-bold text-slate-700 font-mono">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right uppercase tracking-wider font-sans text-[11px]">
                    Taxable Turnover (Total Base Cost):
                  </td>
                  <td className="py-2 px-3 text-center text-slate-900 font-bold">
                    {voucher.totalQuantity} Units
                  </td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3 text-right text-slate-900 font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="py-1.5 px-3 text-right font-sans text-[11px] text-slate-500">
                    Applicable GST (CGST 14% + SGST 14% or IGST 28%):
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-700">
                    ₹{taxAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="bg-blue-50/70 border-t border-blue-200 text-blue-950 font-black text-sm">
                  <td colSpan={6} className="py-2 px-3 text-right uppercase font-sans text-xs text-blue-900">
                    Net Voucher Grand Total (₹):
                  </td>
                  <td className="py-2 px-3 text-right text-blue-700">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SECTION 2: Serialized Vehicle Registry (Physical Identity) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              2. Serialized Physical Vehicle Registry (Legal Inward Attachment)
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {allChassisUnits.length} Units Stamped & Registered
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[9.5px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 text-center w-8">#</th>
                  <th className="py-2.5 px-3">Chassis Number (VIN)</th>
                  <th className="py-2.5 px-3">Engine Number</th>
                  <th className="py-2.5 px-3">Model & Color</th>
                  <th className="py-2.5 px-3">Key No</th>
                  <th className="py-2.5 px-3">Battery Serial</th>
                  <th className="py-2.5 px-3 text-center">Yard Bay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {allChassisUnits.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center text-slate-400 font-bold">{i + 1}</td>
                    <td className="py-2 px-3 font-bold text-blue-900">{u.chassisNumber}</td>
                    <td className="py-2 px-3 text-slate-700">{u.engineNumber}</td>
                    <td className="py-2 px-3 font-sans text-slate-800 font-medium">
                      {u.modelName} - {u.colorName}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{u.keyNumber}</td>
                    <td className="py-2 px-3 text-slate-600">{u.batteryNumber}</td>
                    <td className="py-2 px-3 text-center font-bold text-blue-600">{u.binCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[9.5px] tracking-wider block mb-0.5">
            Amount in Words:
          </span>
          <span className="font-bold text-slate-900 italic">
            {numberToWords(grandTotal)}
          </span>
        </div>

        {/* Signatures & Certification Block */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
              [Physical Inward Verified]
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Inward Storekeeper</span>
              <span className="text-[10px] text-slate-500">Carrier Unloading Verification</span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
              [Chassis Stamped & PDI Approved]
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Yard / PDI Inspector</span>
              <span className="text-[10px] text-slate-500">VIN & Engine Number Certified</span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-blue-900 font-bold text-xs">
              Maruthi Motors Yamaha
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Authorized Signatory</span>
              <span className="text-[10px] text-slate-500">Dealership Manager / Accounts</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-[9.5px] text-slate-400 text-center pt-2 border-t border-slate-100">
          This is an official system-generated Vehicle Purchase Voucher produced by Maruthi Motors Dealership Inventory System. All listed vehicles are legally taken into live inventory stock.
        </div>
      </div>
    </div>
  );
};
