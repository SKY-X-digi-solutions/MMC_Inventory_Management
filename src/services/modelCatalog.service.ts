import { 
  VehicleModel, 
  BranchMaster, 
  YardLocationMaster, 
  StorageBinMaster, 
  SubDealerMaster 
} from "@/types/inventory";

export const DEFAULT_BRANCHES: BranchMaster[] = [
  {
    branchId: "BR001",
    branchCode: "TPT-MAIN",
    branchName: "Tirupattur Main Showroom (HQ)",
    address: "Gandhi Road, Near Bus Stand",
    city: "Tirupattur",
    phone: "+91 94432 12345",
    isHeadquarters: true,
  },
  {
    branchId: "BR002",
    branchCode: "VNB-SHOW",
    branchName: "Vaniyambadi Branch",
    address: "NH-48 Bypass Road",
    city: "Vaniyambadi",
    phone: "+91 94432 54321",
    isHeadquarters: false,
  },
  {
    branchId: "BR003",
    branchCode: "NTP-BRANCH",
    branchName: "Natrampalli Branch",
    address: "Main Bazaar",
    city: "Natrampalli",
    phone: "+91 94432 67890",
    isHeadquarters: false,
  },
];

export const DEFAULT_LOCATIONS: YardLocationMaster[] = [
  {
    locationId: "LOC001",
    branchId: "BR001",
    locationName: "Main Showroom Floor",
    locationType: "SHOWROOM",
  },
  {
    locationId: "LOC002",
    branchId: "BR001",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC003",
    branchId: "BR001",
    locationName: "Yard B (Buffer Storage)",
    locationType: "WAREHOUSE",
  },
  {
    locationId: "LOC004",
    branchId: "BR002",
    locationName: "Vaniyambadi Showroom Yard",
    locationType: "YARD",
  },
];

export const DEFAULT_STORAGE_BINS: StorageBinMaster[] = [
  {
    binId: "BIN001",
    branchId: "BR001",
    locationId: "LOC002",
    binCode: "YARD-A1",
    binName: "Yard A - Bay 1 (Scooters)",
  },
  {
    binId: "BIN002",
    branchId: "BR001",
    locationId: "LOC002",
    binCode: "YARD-A2",
    binName: "Yard A - Bay 2 (Motorcycles)",
  },
  {
    binId: "BIN003",
    branchId: "BR001",
    locationId: "LOC001",
    binCode: "SHOWROOM-DISP",
    binName: "Showroom Front Display",
  },
  {
    binId: "BIN004",
    branchId: "BR001",
    locationId: "LOC003",
    binCode: "YARD-B1",
    binName: "Warehouse Secure Bay",
  },
  {
    binId: "BIN005",
    branchId: "BR002",
    locationId: "LOC004",
    binCode: "VNB-BAY1",
    binName: "VNB Main Yard Bay",
  },
];

export const DEFAULT_SUB_DEALERS: SubDealerMaster[] = [
  {
    subDealerId: "SD001",
    dealerCode: "SUB-KRI",
    dealerName: "Sri Motors Sub-Dealer",
    contactPerson: "R. Suresh",
    mobile: "+91 98421 11223",
    city: "Krishnagiri",
  },
  {
    subDealerId: "SD002",
    dealerCode: "SUB-JOL",
    dealerName: "Selvam Two Wheeler Agency",
    contactPerson: "K. Selvam",
    mobile: "+91 98421 44556",
    city: "Jolarpet",
  },
  {
    subDealerId: "SD003",
    dealerCode: "SUB-AMB",
    dealerName: "Vignesh Motors",
    contactPerson: "M. Vignesh",
    mobile: "+91 98421 77889",
    city: "Ambur",
  },
];

