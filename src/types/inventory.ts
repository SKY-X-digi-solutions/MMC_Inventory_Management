export type VehicleStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "TRANSFER_PENDING"
  | "IN_TRANSIT"
  | "SOLD"
  | "DELIVERED"
  | "RETURNED"
  | "DAMAGED"
  | "SERVICE";

export interface ColorVariant {
  colorId: string;
  colorName: string;
  colorCode: string;
}

export interface ServiceInterval {
  serviceNumber: number;
  afterDays: number;
  afterKm: number;
}

export interface VehicleModel {
  modelId: string;
  modelName: string;
  modelCode: string;
  vehicleType: string; // e.g. "SCOOTER", "FZ SERIES", "SPORTS - 155 CC"
  description?: string;
  colors: ColorVariant[];
  purchaseRate: number;
  salesRate: number;
  taxClassId: string;
  hsnCode: string;
  serviceSchedule?: ServiceInterval[];
  isActive: boolean;
}

export interface VehicleRecord {
  vehicleId: string;
  chassisNumber: string; // Unique VIN / Frame Number
  engineNumber: string;
  modelId: string;
  modelName: string;
  modelCode: string;
  colorId: string;
  colorName: string;
  colorCode?: string;
  purchaseId: string;
  supplierInvoiceNo?: string;
  supplierId?: string;
  purchaseRate: number;
  branchId: string;
  branchName?: string;
  locationId: string;
  locationName?: string;
  storageBinId: string;
  binCode?: string;
  keyNumber?: string;
  batteryNumber?: string;
  batteryNumber2?: string;
  batteryMake?: string;
  controllerNumber?: string;
  chargerNumber?: string;
  manufacturingDate?: string;
  wheelType?: "ALLOY" | "SPOKE" | string;
  disk?: string | boolean | null;
  autoStart?: boolean;
  status: VehicleStatus;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  salesInvoiceId?: string;
  transferId?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleIdentifierRegistry {
  normalizedIdentifier: string; // Normalized uppercase Chassis or Engine No.
  identifierType: "CHASSIS" | "ENGINE";
  vehicleId: string;
  createdAt: string;
}

export interface PurchaseLineItem {
  itemId: string;
  modelId: string;
  modelName: string;
  modelCode: string;
  colorId: string;
  colorName: string;
  quantity: number;
  purchaseRate: number;
  discountRate?: number;
  discountAmount?: number;
  grossAmount: number;
  chassisList: Partial<VehicleRecord>[];
}

export interface PurchaseVoucher {
  purchaseId: string;
  voucherNumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNo: string;
  purchaseDate: string;
  branchId: string;
  branchName?: string;
  locationId: string;
  locationName?: string;
  storageBinId: string;
  binCode?: string;
  taxClassId: string;
  totalQuantity: number;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  grandTotal: number;
  status: "DRAFT" | "POSTED";
  createdBy: string;
  createdAt: string;
  postedAt?: string | null;
  items: PurchaseLineItem[];
}

export interface StockMovement {
  movementId: string;
  vehicleId: string;
  chassisNumber: string;
  movementType: "PURCHASE" | "SALE" | "TRANSFER_OUT" | "TRANSFER_IN" | "RETURN" | "ADJUSTMENT";
  referenceType: "PURCHASE_VOUCHER" | "SALES_INVOICE" | "TRANSFER" | "MANUAL";
  referenceId: string;
  fromBranchId?: string | null;
  fromBranchName?: string;
  toBranchId?: string | null;
  toBranchName?: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  quantity: number;
  movementDate: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
}

export interface InventorySummary {
  summaryId: string; // {branchId}_{modelId}_{colorId}
  branchId: string;
  branchName?: string;
  locationId?: string;
  storageBinId?: string;
  modelId: string;
  modelName: string;
  colorId: string;
  colorName: string;
  colorCode?: string;
  availableQuantity: number;
  reservedQuantity: number;
  inTransitQuantity: number;
  soldQuantity: number;
  damagedQuantity?: number;
  updatedAt: string;
}

export interface TransferItem {
  itemId: string;
  vehicleId: string;
  modelName: string;
  colorName: string;
  chassisNumber: string;
  engineNumber: string;
  fromLocationId: string;
  toLocationId: string;
  itemStatus: "PENDING" | "IN_TRANSIT" | "RECEIVED" | "REJECTED";
  receivedCondition?: string;
  remarks?: string;
}

export interface TransferRecord {
  transferId: string;
  transferNumber: string;
  transferType: "BRANCH_TO_BRANCH" | "SUB_DEALER";
  destinationType: "BRANCH" | "SUB_DEALER";
  fromBranchId: string;
  fromBranchName: string;
  toBranchId?: string | null;
  toBranchName?: string;
  subDealerId?: string | null;
  subDealerName?: string;
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  initiatedBy: string;
  initiatedAt: string;
  approvedBy?: string;
  dispatchedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  items: TransferItem[];
}

export interface SalesInvoiceItem {
  itemId: string;
  vehicleId: string;
  modelId: string;
  modelName: string;
  modelCode: string;
  colorId: string;
  colorName: string;
  chassisNumber: string;
  engineNumber: string;
  rate: number;
  gross: number;
  discount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SalesInvoiceRecord {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  branchId: string;
  branchName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerGstin?: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  productCharges: number;
  billValue: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMode: string;
  financierName?: string;
  loanReference?: string;
  isHypothecated: boolean;
  status: "POSTED" | "CANCELLED";
  createdAt: string;
  postedAt: string;
  items: SalesInvoiceItem[];
}

export interface BranchMaster {
  branchId: string;
  branchCode: string;
  branchName: string;
  address: string;
  city: string;
  phone: string;
  isHeadquarters: boolean;
}

export interface YardLocationMaster {
  locationId: string;
  branchId: string;
  locationName: string;
  locationType: "SHOWROOM" | "YARD" | "WAREHOUSE";
}

export interface StorageBinMaster {
  binId: string;
  branchId: string;
  locationId: string;
  binCode: string;
  binName: string;
}

export interface SubDealerMaster {
  subDealerId: string;
  dealerCode: string;
  dealerName: string;
  contactPerson: string;
  mobile: string;
  city: string;
}

export interface StockImportRow {
  rowNumber: number;
  modelName: string;
  modelCode?: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  keyNumber?: string;
  batteryNumber?: string;
  batteryMake?: string;
  chargerNumber?: string;
  manufacturingDate?: string;
  purchaseRate?: number;
  isValid: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
  validationError?: string;
}

export interface StockImportSession {
  importId: string;
  fileName: string;
  supplierInvoiceNo: string;
  branchId: string;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  rows: StockImportRow[];
  uploadedAt: string;
}

