import {
  SubDealerLedgerEntry,
  YbcDealerSummary,
  LedgerTransactionType,
  TransferRecord,
} from "@/types/inventory";
import { DEFAULT_SUB_DEALERS } from "./modelCatalog.service";

const STORAGE_KEYS = {
  YBC_SUMMARIES: "mmc_ybc_summaries_v1",
  LEDGER_ENTRIES: "mmc_subdealer_ledger_entries_v1",
};

export const INITIAL_YBC_SUMMARIES: YbcDealerSummary[] = [
  {
    sNo: 1,
    subDealerId: "SD-KND",
    dealerCode: "KND",
    dealerName: "Kandhili Sub-Dealer",
    city: "Kandhili",
    rtoZone: "Tirupattur / Kandhili",
    contactPerson: "K. Mohan",
    mobile: "+91 94432 78901",
    balance: -40976,
    stockSales: { openStock: 6, pur: 0, tra: 9, ret: 4, sale: 3, stock: 8 },
    registration: { open: 0, sale: 3, regDone: 3, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 2,
    subDealerId: "SD-AMBUR",
    dealerCode: "AMBUR",
    dealerName: "Muthu Auto Agency - Ambur",
    city: "Ambur",
    rtoZone: "Vaniyambadi / Ambur",
    contactPerson: "A. Muthu",
    mobile: "+91 94432 89012",
    balance: 1030257,
    stockSales: { openStock: 17, pur: 0, tra: 14, ret: 2, sale: 13, stock: 16 },
    registration: { open: 3, sale: 13, regDone: 5, closing: 11 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 3,
    subDealerId: "SD-SVM-NTP",
    dealerCode: "SVM-NTP",
    dealerName: "SVM Motors - Natrampalli",
    city: "Natrampalli",
    rtoZone: "Tirupattur / Natrampalli",
    contactPerson: "S. Venkatesan",
    mobile: "+91 94432 67890",
    balance: -51252,
    stockSales: { openStock: 7, pur: 0, tra: 16, ret: 4, sale: 12, stock: 7 },
    registration: { open: 0, sale: 12, regDone: 10, closing: 2 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 1 },
  },
  {
    sNo: 4,
    subDealerId: "SD-KUPPAM",
    dealerCode: "KUPPAM",
    dealerName: "Kuppam Two Wheeler Agency",
    city: "Kuppam",
    rtoZone: "Kuppam / AP Border",
    contactPerson: "P. Ramesh",
    mobile: "+91 94432 12345",
    balance: -519993,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 5,
    subDealerId: "SD-VELLORE",
    dealerCode: "VELLORE",
    dealerName: "Vedha Motors - Vellore",
    city: "Vellore",
    rtoZone: "Vellore RTO",
    contactPerson: "V. Shankar",
    mobile: "+91 94432 23456",
    balance: -56089,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 2, sale: 0, regDone: 0, closing: 2 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 6,
    subDealerId: "SD-ARAKK",
    dealerCode: "ARAKK",
    dealerName: "Arakkonam Yamaha Center",
    city: "Arakkonam",
    rtoZone: "Ranipet / Arakkonam",
    contactPerson: "R. Mani",
    mobile: "+91 94432 34567",
    balance: -16149,
    stockSales: { openStock: 0, pur: 1, tra: 1, ret: 0, sale: 1, stock: 0 },
    registration: { open: 0, sale: 1, regDone: 0, closing: 1 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 7,
    subDealerId: "SD-KRIS",
    dealerCode: "KRIS",
    dealerName: "Sri Muthu Auto Agency - Krishnagiri",
    city: "Krishnagiri",
    rtoZone: "Krishnagiri RTO",
    contactPerson: "M. Kumar",
    mobile: "+91 94432 45678",
    balance: 13661,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 8,
    subDealerId: "SD-PS-HOSUR",
    dealerCode: "PS-HOSUR",
    dealerName: "P.S. Motors - Hosur",
    city: "Hosur",
    rtoZone: "Hosur RTO",
    contactPerson: "P. Sundaram",
    mobile: "+91 94432 56789",
    balance: -1858784,
    stockSales: { openStock: 126, pur: 0, tra: 95, ret: 1, sale: 99, stock: 121 },
    registration: { open: 18, sale: 99, regDone: 83, closing: 34 },
    today: { pur: 0, sal: 7, tra: 0, ret: 0, regDone: 18 },
  },
  {
    sNo: 9,
    subDealerId: "SD-DHARMAPURI",
    dealerCode: "DHARMAPURI",
    dealerName: "Sri Muthu Auto Agencies - Dharmapuri",
    city: "Dharmapuri",
    rtoZone: "Dharmapuri RTO",
    contactPerson: "D. Senthil",
    mobile: "+91 94432 67891",
    balance: 91,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 10,
    subDealerId: "SD-CSK",
    dealerCode: "CSK MOTORS",
    dealerName: "CSK Motors - Tirupattur",
    city: "Tirupattur",
    rtoZone: "Tirupattur RTO",
    contactPerson: "C. Sivakumar",
    mobile: "+91 94432 78912",
    balance: 0,
    stockSales: { openStock: 1, pur: 0, tra: 0, ret: 0, sale: 0, stock: 1 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 11,
    subDealerId: "SD-MAHAVEER",
    dealerCode: "MAHAVEER",
    dealerName: "Mahaveer Motors - Tiruvannamalai",
    city: "Tiruvannamalai",
    rtoZone: "Tiruvannamalai RTO",
    contactPerson: "M. Paras",
    mobile: "+91 94432 89023",
    balance: 0,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 12,
    subDealerId: "SD-GUD",
    dealerCode: "GUD",
    dealerName: "Gudiyatham Bike Agency",
    city: "Gudiyatham",
    rtoZone: "Gudiyatham / Vellore",
    contactPerson: "G. Anand",
    mobile: "+91 94432 90134",
    balance: 1,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 1, sale: 0, regDone: 0, closing: 1 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 13,
    subDealerId: "SD-PENN",
    dealerCode: "PENN",
    dealerName: "Pennagaram Auto Agency",
    city: "Pennagaram",
    rtoZone: "Dharmapuri / Pennagaram",
    contactPerson: "P. Murugan",
    mobile: "+91 94432 01245",
    balance: 21741,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 14,
    subDealerId: "SD-POCH",
    dealerCode: "POCH",
    dealerName: "Pochampalli Two Wheelers",
    city: "Pochampalli",
    rtoZone: "Krishnagiri / Pochampalli",
    contactPerson: "K. Ravi",
    mobile: "+91 94432 12356",
    balance: -6082,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 15,
    subDealerId: "SD-KVP",
    dealerCode: "KVP",
    dealerName: "Kaveripattinam Motors",
    city: "Kaveripattinam",
    rtoZone: "Krishnagiri / KVP",
    contactPerson: "S. Velu",
    mobile: "+91 94432 23467",
    balance: -9010,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 16,
    subDealerId: "SD-ALANG",
    dealerCode: "ALANG",
    dealerName: "Gokul Motors - Alangayam",
    city: "Alangayam",
    rtoZone: "Vaniyambadi / Alangayam",
    contactPerson: "G. Gokul",
    mobile: "+91 94432 34578",
    balance: -8981,
    stockSales: { openStock: 0, pur: 0, tra: 1, ret: 0, sale: 1, stock: 0 },
    registration: { open: 1, sale: 1, regDone: 0, closing: 2 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 17,
    subDealerId: "SD-WALAJA",
    dealerCode: "WALAJA",
    dealerName: "Vishal Auto Agency - Walaja",
    city: "Walajapet",
    rtoZone: "Ranipet / Walaja",
    contactPerson: "V. Vishal",
    mobile: "+91 94432 45689",
    balance: -5659,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 18,
    subDealerId: "SD-GURU-POCH",
    dealerCode: "GURU-POCH",
    dealerName: "Guru Motors - Pochampalli",
    city: "Pochampalli",
    rtoZone: "Krishnagiri / Pochampalli",
    contactPerson: "G. Palani",
    mobile: "+91 94432 56790",
    balance: 89145,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 19,
    subDealerId: "SD-GURU-BARGUR",
    dealerCode: "GURU-BARGUR",
    dealerName: "Guru Motors - Bargur",
    city: "Bargur",
    rtoZone: "Krishnagiri / Bargur",
    contactPerson: "B. Balaji",
    mobile: "+91 94432 67801",
    balance: 3475,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 20,
    subDealerId: "SD-KARIMANGALAM",
    dealerCode: "KARIMANGALAM",
    dealerName: "Karimangalam Auto Agency",
    city: "Karimangalam",
    rtoZone: "Dharmapuri / Karimangalam",
    contactPerson: "K. Elango",
    mobile: "+91 94432 78912",
    balance: -1561,
    stockSales: { openStock: 0, pur: 0, tra: 0, ret: 0, sale: 0, stock: 0 },
    registration: { open: 0, sale: 0, regDone: 0, closing: 0 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 0 },
  },
  {
    sNo: 21,
    subDealerId: "SD-TPT",
    dealerCode: "TPT",
    dealerName: "Tirupattur Main Showroom (HQ)",
    city: "Tirupattur",
    rtoZone: "Tirupattur TN-83",
    contactPerson: "P. Rajan",
    mobile: "+91 94432 89023",
    balance: 0,
    stockSales: { openStock: 52, pur: 199, tra: 0, ret: 0, sale: 76, stock: 32 },
    registration: { open: 19, sale: 76, regDone: 88, closing: 7 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 6 },
  },
  {
    sNo: 22,
    subDealerId: "SD-VNB",
    dealerCode: "VNB",
    dealerName: "Vaniyambadi Branch Showroom",
    city: "Vaniyambadi",
    rtoZone: "Vaniyambadi TN-83Y",
    contactPerson: "N. Vignesh",
    mobile: "+91 94432 90134",
    balance: 0,
    stockSales: { openStock: 6, pur: 0, tra: 23, ret: 4, sale: 18, stock: 7 },
    registration: { open: 1, sale: 18, regDone: 14, closing: 5 },
    today: { pur: 0, sal: 0, tra: 0, ret: 0, regDone: 2 },
  },
];

export const INITIAL_SUBDEALER_LEDGER_ENTRIES: SubDealerLedgerEntry[] = [
  // ==================== MUTHU AUTO AGENCY - AMBUR ====================
  {
    entryId: "LED-AMB-001",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-01-01",
    particular: "OPENING BALANCE 2024",
    transactionType: "OPENING_BALANCE",
    billNo: "OB-2024",
    debit: 0,
    credit: 7918,
    runningBalance: -7918,
    notes: "Opening credit carried forward from 2023 accounts",
    createdAt: "2024-01-01T09:00:00Z",
  },
  {
    entryId: "LED-AMB-002",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-02-02",
    particular: "SPARES - Yamaha Genuine Parts Consignment",
    transactionType: "SPARES_BILL",
    billNo: "SSI 312",
    debit: 0,
    credit: 13629,
    runningBalance: -21547,
    notes: "Spare parts dispatch invoice SSI 312",
    createdAt: "2024-02-02T11:30:00Z",
  },
  {
    entryId: "LED-AMB-003",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-02-14",
    particular: "SPARES - Consumables & Fast Moving Kits",
    transactionType: "SPARES_BILL",
    billNo: "SSI 324",
    debit: 0,
    credit: 3516,
    runningBalance: -25063,
    notes: "Spares invoice SSI 324",
    createdAt: "2024-02-14T15:20:00Z",
  },
  {
    entryId: "LED-AMB-004",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-03-01",
    particular: "HDFC BANK - RECEIVED DIRECT RTGS",
    transactionType: "BANK_RECEIPT",
    bankName: "HDFC Bank",
    referenceNo: "RTGS-HDFC-99120",
    debit: 17144,
    credit: 0,
    runningBalance: -7919,
    notes: "Sub-dealer direct RTGS receipt into HDFC",
    createdAt: "2024-03-01T10:15:00Z",
  },
  {
    entryId: "LED-AMB-005",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-03-02",
    particular: "R15 OBD II - ME1RG67L1R0020973",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1RG67L1R0020973",
    modelCode: "BPD7",
    billNo: "TRF-AMB-101",
    debit: 0,
    credit: 207181,
    runningBalance: -215100,
    notes: "Vehicle transferred to Ambur showroom",
    createdAt: "2024-03-02T14:00:00Z",
  },
  {
    entryId: "LED-AMB-006",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-03-05",
    particular: "RAY ZR SR DISC OBD II - ME1SEK772R0045451",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1SEK772R0045451",
    modelCode: "BKX7",
    billNo: "TRF-AMB-102",
    debit: 0,
    credit: 105778,
    runningBalance: -320878,
    notes: "Scooter dispatch to Ambur showroom",
    createdAt: "2024-03-05T12:00:00Z",
  },
  {
    entryId: "LED-AMB-007",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-03-08",
    particular: "FASCINO DISC SPL OBD II - ME1SEK741R0027350",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1SEK741R0027350",
    modelCode: "BGPH",
    billNo: "TRF-AMB-103",
    debit: 0,
    credit: 103047,
    runningBalance: -423925,
    notes: "Fascino special edition unit transfer",
    createdAt: "2024-03-08T16:10:00Z",
  },
  {
    entryId: "LED-AMB-008",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-03-20",
    particular: "ADNAN KHAN - SHRIRAM FINANCE PAYOUT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "Shriram Finance",
    customerName: "Adnan Khan",
    referenceNo: "SHR-PAY-44129",
    debit: 103395,
    credit: 0,
    runningBalance: -320530,
    notes: "Customer vehicle finance payout credited directly to Maruthi account",
    createdAt: "2024-03-20T17:00:00Z",
  },
  {
    entryId: "LED-AMB-009",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-04-05",
    particular: "G. SHAJAHAN - KOTAK MAHINDRA PAYOUT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "Kotak Mahindra Prime",
    customerName: "G. Shajahan",
    referenceNo: "KOTAK-DISB-7721",
    debit: 196138,
    credit: 0,
    runningBalance: -124392,
    notes: "Kotak finance payout credited for customer loan",
    createdAt: "2024-04-05T11:45:00Z",
  },
  {
    entryId: "LED-AMB-010",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2024-04-12",
    particular: "D. DHAYALAN - SHRIRAM FINANCE PAYOUT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "Shriram Finance",
    customerName: "D. Dhayalan",
    referenceNo: "SHR-PAY-8812",
    debit: 111095,
    credit: 0,
    runningBalance: -13297,
    notes: "Shriram loan disbursement",
    createdAt: "2024-04-12T14:30:00Z",
  },
  {
    entryId: "LED-AMB-011",
    subDealerId: "SD-AMBUR",
    subDealerCode: "AMBUR",
    subDealerName: "Muthu Auto Agency - Ambur",
    date: "2026-11-10",
    particular: "HDFC BANK - ADVANCE BULK RECONCILIATION",
    transactionType: "BANK_RECEIPT",
    bankName: "HDFC Bank",
    referenceNo: "RTGS-ADV-2026-99",
    debit: 1043554,
    credit: 0,
    runningBalance: 1030257,
    notes: "Sub-dealer advance deposit credited to maintain stock buffer",
    createdAt: "2026-11-10T10:00:00Z",
  },

  // ==================== SVM MOTORS - NATRAMPALLI ====================
  {
    entryId: "LED-NTP-001",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-01",
    particular: "OPENING BALANCE 2024",
    transactionType: "OPENING_BALANCE",
    billNo: "OB-2024",
    debit: 0,
    credit: 230196,
    runningBalance: -230196,
    notes: "Opening credit carried forward",
    createdAt: "2024-01-01T09:00:00Z",
  },
  {
    entryId: "LED-NTP-002",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-05",
    particular: "I.BANK - RECEIVED [ RECEIVED FROM PROCAP ]",
    transactionType: "FINANCE_PAYOUT",
    bankName: "Indian Bank (I.BANK)",
    financierName: "Procap Financial",
    referenceNo: "PROCAP-DISB-101",
    debit: 22500,
    credit: 0,
    runningBalance: -207696,
    notes: "Finance payment received via Indian Bank",
    createdAt: "2024-01-05T11:00:00Z",
  },
  {
    entryId: "LED-NTP-003",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-07",
    particular: "RAY ZR DISC OBD II - ME1SEK759P0037944",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1SEK759P0037944",
    modelCode: "BKX5",
    billNo: "TRF-NTP-101",
    debit: 0,
    credit: 102265,
    runningBalance: -309961,
    notes: "Scooter transferred to Natrampalli branch",
    createdAt: "2024-01-07T14:00:00Z",
  },
  {
    entryId: "LED-NTP-004",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-08",
    particular: "FASCINO DRUM OBD II - ME1SEK72BP0018404",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1SEK72BP0018404",
    modelCode: "BGPF",
    billNo: "TRF-NTP-102",
    debit: 0,
    credit: 93134,
    runningBalance: -403095,
    notes: "Fascino drum unit dispatched",
    createdAt: "2024-01-08T15:30:00Z",
  },
  {
    entryId: "LED-NTP-005",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-10",
    particular: "I.BANK - RECEIVED [ RECEIVED FROM PROCAP ]",
    transactionType: "FINANCE_PAYOUT",
    bankName: "Indian Bank (I.BANK)",
    financierName: "Procap Financial",
    referenceNo: "PROCAP-DISB-108",
    debit: 169896,
    credit: 0,
    runningBalance: -233199,
    notes: "Bulk loan disbursement into Indian Bank",
    createdAt: "2024-01-10T11:15:00Z",
  },
  {
    entryId: "LED-NTP-006",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-11",
    particular: "SPARES - Monthly Lubricants & Spares Pack",
    transactionType: "SPARES_BILL",
    billNo: "SSI 285",
    debit: 0,
    credit: 2769,
    runningBalance: -235968,
    notes: "Spares invoice SSI 285",
    createdAt: "2024-01-11T16:00:00Z",
  },
  {
    entryId: "LED-NTP-007",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-14",
    particular: "POOJA.V - L&T FINANCE DISBURSEMENT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "L&T Finance",
    customerName: "Pooja.V",
    referenceNo: "LT-DISB-9981",
    debit: 88324,
    credit: 0,
    runningBalance: -147644,
    notes: "Customer vehicle finance payout credited directly to Maruthi account",
    createdAt: "2024-01-14T10:00:00Z",
  },
  {
    entryId: "LED-NTP-008",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-14",
    particular: "PRABHU.V - L&T FINANCE DISBURSEMENT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "L&T Finance",
    customerName: "Prabhu.V",
    referenceNo: "LT-DISB-9982",
    debit: 101837,
    credit: 0,
    runningBalance: -45807,
    notes: "Customer vehicle loan payout",
    createdAt: "2024-01-14T10:30:00Z",
  },
  {
    entryId: "LED-NTP-009",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-15",
    particular: "MT-15 OBD II - ME1RG686BP0034938",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1RG686BP0034938",
    modelCode: "BXF3",
    billNo: "TRF-NTP-103",
    debit: 0,
    credit: 191095,
    runningBalance: -236902,
    notes: "MT-15 unit dispatched to Natrampalli",
    createdAt: "2024-01-15T12:00:00Z",
  },
  {
    entryId: "LED-NTP-010",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-18",
    particular: "I.BANK - RECEIVED DIRECT RTGS",
    transactionType: "BANK_RECEIPT",
    bankName: "Indian Bank (I.BANK)",
    referenceNo: "RTGS-IBANK-8841",
    debit: 200000,
    credit: 0,
    runningBalance: -36902,
    notes: "Direct sub-dealer payment credited into Indian Bank",
    createdAt: "2024-01-18T15:00:00Z",
  },
  {
    entryId: "LED-NTP-011",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-19",
    particular: "FZS V4 DLX - ME1RG912BP0004120",
    transactionType: "VEHICLE_DISPATCH",
    chassisNumber: "ME1RG912BP0004120",
    modelCode: "BFH6",
    billNo: "TRF-NTP-104",
    debit: 0,
    credit: 144585,
    runningBalance: -181487,
    notes: "FZS V4 unit transferred",
    createdAt: "2024-01-19T14:00:00Z",
  },
  {
    entryId: "LED-NTP-012",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-22",
    particular: "MT-15 OBD II - [RETURN : 09/01/2024] - ME1RG686BP0034938",
    transactionType: "VEHICLE_RETURN",
    chassisNumber: "ME1RG686BP0034938",
    modelCode: "BXF3",
    billNo: "RET-NTP-01",
    debit: 191095,
    credit: 0,
    runningBalance: 9608,
    notes: "Vehicle returned from Natrampalli back to HQ Yard - credit reversed",
    createdAt: "2024-01-22T16:00:00Z",
  },
  {
    entryId: "LED-NTP-013",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2024-01-25",
    particular: "SATHISH KUMAR.K - CHOLA FINANCE PAYOUT",
    transactionType: "FINANCE_PAYOUT",
    financierName: "Cholamandalam Investment (CHOLA)",
    customerName: "Sathish Kumar.K",
    referenceNo: "CHOLA-DISB-3312",
    debit: 127228,
    credit: 0,
    runningBalance: 136836,
    notes: "Chola finance payout credited for customer vehicle delivery",
    createdAt: "2024-01-25T11:00:00Z",
  },
  {
    entryId: "LED-NTP-014",
    subDealerId: "SD-SVM-NTP",
    subDealerCode: "SVM-NTP",
    subDealerName: "SVM Motors - Natrampalli",
    date: "2026-11-10",
    particular: "FZS V4 DLX & R15 CONSIGNMENT ADJUSTMENT",
    transactionType: "ADJUSTMENT",
    billNo: "ADJ-NTP-991",
    debit: 0,
    credit: 188088,
    runningBalance: -51252,
    notes: "Net monthly reconciliation to balance closing statement",
    createdAt: "2026-11-10T17:30:00Z",
  },
];

export class YbcLedgerService {
  /**
   * Get all 22 YBC network summaries (matching Report.xlsx)
   */
  public static getYbcSummaries(): YbcDealerSummary[] {
    if (typeof window === "undefined") return INITIAL_YBC_SUMMARIES;
    const raw = localStorage.getItem(STORAGE_KEYS.YBC_SUMMARIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.YBC_SUMMARIES, JSON.stringify(INITIAL_YBC_SUMMARIES));
      return INITIAL_YBC_SUMMARIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_YBC_SUMMARIES;
    }
  }

  /**
   * Get all ledger entries for a sub-dealer, sorted chronologically
   */
  public static getSubDealerLedger(subDealerId: string): SubDealerLedgerEntry[] {
    const all = this.getAllLedgerEntries();
    return all.filter((e) => e.subDealerId === subDealerId);
  }

  /**
   * Get all ledger entries across all sub-dealers
   */
  public static getAllLedgerEntries(): SubDealerLedgerEntry[] {
    if (typeof window === "undefined") return INITIAL_SUBDEALER_LEDGER_ENTRIES;
    const raw = localStorage.getItem(STORAGE_KEYS.LEDGER_ENTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(INITIAL_SUBDEALER_LEDGER_ENTRIES));
      return INITIAL_SUBDEALER_LEDGER_ENTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUBDEALER_LEDGER_ENTRIES;
    }
  }

  /**
   * Add a new ledger entry (Payment receipt, Finance payout, Spares bill, Adjustment)
   */
  public static addLedgerEntry(
    entry: Omit<SubDealerLedgerEntry, "entryId" | "runningBalance" | "createdAt">
  ): SubDealerLedgerEntry {
    const all = this.getAllLedgerEntries();
    const dealerEntries = all.filter((e) => e.subDealerId === entry.subDealerId);
    
    // Calculate new running balance: previous balance + debit - credit
    const lastBalance = dealerEntries.length > 0
      ? dealerEntries[dealerEntries.length - 1].runningBalance
      : 0;
    
    const newRunningBalance = lastBalance + (Number(entry.debit) || 0) - (Number(entry.credit) || 0);

    const newEntry: SubDealerLedgerEntry = {
      ...entry,
      entryId: `LED-${Date.now().toString().slice(-6)}`,
      runningBalance: newRunningBalance,
      createdAt: new Date().toISOString(),
    };

    all.push(newEntry);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LEDGER_ENTRIES, JSON.stringify(all));
    }

    // Update balance in YBC summary
    this.updateDealerBalanceInSummary(entry.subDealerId, newRunningBalance);

    return newEntry;
  }

  /**
   * Update sub-dealer closing balance in YBC Master Summary
   */
  private static updateDealerBalanceInSummary(subDealerId: string, newBalance: number): void {
    const summaries = this.getYbcSummaries();
    const target = summaries.find((s) => s.subDealerId === subDealerId);
    if (target) {
      target.balance = newBalance;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.YBC_SUMMARIES, JSON.stringify(summaries));
      }
    }
  }

  /**
   * Automatically record a stock transfer to a sub-dealer's ledger
   */
  public static recordTransferToLedger(transfer: TransferRecord): void {
    if (transfer.destinationType !== "SUB_DEALER" || !transfer.subDealerId) return;

    const subDealer = DEFAULT_SUB_DEALERS.find((s) => s.subDealerId === transfer.subDealerId);
    const dealerName = subDealer?.dealerName || transfer.subDealerName || "Sub-Dealer";
    const dealerCode = subDealer?.dealerCode || "YBC";

    transfer.items.forEach((item) => {
      // Standard wholesale transfer rate estimate or fallback
      const wholesaleRate = 145000;
      this.addLedgerEntry({
        subDealerId: transfer.subDealerId!,
        subDealerCode: dealerCode,
        subDealerName: dealerName,
        date: new Date().toISOString().split("T")[0],
        particular: `${item.modelName} - ${item.chassisNumber}`,
        transactionType: "VEHICLE_DISPATCH",
        chassisNumber: item.chassisNumber,
        billNo: transfer.transferNumber,
        debit: 0,
        credit: wholesaleRate,
        notes: `Auto-posted from Stock Transfer ${transfer.transferNumber}`,
      });
    });

    // Update stock & sales counters in YBC summary
    const summaries = this.getYbcSummaries();
    const target = summaries.find((s) => s.subDealerId === transfer.subDealerId);
    if (target) {
      target.stockSales.tra += transfer.items.length;
      target.stockSales.stock += transfer.items.length;
      target.today.tra += transfer.items.length;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.YBC_SUMMARIES, JSON.stringify(summaries));
      }
    }
  }

  /**
   * Update RTO registration status for a dealer
   */
  public static markRegistrationDone(subDealerId: string, count: number = 1): void {
    const summaries = this.getYbcSummaries();
    const target = summaries.find((s) => s.subDealerId === subDealerId);
    if (target) {
      target.registration.regDone += count;
      target.registration.closing = Math.max(0, target.registration.closing - count);
      target.today.regDone += count;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.YBC_SUMMARIES, JSON.stringify(summaries));
      }
    }
  }

  /**
   * Export Sub-Dealer Statement as CSV
   */
  public static exportSubDealerStatementCsv(subDealerId: string): void {
    const entries = this.getSubDealerLedger(subDealerId);
    const subDealer = DEFAULT_SUB_DEALERS.find((s) => s.subDealerId === subDealerId);
    const dealerName = subDealer?.dealerName || subDealerId;

    const headers = ["S.No", "Date", "Particular", "Chassis / Code", "Bill No", "Debit (INR)", "Credit (INR)", "Running Balance (INR)", "Financier / Bank", "Notes"];
    const rows = entries.map((e, idx) => [
      idx + 1,
      e.date,
      `"${e.particular.replace(/"/g, '""')}"`,
      e.chassisNumber || e.modelCode || "",
      e.billNo || "",
      e.debit || 0,
      e.credit || 0,
      e.runningBalance,
      e.financierName || e.bankName || "",
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Statement_${dealerName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export Consolidated YBC Master Report as CSV
   */
  public static exportYbcMasterCsv(): void {
    const summaries = this.getYbcSummaries();
    const headers = [
      "S.No",
      "Dealer Code",
      "Dealer Name",
      "City",
      "RTO Zone",
      "Ledger Balance (INR)",
      "Status",
      "Open Stock",
      "Pur",
      "Tra",
      "Ret",
      "Sale",
      "Stock Ground",
      "Reg Open",
      "Reg Sale",
      "Reg Done",
      "Reg Closing",
      "Today Pur",
      "Today Sal",
      "Today Tra",
      "Today Ret",
      "Today Reg Done",
    ];

    const rows = summaries.map((s) => [
      s.sNo,
      s.dealerCode,
      `"${s.dealerName}"`,
      s.city,
      `"${s.rtoZone || ""}"`,
      s.balance,
      s.balance >= 0 ? "Advance" : "Due",
      s.stockSales.openStock,
      s.stockSales.pur,
      s.stockSales.tra,
      s.stockSales.ret,
      s.stockSales.sale,
      s.stockSales.stock,
      s.registration.open,
      s.registration.sale,
      s.registration.regDone,
      s.registration.closing,
      s.today.pur,
      s.today.sal,
      s.today.tra,
      s.today.ret,
      s.today.regDone,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Maruthi_Motors_YBC_Master_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

