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
    branchCode: "TPT",
    branchName: "Tirupattur",
    address: "Gandhi Road, Near Bus Stand",
    city: "Tirupattur",
    phone: "+91 94432 12345",
    isHeadquarters: true,
  },
  {
    branchId: "BR002",
    branchCode: "VNB",
    branchName: "Vaniyambadi",
    address: "NH-48 Bypass Road",
    city: "Vaniyambadi",
    phone: "+91 94432 54321",
    isHeadquarters: false,
  },
  {
    branchId: "BR003",
    branchCode: "NAT",
    branchName: "Natrampalli",
    address: "Main Bazaar",
    city: "Natrampalli",
    phone: "+91 94432 67890",
    isHeadquarters: false,
  },
  {
    branchId: "BR004",
    branchCode: "KND",
    branchName: "Kandhili",
    address: "Bypass Junction",
    city: "Kandhili",
    phone: "+91 94432 78901",
    isHeadquarters: false,
  },
  {
    branchId: "BR005",
    branchCode: "AMB",
    branchName: "Ambur",
    address: "MC Road, Near Bus Stand",
    city: "Ambur",
    phone: "+91 94432 89012",
    isHeadquarters: false,
  },
];

export const DEFAULT_LOCATIONS: YardLocationMaster[] = [
  // 1. Tirupattur (BR001)
  {
    locationId: "LOC001",
    branchId: "BR001",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC002",
    branchId: "BR001",
    locationName: "Main Showroom Floor",
    locationType: "SHOWROOM",
  },
  {
    locationId: "LOC003",
    branchId: "BR001",
    locationName: "Yard B (Buffer Storage)",
    locationType: "WAREHOUSE",
  },
  // 2. Vaniyambadi (BR002)
  {
    locationId: "LOC004",
    branchId: "BR002",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC005",
    branchId: "BR002",
    locationName: "Vaniyambadi Showroom Floor",
    locationType: "SHOWROOM",
  },
  // 3. Natrampalli (BR003)
  {
    locationId: "LOC006",
    branchId: "BR003",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC007",
    branchId: "BR003",
    locationName: "Natrampalli Showroom Floor",
    locationType: "SHOWROOM",
  },
  // 4. Kandhili (BR004)
  {
    locationId: "LOC008",
    branchId: "BR004",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC009",
    branchId: "BR004",
    locationName: "Kandhili Showroom Floor",
    locationType: "SHOWROOM",
  },
  // 5. Ambur (BR005)
  {
    locationId: "LOC010",
    branchId: "BR005",
    locationName: "Yard A (New Arrivals & PDI)",
    locationType: "YARD",
  },
  {
    locationId: "LOC011",
    branchId: "BR005",
    locationName: "Ambur Showroom Floor",
    locationType: "SHOWROOM",
  },
];

export const DEFAULT_STORAGE_BINS: StorageBinMaster[] = [
  // 1. Tirupattur (BR001)
  {
    binId: "BIN001",
    branchId: "BR001",
    locationId: "LOC001",
    binCode: "YARD-A1",
    binName: "Yard A - Bay 1 (Scooters)",
  },
  {
    binId: "BIN002",
    branchId: "BR001",
    locationId: "LOC001",
    binCode: "YARD-A2",
    binName: "Yard A - Bay 2 (Motorcycles)",
  },
  {
    binId: "BIN003",
    branchId: "BR001",
    locationId: "LOC002",
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
  // 2. Vaniyambadi (BR002)
  {
    binId: "BIN005",
    branchId: "BR002",
    locationId: "LOC004",
    binCode: "VNB-A1",
    binName: "VNB PDI & Unloading Bay",
  },
  {
    binId: "BIN006",
    branchId: "BR002",
    locationId: "LOC005",
    binCode: "VNB-DISP",
    binName: "VNB Showroom Floor",
  },
  // 3. Natrampalli (BR003)
  {
    binId: "BIN007",
    branchId: "BR003",
    locationId: "LOC006",
    binCode: "NTP-A1",
    binName: "NTP PDI & Unloading Bay",
  },
  {
    binId: "BIN008",
    branchId: "BR003",
    locationId: "LOC007",
    binCode: "NTP-DISP",
    binName: "NTP Showroom Floor",
  },
  // 4. Kandhili (BR004)
  {
    binId: "BIN009",
    branchId: "BR004",
    locationId: "LOC008",
    binCode: "KND-A1",
    binName: "KND PDI & Unloading Bay",
  },
  {
    binId: "BIN010",
    branchId: "BR004",
    locationId: "LOC009",
    binCode: "KND-DISP",
    binName: "KND Showroom Floor",
  },
  // 5. Ambur (BR005)
  {
    binId: "BIN011",
    branchId: "BR005",
    locationId: "LOC010",
    binCode: "AMB-A1",
    binName: "AMB PDI & Unloading Bay",
  },
  {
    binId: "BIN012",
    branchId: "BR005",
    locationId: "LOC011",
    binCode: "AMB-DISP",
    binName: "AMB Showroom Floor",
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

