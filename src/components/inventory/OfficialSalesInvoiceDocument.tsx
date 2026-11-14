"use client";

import React from "react";
import Image from "next/image";
import { SalesInvoiceRecord } from "@/types/inventory";
import { ArrowLeft, Printer, Download, ShieldCheck, CheckCircle2, Bike, CreditCard, Building2, User } from "lucide-react";
import toast from "react-hot-toast";

interface OfficialSalesInvoiceDocumentProps {
  invoice: SalesInvoiceRecord;
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

export const OfficialSalesInvoiceDocument: React.FC<OfficialSalesInvoiceDocumentProps> = ({
  invoice,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!invoice) return;
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Customer Name",
      "Customer Phone",
      "Customer Address",
      "Customer City",
      "Model Name",
      "Model Code",
      "Color Variant",
      "Chassis Number (VIN)",
      "Engine Number",
      "Payment Mode",
      "Hypothecation Bank",
      "Loan Ref",
      "Ex-Showroom Taxable (INR)",
      "GST 28% (INR)",
      "RTO Charges (INR)",
      "Insurance (INR)",
      "Accessories (INR)",
      "Discount (INR)",
      "On-Road Total (INR)",
    ];

    const item = invoice.items[0] || {};
    const rows = [
      [
        invoice.invoiceNumber,
        invoice.invoiceDate ? invoice.invoiceDate.split("T")[0] : "",
        invoice.customerName,
        invoice.customerPhone,
        invoice.customerAddress,
        invoice.customerCity,
        item.modelName || "",
        item.modelCode || "",
        item.colorName || "",
        item.chassisNumber || "",
        item.engineNumber || "",
        invoice.paymentMode,
        invoice.financierName || "N/A",
        invoice.loanReference || "N/A",
        invoice.subtotal.toString(),
        invoice.taxAmount.toString(),
        (invoice.rtoCharges || 0).toString(),
        (invoice.insuranceCharges || 0).toString(),
        (invoice.productCharges || 0).toString(),
        invoice.discount.toString(),
        invoice.billValue.toString(),
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${invoice.invoiceNumber}_Sales_Invoice.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded sales invoice ${invoice.invoiceNumber} CSV!`);
  };

  const item = invoice.items[0] || {
    modelName: "Yamaha Fascino 125 Fi Hybrid DLX",
    modelCode: "DG51 / BGP4",
    colorName: "Metallic Red",
    chassisNumber: "ME1RG431000112",
    engineNumber: "EN1RG431000112",
  };

  const exShowroomBase = invoice.subtotal || 70000;
  const gstAmount = invoice.taxAmount || Math.round(exShowroomBase * 0.28);
  const exShowroomTotal = exShowroomBase + gstAmount;
  const rtoTax = invoice.rtoCharges || 9500;
  const insuranceAmount = invoice.insuranceCharges || 5400;
  const accessoryAmount = invoice.productCharges || 4890;
  const extendedWarranty = invoice.extendedWarrantyCharges || 1850;
  const discountAmount = invoice.discount || 1500;
  const grandTotal = invoice.billValue || (exShowroomTotal + rtoTax + insuranceAmount + accessoryAmount + extendedWarranty - discountAmount);

  // Compute 1st free service due date (30 days from invoice date)
  const invoiceDateObj = invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date();
  const firstServiceDue = new Date(invoiceDateObj);
  firstServiceDue.setDate(firstServiceDue.getDate() + 30);
  const formattedFirstServiceDue = firstServiceDue.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Invoices List</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {invoice.invoiceNumber}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              • Gate Pass: <span className="font-bold text-slate-800 font-mono">{invoice.gatePassNumber || `GP-${invoice.invoiceNumber.slice(-4)}`}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden lg:inline">
              • Buyer: <span className="font-bold text-slate-800">{invoice.customerName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl border border-emerald-600 transition-colors shadow-2xs cursor-pointer"
            title="Download Invoice Data as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          {/* Print / Save PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-600/25 transition-all cursor-pointer"
            title="Print Official Tax Invoice & Gate Pass"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Official Tax Invoice & Gate Pass Document Container (Directly on Dashboard Canvas) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0 print:space-y-4">
        
        {/* Dealership Header & Logo */}
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

            {/* Dealership Legal Details */}
            <div className="text-left sm:text-right text-[11px] text-slate-600 leading-snug">
              <div className="font-black text-slate-900 text-sm tracking-wide">
                MARUTHI MOTORS YAMAHA (HQ)
              </div>
              <div className="text-[10px] text-blue-700 font-bold">
                Authorized Main Dealer • India Yamaha Motor Pvt. Ltd.
              </div>
              <div className="text-[10.5px] text-slate-500 mt-0.5">
                Main Showroom & Delivery Hub: Tirupattur - 635601, Tamil Nadu
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
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                Vehicle Tax Invoice, Sale Certificate (Form 21) & Delivery Gate Pass
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 font-mono">
              Statutory Reference: Rule 47/48 CMVR 1989 / HSN 8711
            </div>
          </div>
        </div>

        {/* Metadata Parameters Grid (Uniform Balanced Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Invoice Number
            </span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Invoice Date
            </span>
            <span className="font-bold text-slate-800">
              {invoice.invoiceDate ? invoice.invoiceDate.split("T")[0] : new Date().toISOString().split("T")[0]}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Delivery Gate Pass No
            </span>
            <span className="font-mono font-bold text-slate-900">
              {invoice.gatePassNumber || `GP-${invoice.invoiceNumber.slice(-4)}`}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Issuing Showroom
            </span>
            <span className="font-bold text-slate-800 truncate block">
              {invoice.branchName || "Tirupattur Main Showroom (HQ)"}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Customer Full Name
            </span>
            <span className="font-bold text-slate-900 text-xs">
              {invoice.customerName}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Contact & Aadhaar
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs">
              {invoice.customerPhone}
            </span>
            {invoice.customerAadhaar && (
              <span className="text-[10px] text-slate-500 font-mono">UID: {invoice.customerAadhaar}</span>
            )}
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Payment Settlement
            </span>
            <span className="font-bold text-blue-700">
              {invoice.paymentMode === "FINANCE" ? "Hypothecated (Loan)" : invoice.paymentMode}
            </span>
          </div>

          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 min-h-[66px] flex flex-col justify-center">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Financier / Loan Ref
            </span>
            <span className="font-semibold text-slate-800 text-xs truncate">
              {invoice.isHypothecated ? `${invoice.financierName || "Bank Loan"} (${invoice.loanReference || "Verified"})` : "Full Settlement (Paid)"}
            </span>
          </div>
        </div>

        {/* Vehicle Identity & Technical Specifications Block */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-blue-600" />
              <span>Vehicle Physical Identification (CMVR Form 21 Particulars)</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              PDI Passed & ODO Verified (0-5 km)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Model & Variant</span>
              <span className="font-bold text-slate-900 text-xs">{item.modelName}</span>
              <span className="text-[10px] text-slate-500 block">Code: {item.modelCode || "DG51"}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Color Variant</span>
              <span className="font-bold text-slate-800 text-xs">{item.colorName || "Standard"}</span>
              <span className="text-[10px] text-slate-500 block">Class: Two-Wheeler (Motorcycle)</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Chassis Number (VIN)</span>
              <span className="font-mono font-black text-blue-900 text-xs">{item.chassisNumber}</span>
              <span className="text-[10px] text-slate-500 block">Stamped on Headstock</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Engine Number</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{item.engineNumber}</span>
              <span className="text-[10px] text-slate-500 block">Stamped on Crankcase</span>
            </div>
          </div>
        </div>

        {/* Statutory Pricing Allocation Table (Itemized On-Road Matrix) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Commercial Pricing Allocation & Statutory Tax Breakup
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
                  <th className="py-2.5 px-3">Price Allocation Component</th>
                  <th className="py-2.5 px-3">Statutory Classification</th>
                  <th className="py-2.5 px-3 text-center">HSN / SAC</th>
                  <th className="py-2.5 px-3 text-right">Applicable Tax</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">1</td>
                  <td className="py-2 px-3 font-bold text-slate-900">
                    Vehicle Ex-Showroom Base Cost
                    <span className="block text-[10px] text-slate-500 font-normal">{item.modelName} ({item.colorName})</span>
                  </td>
                  <td className="py-2 px-3 text-slate-600">Taxable Motor Vehicle Base</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">8711</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">—</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                    ₹{exShowroomBase.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">2</td>
                  <td className="py-2 px-3 font-bold text-slate-900">
                    GST on Motor Vehicle (CGST 14% + SGST 14%)
                  </td>
                  <td className="py-2 px-3 text-slate-600">Statutory Goods Tax</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">8711</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">28.00%</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                    ₹{gstAmount.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="bg-slate-50/70 font-semibold">
                  <td colSpan={5} className="py-2 px-3 text-right uppercase tracking-wider font-sans text-[11px] text-slate-700">
                    Total Ex-Showroom Price:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                    ₹{exShowroomTotal.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">3</td>
                  <td className="py-2 px-3 text-slate-800">
                    Tamil Nadu RTO Life Time Road Tax (LTT) + Smart Card + HSRP Plate
                  </td>
                  <td className="py-2 px-3 text-slate-500">Government Pass-Through Fee</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">9991</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">NIL (Govt)</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ₹{rtoTax.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">4</td>
                  <td className="py-2 px-3 text-slate-800">
                    Vehicle Insurance Policy (1 Year Comprehensive + 5 Years Third Party)
                  </td>
                  <td className="py-2 px-3 text-slate-500">Insurance Remittance</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">9971</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">18% Incl.</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ₹{insuranceAmount.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">5</td>
                  <td className="py-2 px-3 text-slate-800">
                    Mandatory Safety Kit & Fitments (ISI Helmet, Crash Guard, Mirrors, Teflon)
                  </td>
                  <td className="py-2 px-3 text-slate-500">Accessories Package</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">8714</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">18% / 28%</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ₹{accessoryAmount.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-center font-bold text-slate-400">6</td>
                  <td className="py-2 px-3 text-slate-800">
                    Yamaha Shield Extended Warranty (Total 5 Years) & 24x7 Roadside Assistance
                  </td>
                  <td className="py-2 px-3 text-slate-500">Extended Service Contract</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600">9987</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">18% Incl.</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    ₹{extendedWarranty.toLocaleString("en-IN")}
                  </td>
                </tr>

                {discountAmount > 0 && (
                  <tr className="hover:bg-slate-50/50 text-red-600">
                    <td className="py-2 px-3 text-center font-bold">7</td>
                    <td className="py-2 px-3 font-semibold">
                      Less: Dealership Festive / Booking Scheme Discount
                    </td>
                    <td className="py-2 px-3">Commercial Concession</td>
                    <td className="py-2 px-3 text-center font-mono">—</td>
                    <td className="py-2 px-3 text-right font-mono">—</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      -₹{discountAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot className="border-t border-slate-200">
                <tr className="bg-emerald-50/70 border-t border-emerald-200 text-emerald-950 font-black text-sm">
                  <td colSpan={5} className="py-2.5 px-3 text-right uppercase font-sans text-xs text-emerald-900">
                    Net On-Road Settlement Value (₹):
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-emerald-700">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[9.5px] tracking-wider block mb-0.5">
            Total Amount in Words:
          </span>
          <span className="font-bold text-slate-900 italic">
            {numberToWords(grandTotal)}
          </span>
        </div>

        {/* 1st Free Service & Warranty Activation Card */}
        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-black text-blue-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Yamaha India 1st Free Service Activation</span>
            </span>
            <p className="text-slate-600 text-[11px]">
              Coupon #1 Valid at any authorized Maruthi Motors Yamaha Workshop until:{" "}
              <span className="font-bold text-slate-900">{formattedFirstServiceDue}</span> (or 1,000 km, whichever is earlier).
            </p>
          </div>
          <div className="text-right font-mono text-blue-900 font-bold shrink-0">
            Coupon Status: <span className="text-emerald-700">ACTIVE</span>
          </div>
        </div>

        {/* Delivery Handover Checklist */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
            Customer Delivery Handover Verification:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2 Original Keys
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tool Kit & First Aid Kit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Battery Warranty Card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Owner's Manual & Service Book
            </span>
          </div>
        </div>

        {/* Signatures & Legal Endorsement Block */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
              [Vehicle Handover Accepted]
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Customer / Purchaser</span>
              <span className="text-[10px] text-slate-500">Acknowledging Delivery in Good Order</span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-slate-400 text-xs">
              [PDI Certified & Gate Pass Issued]
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Sales Executive / PDI Officer</span>
              <span className="text-[10px] text-slate-500">Vehicle Inspected & Released</span>
            </div>
          </div>

          <div className="space-y-10">
            <div className="h-10 flex items-end justify-center font-serif italic text-emerald-800 font-bold text-xs">
              Maruthi Motors Yamaha
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <span className="font-bold text-slate-900 block text-xs">Authorized Signatory</span>
              <span className="text-[10px] text-slate-500">Dealership Management</span>
            </div>
          </div>
        </div>

        {/* Footer legal note */}
        <div className="text-[9.5px] text-slate-400 text-center pt-2 border-t border-slate-100">
          This document serves as an Official Tax Invoice under GST Rule 48, Sale Certificate under Form 21 of CMVR 1989, and Security Delivery Gate Pass for Maruthi Motors Yamaha Dealership Network.
        </div>
      </div>
    </div>
  );
};