export const DEFAULT_VEHICLE_MODELS: VehicleModel[] = [
  {
    modelId: "MOD001",
    modelName: "Fascino 125 Fi Hybrid DLX",
    modelCode: "DG51/BGP4",
    vehicleType: "SCOOTER",
    description: "Yamaha Fascino 125 Fi Hybrid Disc Deluxe",
    purchaseRate: 65590,
    salesRate: 90590,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR001", colorName: "Cyan Blue", colorCode: "#00BCD4" },
      { colorId: "CLR002", colorName: "Matte Black", colorCode: "#1F2937" },
      { colorId: "CLR003", colorName: "Armada Blue", colorCode: "#1E3A8A" },
      { colorId: "CLR004", colorName: "Metallic Red", colorCode: "#DC2626" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 90, afterKm: 4000 },
      { serviceNumber: 3, afterDays: 180, afterKm: 7000 },
    ],
  },
  {
    modelId: "MOD002",
    modelName: "RayZR 125 Fi Hybrid Disc",
    modelCode: "BGPE/DG54",
    vehicleType: "SCOOTER",
    description: "Yamaha RayZR 125 Fi Hybrid Disc Edition",
    purchaseRate: 64200,
    salesRate: 88700,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR005", colorName: "Matte Copper", colorCode: "#B45309" },
      { colorId: "CLR006", colorName: "Racing Blue", colorCode: "#2563EB" },
      { colorId: "CLR002", colorName: "Matte Black", colorCode: "#1F2937" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 90, afterKm: 4000 },
    ],
  },
  {
    modelId: "MOD003",
    modelName: "FZ-S Fi Version 4.0 DLX",
    modelCode: "B3P1",
    vehicleType: "FZ SERIES",
    description: "Yamaha FZ-S Fi V4 Deluxe with Traction Control",
    purchaseRate: 95400,
    salesRate: 129700,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR007", colorName: "Metallic Grey", colorCode: "#4B5563" },
      { colorId: "CLR006", colorName: "Racing Blue", colorCode: "#2563EB" },
      { colorId: "CLR008", colorName: "Majesty Red", colorCode: "#991B1B" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 120, afterKm: 5000 },
    ],
  },
  {
    modelId: "MOD004",
    modelName: "MT-15 V2 Deluxe",
    modelCode: "B901",
    vehicleType: "SPORTS - 155 CC",
    description: "Yamaha MT-15 Version 2.0 Dual Channel ABS",
    purchaseRate: 121000,
    salesRate: 168200,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR009", colorName: "Ice Fluo-Vermillion", colorCode: "#E11D48" },
      { colorId: "CLR010", colorName: "Cyber Green", colorCode: "#10B981" },
      { colorId: "CLR006", colorName: "Racing Blue", colorCode: "#2563EB" },
      { colorId: "CLR011", colorName: "Metallic Black", colorCode: "#111827" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 120, afterKm: 5000 },
    ],
  },
  {
    modelId: "MOD005",
    modelName: "R15 V4 Racing Edition",
    modelCode: "B741",
    vehicleType: "RACING - 150CC",
    description: "Yamaha YZF R15 Version 4 Quickshifter Edition",
    purchaseRate: 135000,
    salesRate: 184500,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR006", colorName: "Racing Blue", colorCode: "#2563EB" },
      { colorId: "CLR012", colorName: "Vivid Magenta", colorCode: "#C026D3" },
      { colorId: "CLR011", colorName: "Metallic Black", colorCode: "#111827" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 120, afterKm: 5000 },
    ],
  },
  {
    modelId: "MOD006",
    modelName: "Aerox 155 Version S",
    modelCode: "B651",
    vehicleType: "SPORTS - SCOOTER",
    description: "Yamaha Aerox 155 Maxi Scooter Keyless Smart Key",
    purchaseRate: 110500,
    salesRate: 148800,
    taxClassId: "GST001",
    hsnCode: "8711",
    isActive: true,
    colors: [
      { colorId: "CLR006", colorName: "Racing Blue", colorCode: "#2563EB" },
      { colorId: "CLR013", colorName: "Silver Star", colorCode: "#9CA3AF" },
    ],
    serviceSchedule: [
      { serviceNumber: 1, afterDays: 30, afterKm: 1000 },
      { serviceNumber: 2, afterDays: 90, afterKm: 4000 },
    ],
  },
];

