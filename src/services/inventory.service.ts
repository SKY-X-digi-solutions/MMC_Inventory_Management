import {
  VehicleRecord,
  VehicleStatus,
  PurchaseVoucher,
  StockMovement,
  InventorySummary,
  TransferRecord,
  SalesInvoiceRecord,
  StockImportSession,
  VehicleModel,
  VehiclePricingMaster,
} from "@/types/inventory";
import {
  DEFAULT_BRANCHES,
  DEFAULT_LOCATIONS,
  DEFAULT_STORAGE_BINS,
  DEFAULT_SUB_DEALERS,
  DEFAULT_VEHICLE_MODELS,
} from "./modelCatalog.service";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, writeBatch, collection, getDocs } from "firebase/firestore";

const STORAGE_KEYS = {
  VEHICLES: "mmc_inventory_vehicles_v1",
  PURCHASES: "mmc_inventory_purchases_v1",
  TRANSFERS: "mmc_inventory_transfers_v1",
  INVOICES: "mmc_inventory_invoices_v1",
  MOVEMENTS: "mmc_inventory_movements_v1",
  MODELS: "mmc_inventory_models_v1",
  PRICING: "mmc_inventory_pricing_v1",
};

export class InventoryService {
  /**
   * Initial seed data for demonstration (12 realistic Yamaha units)
   */
  private static getInitialMockVehicles(): VehicleRecord[] {
    const now = new Date();
    const dStr = now.toISOString();

    return [
      {
        vehicleId: "VEH-1001",
        chassisNumber: "ME1RG431000101",
        engineNumber: "EN1RG431000101",
        modelId: "MOD001",
        modelName: "Fascino 125 Fi Hybrid DLX",
        modelCode: "DG51/BGP4",
        colorId: "CLR001",
        colorName: "Cyan Blue",
        colorCode: "#00BCD4",
        purchaseId: "PUR-101",
        supplierId: "SUP001",
        supplierInvoiceNo: "INV-YAM-2026-9921",
        purchaseRate: 65590,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        keyNumber: "KY-901",
        batteryNumber: "BAT-EX-101",
        batteryNumber2: "BAT-AUX-001",
        batteryMake: "Exide",
        controllerNumber: "CTRL-YAM-8821",
        chargerNumber: "CHG-YAM-4412",
        manufacturingDate: "2026-10-15",
        wheelType: "ALLOY",
        disk: "Front Disc",
        autoStart: true,
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1002",
        chassisNumber: "ME1RG431000102",
        engineNumber: "EN1RG431000102",
        modelId: "MOD001",
        modelName: "Fascino 125 Fi Hybrid DLX",
        modelCode: "DG51/BGP4",
        colorId: "CLR001",
        colorName: "Cyan Blue",
        colorCode: "#00BCD4",
        purchaseId: "PUR-101",
        supplierId: "SUP001",
        supplierInvoiceNo: "INV-YAM-2026-9921",
        purchaseRate: 65590,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC001",
        locationName: "Main Showroom Floor",
        storageBinId: "BIN003",
        binCode: "SHOWROOM-DISP",
        keyNumber: "KY-902",
        batteryNumber: "BAT-EX-102",
        batteryNumber2: "BAT-AUX-002",
        batteryMake: "Exide",
        controllerNumber: "CTRL-YAM-8822",
        chargerNumber: "CHG-YAM-4412",
        manufacturingDate: "2026-10-15",
        wheelType: "ALLOY",
        disk: "Front Disc",
        autoStart: true,
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1003",
        chassisNumber: "ME1RG431000103",
        engineNumber: "EN1RG431000103",
        modelId: "MOD001",
        modelName: "Fascino 125 Fi Hybrid DLX",
        modelCode: "DG51/BGP4",
        colorId: "CLR002",
        colorName: "Matte Black",
        colorCode: "#1F2937",
        purchaseId: "PUR-101",
        supplierId: "SUP001",
        supplierInvoiceNo: "INV-YAM-2026-9921",
        purchaseRate: 65590,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        keyNumber: "KY-903",
        batteryNumber: "BAT-EX-103",
        batteryNumber2: "BAT-AUX-003",
        batteryMake: "Exide",
        controllerNumber: "CTRL-YAM-8823",
        chargerNumber: "CHG-YAM-4412",
        manufacturingDate: "2026-10-16",
        wheelType: "ALLOY",
        disk: "Front Disc",
        autoStart: true,
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1004",
        chassisNumber: "ME1RG431000104",
        engineNumber: "EN1RG431000104",
        modelId: "MOD002",
        modelName: "RayZR 125 Fi Hybrid Disc",
        modelCode: "BGPE/DG54",
        colorId: "CLR005",
        colorName: "Matte Copper",
        colorCode: "#B45309",
        purchaseId: "PUR-101",
        purchaseRate: 64200,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        keyNumber: "KY-801",
        batteryNumber: "BAT-AM-201",
        batteryMake: "Amaron",
        manufacturingDate: "2026-10-18",
        wheelType: "ALLOY",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1005",
        chassisNumber: "ME1RG431000105",
        engineNumber: "EN1RG431000105",
        modelId: "MOD002",
        modelName: "RayZR 125 Fi Hybrid Disc",
        modelCode: "BGPE/DG54",
        colorId: "CLR006",
        colorName: "Racing Blue",
        colorCode: "#2563EB",
        purchaseId: "PUR-101",
        purchaseRate: 64200,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        keyNumber: "KY-802",
        batteryNumber: "BAT-AM-202",
        status: "RESERVED",
        customerId: "CUS-701",
        customerName: "K. Vignesh",
        customerPhone: "+91 98401 23456",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1006",
        chassisNumber: "ME1RG431000106",
        engineNumber: "EN1RG431000106",
        modelId: "MOD003",
        modelName: "FZ-S Fi Version 4.0 DLX",
        modelCode: "B3P1",
        colorId: "CLR006",
        colorName: "Racing Blue",
        colorCode: "#2563EB",
        purchaseId: "PUR-101",
        purchaseRate: 95400,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN002",
        binCode: "YARD-A2",
        keyNumber: "KY-701",
        batteryNumber: "BAT-EX-301",
        manufacturingDate: "2026-10-20",
        wheelType: "ALLOY",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1007",
        chassisNumber: "ME1RG431000107",
        engineNumber: "EN1RG431000107",
        modelId: "MOD003",
        modelName: "FZ-S Fi Version 4.0 DLX",
        modelCode: "B3P1",
        colorId: "CLR007",
        colorName: "Metallic Grey",
        colorCode: "#4B5563",
        purchaseId: "PUR-101",
        purchaseRate: 95400,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN002",
        binCode: "YARD-A2",
        keyNumber: "KY-702",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1008",
        chassisNumber: "ME1RG431000108",
        engineNumber: "EN1RG431000108",
        modelId: "MOD004",
        modelName: "MT-15 V2 Deluxe",
        modelCode: "B901",
        colorId: "CLR009",
        colorName: "Ice Fluo-Vermillion",
        colorCode: "#E11D48",
        purchaseId: "PUR-102",
        purchaseRate: 121000,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC001",
        locationName: "Main Showroom Floor",
        storageBinId: "BIN003",
        binCode: "SHOWROOM-DISP",
        keyNumber: "KY-601",
        batteryNumber: "BAT-YU-401",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1009",
        chassisNumber: "ME1RG431000109",
        engineNumber: "EN1RG431000109",
        modelId: "MOD004",
        modelName: "MT-15 V2 Deluxe",
        modelCode: "B901",
        colorId: "CLR010",
        colorName: "Cyber Green",
        colorCode: "#10B981",
        purchaseId: "PUR-102",
        purchaseRate: 121000,
        branchId: "BR002",
        branchName: "Vaniyambadi Branch",
        locationId: "LOC004",
        locationName: "Vaniyambadi Showroom Yard",
        storageBinId: "BIN005",
        binCode: "VNB-BAY1",
        keyNumber: "KY-602",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1010",
        chassisNumber: "ME1RG431000110",
        engineNumber: "EN1RG431000110",
        modelId: "MOD005",
        modelName: "R15 V4 Racing Edition",
        modelCode: "B741",
        colorId: "CLR006",
        colorName: "Racing Blue",
        colorCode: "#2563EB",
        purchaseId: "PUR-102",
        purchaseRate: 135000,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN002",
        binCode: "YARD-A2",
        keyNumber: "KY-501",
        status: "AVAILABLE",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1011",
        chassisNumber: "ME1RG431000111",
        engineNumber: "EN1RG431000111",
        modelId: "MOD006",
        modelName: "Aerox 155 Version S",
        modelCode: "B651",
        colorId: "CLR013",
        colorName: "Silver Star",
        colorCode: "#9CA3AF",
        purchaseId: "PUR-102",
        purchaseRate: 110500,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        keyNumber: "KY-401",
        status: "IN_TRANSIT",
        transferId: "TRF-901",
        createdAt: dStr,
        updatedAt: dStr,
      },
      {
        vehicleId: "VEH-1012",
        chassisNumber: "ME1RG431000112",
        engineNumber: "EN1RG431000112",
        modelId: "MOD001",
        modelName: "Fascino 125 Fi Hybrid DLX",
        modelCode: "DG51/BGP4",
        colorId: "CLR004",
        colorName: "Metallic Red",
        colorCode: "#DC2626",
        purchaseId: "PUR-101",
        supplierId: "SUP001",
        supplierInvoiceNo: "INV-YAM-2026-9921",
        purchaseRate: 65590,
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC001",
        locationName: "Main Showroom Floor",
        storageBinId: "BIN003",
        binCode: "SHOWROOM-DISP",
        keyNumber: "KY-904",
        batteryNumber: "BAT-EX-104",
        batteryNumber2: "BAT-AUX-004",
        batteryMake: "Exide",
        controllerNumber: "CTRL-YAM-8824",
        chargerNumber: "CHG-YAM-4412",
        manufacturingDate: "2026-10-18",
        wheelType: "ALLOY",
        disk: "Front Disc",
        autoStart: true,
        status: "SOLD",
        customerId: "CUS-802",
        customerName: "R. Anitha",
        customerPhone: "+91 94432 99887",
        salesInvoiceId: "SAL-501",
        createdAt: dStr,
        updatedAt: dStr,
      },
    ];
  }

  private static getInitialMovements(): StockMovement[] {
    const dStr = new Date().toISOString();
    return [
      {
        movementId: "MOV-001",
        vehicleId: "VEH-1001",
        chassisNumber: "ME1RG431000101",
        movementType: "PURCHASE",
        referenceType: "PURCHASE_VOUCHER",
        referenceId: "PUR-101",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Inventory Manager",
        notes: "Initial Yamaha load delivery",
        createdAt: dStr,
      },
      {
        movementId: "MOV-002",
        vehicleId: "VEH-1011",
        chassisNumber: "ME1RG431000111",
        movementType: "TRANSFER_OUT",
        referenceType: "TRANSFER",
        referenceId: "TRF-901",
        fromBranchId: "BR001",
        fromBranchName: "Tirupattur Main Showroom (HQ)",
        toBranchId: "BR002",
        toBranchName: "Vaniyambadi Branch",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Transfer Manager",
        notes: "Inter-branch stock transfer dispatched",
        createdAt: dStr,
      },
      {
        movementId: "MOV-003",
        vehicleId: "VEH-1012",
        chassisNumber: "ME1RG431000112",
        movementType: "SALE",
        referenceType: "SALES_INVOICE",
        referenceId: "SAL-501",
        fromBranchId: "BR001",
        fromBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Sales Executive",
        notes: "Customer retail sale invoice generated",
        createdAt: dStr,
      },
      {
        movementId: "MOV-004",
        vehicleId: "VEH-1004",
        chassisNumber: "ME1RG431000104",
        movementType: "PURCHASE",
        referenceType: "PURCHASE_VOUCHER",
        referenceId: "PUR-101",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Inventory Manager",
        notes: "Inward consignment receipt Yard A1",
        createdAt: dStr,
      },
      {
        movementId: "MOV-005",
        vehicleId: "VEH-1005",
        chassisNumber: "ME1RG431000105",
        movementType: "PURCHASE",
        referenceType: "PURCHASE_VOUCHER",
        referenceId: "PUR-101",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Inventory Manager",
        notes: "Pre-booking allocation inspection completed",
        createdAt: dStr,
      },
      {
        movementId: "MOV-006",
        vehicleId: "VEH-1006",
        chassisNumber: "ME1RG431000106",
        movementType: "PURCHASE",
        referenceType: "PURCHASE_VOUCHER",
        referenceId: "PUR-101",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Inventory Manager",
        notes: "FZ-S series load delivery received in Yard A2",
        createdAt: dStr,
      },
      {
        movementId: "MOV-007",
        vehicleId: "VEH-1008",
        chassisNumber: "ME1RG431000108",
        movementType: "TRANSFER_IN",
        referenceType: "TRANSFER",
        referenceId: "TRF-902",
        fromBranchId: "BR002",
        fromBranchName: "Vaniyambadi Branch",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Transfer Manager",
        notes: "Inter-branch stock rebalance received into showroom floor",
        createdAt: dStr,
      },
      {
        movementId: "MOV-008",
        vehicleId: "VEH-1010",
        chassisNumber: "ME1RG431000110",
        movementType: "ADJUSTMENT",
        referenceType: "MANUAL",
        referenceId: "ADJ-301",
        toBranchId: "BR001",
        toBranchName: "Tirupattur Main Showroom (HQ)",
        quantity: 1,
        movementDate: dStr,
        createdBy: "Service Engineer",
        notes: "PDI safety inspection & battery fitment adjustment",
        createdAt: dStr,
      },
    ];
  }

  private static getInitialTransfers(): TransferRecord[] {
    const dStr = new Date().toISOString();
    return [
      {
        transferId: "TRF-901",
        transferNumber: "TR-000001",
        transferType: "BRANCH_TO_BRANCH",
        destinationType: "BRANCH",
        fromBranchId: "BR001",
        fromBranchName: "Tirupattur Main Showroom (HQ)",
        toBranchId: "BR002",
        toBranchName: "Vaniyambadi Branch",
        status: "IN_TRANSIT",
        initiatedBy: "P. Rajan (Store Manager)",
        initiatedAt: dStr,
        dispatchedAt: dStr,
        items: [
          {
            itemId: "ITEM-T1",
            vehicleId: "VEH-1011",
            modelName: "Aerox 155 Version S",
            colorName: "Silver Star",
            chassisNumber: "ME1RG431000111",
            engineNumber: "EN1RG431000111",
            fromLocationId: "LOC002",
            toLocationId: "LOC004",
            itemStatus: "IN_TRANSIT",
            remarks: "Customer pre-booking requirement at Vaniyambadi",
          },
        ],
      },
    ];
  }

  /**
   * Helper to safely load data from browser localStorage with mock fallback
   */
  private static load<T>(key: string, defaultFactory: () => T): T {
    if (typeof window === "undefined") {
      return defaultFactory();
    }
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    const initial = defaultFactory();
    this.save(key, initial);
    return initial;
  }

  private static save<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
  }

  // ==================== PUBLIC API ====================

  public static getVehicles(branchId?: string): VehicleRecord[] {
    const rawVehicles = this.load(STORAGE_KEYS.VEHICLES, () => this.getInitialMockVehicles());
    const vehicles = rawVehicles.map((v) => {
      return {
        ...v,
        supplierId: v.supplierId || "SUP001",
        supplierInvoiceNo: v.supplierInvoiceNo || "INV-YAM-2026-9921",
        batteryNumber2: v.batteryNumber2 || "BAT-AUX-001",
        controllerNumber: v.controllerNumber || `CTRL-YAM-${v.vehicleId.replace(/\D/g, '') || "8821"}`,
        chargerNumber: v.chargerNumber || "CHG-YAM-4412",
        wheelType: v.wheelType || "ALLOY",
        disk: v.disk || "Front Disc",
        autoStart: v.autoStart ?? true,
      };
    });
    if (branchId && branchId !== "ALL") {
      return vehicles.filter((v) => v.branchId === branchId);
    }
    return vehicles;
  }

  public static getVehicleById(vehicleId: string): VehicleRecord | undefined {
    const vehicles = this.getVehicles();
    return vehicles.find((v) => v.vehicleId === vehicleId);
  }

  public static getExistingChassisSet(): Set<string> {
    const vehicles = this.getVehicles();
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.chassisNumber) {
        set.add(v.chassisNumber.toUpperCase().trim());
      }
    });
    return set;
  }

  public static getInventorySummary(branchId?: string): InventorySummary[] {
    const vehicles = this.getVehicles(branchId);
    const summaryMap = new Map<string, InventorySummary>();

    vehicles.forEach((v) => {
      const key = `${v.branchId}_${v.modelId}_${v.colorId}`;
      let item = summaryMap.get(key);
      if (!item) {
        item = {
          summaryId: key,
          branchId: v.branchId,
          branchName: v.branchName,
          modelId: v.modelId,
          modelName: v.modelName,
          colorId: v.colorId,
          colorName: v.colorName,
          colorCode: v.colorCode,
          availableQuantity: 0,
          reservedQuantity: 0,
          inTransitQuantity: 0,
          soldQuantity: 0,
          damagedQuantity: 0,
          updatedAt: new Date().toISOString(),
        };
        summaryMap.set(key, item);
      }

      if (v.status === "AVAILABLE") item.availableQuantity++;
      else if (v.status === "RESERVED") item.reservedQuantity++;
      else if (v.status === "IN_TRANSIT" || v.status === "TRANSFER_PENDING") item.inTransitQuantity++;
      else if (v.status === "SOLD" || v.status === "DELIVERED") item.soldQuantity++;
      else if (v.status === "DAMAGED") item.damagedQuantity = (item.damagedQuantity || 0) + 1;
    });

    return Array.from(summaryMap.values());
  }

  public static getMovements(vehicleId?: string): StockMovement[] {
    const rawMovements = this.load(STORAGE_KEYS.MOVEMENTS, () => this.getInitialMovements());
    const initial = this.getInitialMovements();
    const existingIds = new Set(rawMovements.map((m) => m.movementId));
    const movements = [...rawMovements];
    initial.forEach((initM) => {
      if (!existingIds.has(initM.movementId)) {
        movements.push(initM);
      }
    });
    if (vehicleId) {
      return movements.filter((m) => m.vehicleId === vehicleId);
    }
    return movements.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
  }

  public static getTransfers(branchId?: string): TransferRecord[] {
    const transfers = this.load(STORAGE_KEYS.TRANSFERS, () => this.getInitialTransfers());
    if (branchId && branchId !== "ALL") {
      return transfers.filter((t) => t.fromBranchId === branchId || t.toBranchId === branchId);
    }
    return transfers.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());
  }

  public static getModels(): VehicleModel[] {
    return this.load(STORAGE_KEYS.MODELS, () => DEFAULT_VEHICLE_MODELS);
  }

  public static getInitialPricingMasters(): VehiclePricingMaster[] {
    return [
      {
        pricingId: "PRC-001",
        modelId: "MOD001",
        modelName: "Fascino 125 Fi Hybrid DLX",
        modelCode: "DG51/BGP4",
        vehicleType: "SCOOTER",
        oemPurchaseCost: 65590,
        exShowroomBase: 70000,
        gstRate: 0.28,
        gstAmount: 19600,
        exShowroomPrice: 89600,
        rtoRoadTax: 9500,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 5400,
        mandatoryAccessories: 4890,
        extendedWarranty5Yr: 1850,
        totalOnRoadPrice: 112190,
        dealerGrossMargin: 4410,
        subDealerWholesaleRate: 87100,
        subDealerMargin: 2500,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        pricingId: "PRC-002",
        modelId: "MOD002",
        modelName: "RayZR 125 Fi Hybrid Disc",
        modelCode: "BGPE/DG54",
        vehicleType: "SCOOTER",
        oemPurchaseCost: 64200,
        exShowroomBase: 68500,
        gstRate: 0.28,
        gstAmount: 19180,
        exShowroomPrice: 87680,
        rtoRoadTax: 9200,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 5300,
        mandatoryAccessories: 4890,
        extendedWarranty5Yr: 1850,
        totalOnRoadPrice: 109870,
        dealerGrossMargin: 4300,
        subDealerWholesaleRate: 85180,
        subDealerMargin: 2500,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        pricingId: "PRC-003",
        modelId: "MOD003",
        modelName: "FZ-S Fi Version 4.0 DLX",
        modelCode: "B3P1",
        vehicleType: "FZ SERIES",
        oemPurchaseCost: 95400,
        exShowroomBase: 101500,
        gstRate: 0.28,
        gstAmount: 28420,
        exShowroomPrice: 129920,
        rtoRoadTax: 14200,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 7800,
        mandatoryAccessories: 5200,
        extendedWarranty5Yr: 2100,
        totalOnRoadPrice: 160170,
        dealerGrossMargin: 6100,
        subDealerWholesaleRate: 126920,
        subDealerMargin: 3000,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        pricingId: "PRC-004",
        modelId: "MOD004",
        modelName: "MT-15 V2 Deluxe",
        modelCode: "B901",
        vehicleType: "SPORTS - 155 CC",
        oemPurchaseCost: 121000,
        exShowroomBase: 131000,
        gstRate: 0.28,
        gstAmount: 36680,
        exShowroomPrice: 167680,
        rtoRoadTax: 18500,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 9200,
        mandatoryAccessories: 5500,
        extendedWarranty5Yr: 2400,
        totalOnRoadPrice: 204230,
        dealerGrossMargin: 10000,
        subDealerWholesaleRate: 163680,
        subDealerMargin: 4000,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        pricingId: "PRC-005",
        modelId: "MOD005",
        modelName: "R15 V4 Racing Edition",
        modelCode: "B741",
        vehicleType: "RACING - 150CC",
        oemPurchaseCost: 135000,
        exShowroomBase: 144000,
        gstRate: 0.28,
        gstAmount: 40320,
        exShowroomPrice: 184320,
        rtoRoadTax: 20400,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 9800,
        mandatoryAccessories: 5800,
        extendedWarranty5Yr: 2400,
        totalOnRoadPrice: 223670,
        dealerGrossMargin: 9000,
        subDealerWholesaleRate: 179820,
        subDealerMargin: 4500,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      {
        pricingId: "PRC-006",
        modelId: "MOD006",
        modelName: "Aerox 155 Version S",
        modelCode: "B651",
        vehicleType: "SPORTS - SCOOTER",
        oemPurchaseCost: 110500,
        exShowroomBase: 116000,
        gstRate: 0.28,
        gstAmount: 32480,
        exShowroomPrice: 148480,
        rtoRoadTax: 16300,
        rtoSmartCardPlate: 950,
        insurance1Plus5: 8400,
        mandatoryAccessories: 5200,
        extendedWarranty5Yr: 2100,
        totalOnRoadPrice: 181430,
        dealerGrossMargin: 5500,
        subDealerWholesaleRate: 144980,
        subDealerMargin: 3500,
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
    ];
  }

  public static getPricingMasters(): VehiclePricingMaster[] {
    return this.load<VehiclePricingMaster[]>(STORAGE_KEYS.PRICING, () => this.getInitialPricingMasters());
  }

  public static getPricingByModelId(modelId: string): VehiclePricingMaster | undefined {
    const list = this.getPricingMasters();
    return list.find((p) => p.modelId === modelId);
  }

  public static savePricingMaster(pricing: VehiclePricingMaster): void {
    const list = this.getPricingMasters();
    const idx = list.findIndex((p) => p.pricingId === pricing.pricingId || p.modelId === pricing.modelId);
    if (idx >= 0) {
      list[idx] = { ...pricing, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...pricing, updatedAt: new Date().toISOString() });
    }
    this.save(STORAGE_KEYS.PRICING, list);
  }

  public static getPurchaseVouchers(branchId?: string): PurchaseVoucher[] {
    const vouchers = this.load<PurchaseVoucher[]>(STORAGE_KEYS.PURCHASES, () => [
      {
        purchaseId: "PUR-101",
        voucherNumber: "PV-000101",
        supplierId: "SUP001",
        supplierName: "India Yamaha Motor Pvt. Ltd.",
        supplierInvoiceNo: "YMH-INV-8891",
        purchaseDate: "2026-10-15",
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        locationId: "LOC002",
        locationName: "Yard A (New Arrivals & PDI)",
        storageBinId: "BIN001",
        binCode: "YARD-A1",
        taxClassId: "GST001",
        totalQuantity: 5,
        subtotal: 327950,
        discountTotal: 0,
        taxAmount: 91826,
        grandTotal: 419776,
        status: "POSTED",
        createdBy: "Inventory Head",
        createdAt: "2026-10-15T10:30:00.000Z",
        postedAt: "2026-10-15T10:35:00.000Z",
        items: [
          {
            itemId: "ITM-01",
            modelId: "MOD001",
            modelName: "Fascino 125 Fi Hybrid DLX",
            modelCode: "DG51/BGP4",
            colorId: "COL001",
            colorName: "Cyan Blue",
            quantity: 3,
            purchaseRate: 65590,
            grossAmount: 196770,
            chassisList: [
              {
                chassisNumber: "ME1RG431000849201",
                engineNumber: "E3W104928120",
                keyNumber: "KY-8821",
                batteryNumber: "EX-9921",
                manufacturingDate: "2026-10-01",
              },
              {
                chassisNumber: "ME1RG431000849202",
                engineNumber: "E3W104928121",
                keyNumber: "KY-8822",
                batteryNumber: "EX-9922",
                manufacturingDate: "2026-10-01",
              },
              {
                chassisNumber: "ME1RG431000849203",
                engineNumber: "E3W104928122",
                keyNumber: "KY-8823",
                batteryNumber: "EX-9923",
                manufacturingDate: "2026-10-01",
              },
            ],
          },
          {
            itemId: "ITM-02",
            modelId: "MOD002",
            modelName: "RayZR 125 Fi Hybrid Disc",
            modelCode: "BGPE/DG54",
            colorId: "COL004",
            colorName: "Matte Red",
            quantity: 2,
            purchaseRate: 64200,
            grossAmount: 128400,
            chassisList: [
              {
                chassisNumber: "ME1RG521000732101",
                engineNumber: "E3W108421001",
                keyNumber: "KY-9104",
                batteryNumber: "AM-3011",
                manufacturingDate: "2026-10-02",
              },
              {
                chassisNumber: "ME1RG521000732102",
                engineNumber: "E3W108421002",
                keyNumber: "KY-9105",
                batteryNumber: "AM-3012",
                manufacturingDate: "2026-10-02",
              },
            ],
          },
        ],
      },
    ]);
    if (branchId && branchId !== "ALL") {
      return vouchers.filter((v) => v.branchId === branchId);
    }
    return vouchers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getSalesInvoices(branchId?: string): SalesInvoiceRecord[] {
    const invoices = this.load<SalesInvoiceRecord[]>(STORAGE_KEYS.INVOICES, () => [
      {
        invoiceId: "SAL-501",
        invoiceNumber: "MMC-INV-1092",
        invoiceDate: "2026-10-28T14:20:00.000Z",
        branchId: "BR001",
        branchName: "Tirupattur Main Showroom (HQ)",
        customerId: "CUS-802",
        customerName: "R. Anitha",
        customerPhone: "+91 94432 99887",
        customerAddress: "45 Anna Nagar",
        customerCity: "Tirupattur",
        subtotal: 70000,
        discount: 1500,
        taxAmount: 19180,
        productCharges: 4890,
        billValue: 92570,
        paidAmount: 92570,
        balanceAmount: 0,
        paymentMode: "CASH",
        isHypothecated: false,
        status: "POSTED",
        createdAt: "2026-10-28T14:20:00.000Z",
        postedAt: "2026-10-28T14:20:00.000Z",
        items: [
          {
            itemId: "ITEM-501-1",
            vehicleId: "VEH-1012",
            modelId: "MOD001",
            modelName: "Fascino 125 Fi Hybrid DLX",
            modelCode: "DG51/BGP4",
            colorId: "CLR004",
            colorName: "Metallic Red",
            chassisNumber: "ME1RG431000112",
            engineNumber: "EN1RG431000112",
            rate: 70000,
            gross: 70000,
            discount: 1500,
            taxAmount: 19180,
            lineTotal: 92570,
          },
        ],
      },
    ]);
    if (branchId && branchId !== "ALL") {
      return invoices.filter((i) => i.branchId === branchId);
    }
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Syncs current local vehicles and movements directly to the Firestore `tests` database
   */
  public static async syncToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const vehicles = this.getVehicles();
      const movements = this.getMovements();
      const batch = writeBatch(db);

      vehicles.forEach((v) => {
        const ref = doc(db, "vehicles", v.vehicleId);
        batch.set(ref, v, { merge: true });

        const idRef = doc(db, "vehicleIdentifiers", v.chassisNumber.toUpperCase().trim());
        batch.set(idRef, {
          normalizedIdentifier: v.chassisNumber.toUpperCase().trim(),
          identifierType: "CHASSIS",
          vehicleId: v.vehicleId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      });

      movements.slice(0, 25).forEach((m) => {
        const ref = doc(db, "stockMovements", m.movementId);
        batch.set(ref, m, { merge: true });
      });

      await batch.commit();
      return { success: true, count: vehicles.length };
    } catch (err: any) {
      console.error("Firestore sync error:", err);
      return { success: false, count: 0, error: err.message };
    }
  }

  public static updateVehicleStatus(
    vehicleId: string,
    newStatus: VehicleStatus,
    notes: string = "Status updated by Yard Manager"
  ): void {
    const vehicles = this.getVehicles();
    const movements = this.getMovements();
    const v = vehicles.find((u) => u.vehicleId === vehicleId);
    if (!v) throw new Error("Vehicle not found");

    const oldStatus = v.status;
    v.status = newStatus;
    v.updatedAt = new Date().toISOString();

    movements.unshift({
      movementId: `MOV-${Date.now()}`,
      vehicleId: v.vehicleId,
      chassisNumber: v.chassisNumber,
      movementType: "ADJUSTMENT",
      referenceType: "MANUAL",
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      fromBranchId: v.branchId,
      fromBranchName: v.branchName,
      quantity: 1,
      movementDate: new Date().toISOString(),
      createdBy: "Yard Supervisor",
      notes: `${notes} (${oldStatus} → ${newStatus})`,
      createdAt: new Date().toISOString(),
    });

    this.save(STORAGE_KEYS.VEHICLES, vehicles);
    this.save(STORAGE_KEYS.MOVEMENTS, movements);
  }

  public static addVehicleModel(model: VehicleModel): void {
    const models = this.getModels();
    models.push(model);
    this.save(STORAGE_KEYS.MODELS, models);
  }

  /**
   * Commit a Bulk Import Session (Phase 1 & 3: Yamaha Inward Delivery)
   */
  public static commitBulkImport(
    session: StockImportSession,
    locationId: string,
    binId: string,
    branchId: string
  ): { addedCount: number; deductedCount: number; voucher: PurchaseVoucher } {
    const branch = DEFAULT_BRANCHES.find((b) => b.branchId === branchId) || DEFAULT_BRANCHES[0];
    const location = DEFAULT_LOCATIONS.find((l) => l.locationId === locationId) || DEFAULT_LOCATIONS[1];
    const bin = DEFAULT_STORAGE_BINS.find((b) => b.binId === binId) || DEFAULT_STORAGE_BINS[0];

    const currentVehicles = this.getVehicles();
    const currentMovements = this.getMovements();
    const existingChassis = this.getExistingChassisSet();

    const isOfficialDemo = session.supplierInvoiceNo === "E126008210";
    let baseVehicles = currentVehicles;
    if (isOfficialDemo) {
      baseVehicles = currentVehicles.filter((v) => v.supplierInvoiceNo !== "E126008210");
      existingChassis.clear();
      baseVehicles.forEach((v) => {
        if (v.chassisNumber) existingChassis.add(v.chassisNumber.toUpperCase().trim());
      });
    }

    const newVehicles: VehicleRecord[] = [];
    const newMovements: StockMovement[] = [];
    const now = new Date().toISOString();

    const voucherId = isOfficialDemo ? "PV-E126008210" : `PV-${Date.now().toString().slice(-6)}`;
    let addedCount = 0;
    let deductedCount = 0;

    session.rows.forEach((row) => {
      const chassisNorm = row.chassisNumber.toUpperCase().trim();
      if (!row.isValid || row.isDuplicate || existingChassis.has(chassisNorm)) {
        deductedCount++;
        return;
      }

      existingChassis.add(chassisNorm);
      addedCount++;

      const matchedModel = DEFAULT_VEHICLE_MODELS.find(
        (m) => m.modelName.toLowerCase() === row.modelName.toLowerCase()
      ) || DEFAULT_VEHICLE_MODELS[0];

      const matchedColor = matchedModel.colors.find(
        (c) =>
          c.colorName.toLowerCase() === row.color.toLowerCase() ||
          row.color.toLowerCase().includes(c.colorName.toLowerCase()) ||
          c.colorName.toLowerCase().includes(row.color.toLowerCase())
      ) || matchedModel.colors[0];

      const vehicleId = `VEH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newUnit: VehicleRecord = {
        vehicleId,
        chassisNumber: chassisNorm,
        engineNumber: row.engineNumber || `ENG-${chassisNorm.slice(-6)}`,
        modelId: matchedModel.modelId,
        modelName: matchedModel.modelName,
        modelCode: matchedModel.modelCode,
        colorId: matchedColor.colorId,
        colorName: matchedColor.colorName,
        colorCode: matchedColor.colorCode,
        purchaseId: voucherId,
        supplierInvoiceNo: session.supplierInvoiceNo,
        supplierId: "SUP001",
        purchaseRate: row.purchaseRate || matchedModel.purchaseRate,
        branchId: branch.branchId,
        branchName: branch.branchName,
        locationId: location.locationId,
        locationName: location.locationName,
        storageBinId: bin.binId,
        binCode: bin.binCode,
        keyNumber: row.keyNumber,
        batteryNumber: row.batteryNumber,
        batteryMake: "Exide",
        manufacturingDate: row.manufacturingDate || now.split("T")[0],
        wheelType: "ALLOY",
        disk: true,
        autoStart: true,
        status: "AVAILABLE",
        createdAt: now,
        updatedAt: now,
      };

      newVehicles.push(newUnit);

      newMovements.push({
        movementId: `MOV-${Date.now()}-${addedCount}`,
        vehicleId,
        chassisNumber: chassisNorm,
        movementType: "PURCHASE",
        referenceType: "PURCHASE_VOUCHER",
        referenceId: voucherId,
        toBranchId: branch.branchId,
        toBranchName: branch.branchName,
        toLocationId: location.locationId,
        quantity: 1,
        movementDate: now,
        createdBy: "Inventory Head",
        notes: `Bulk Yamaha Import Invoice: ${session.supplierInvoiceNo}`,
        createdAt: now,
      });
    });

    const updatedVehicles = [...newVehicles, ...baseVehicles];
    const updatedMovements = [...newMovements, ...currentMovements];

    this.save(STORAGE_KEYS.VEHICLES, updatedVehicles);
    this.save(STORAGE_KEYS.MOVEMENTS, updatedMovements);

    // Group imported vehicles into structured voucher line items
    const itemsMap = new Map<string, {
      itemId: string;
      modelId: string;
      modelName: string;
      modelCode: string;
      colorId: string;
      colorName: string;
      quantity: number;
      purchaseRate: number;
      grossAmount: number;
      chassisList: any[];
    }>();

    newVehicles.forEach((v) => {
      const key = `${v.modelId}_${v.colorId}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          itemId: `ITEM-${key}`,
          modelId: v.modelId,
          modelName: v.modelName,
          modelCode: v.modelCode,
          colorId: v.colorId,
          colorName: v.colorName,
          quantity: 0,
          purchaseRate: v.purchaseRate,
          grossAmount: 0,
          chassisList: [],
        });
      }
      const it = itemsMap.get(key)!;
      it.quantity += 1;
      it.grossAmount += v.purchaseRate;
      it.chassisList.push({
        chassisNumber: v.chassisNumber,
        engineNumber: v.engineNumber,
        keyNumber: v.keyNumber,
        batteryNumber: v.batteryNumber,
        manufacturingDate: v.manufacturingDate,
        storageBinId: v.storageBinId,
        binCode: v.binCode,
      });
    });

    const items = Array.from(itemsMap.values());
    const subtotal = items.reduce((sum, it) => sum + it.grossAmount, 0);
    const taxAmount = Math.round(subtotal * 0.28);
    const grandTotal = subtotal + taxAmount;

    const newVoucher: PurchaseVoucher = {
      purchaseId: voucherId,
      voucherNumber: voucherId,
      supplierId: "SUP001",
      supplierName: "India Yamaha Motor Pvt. Ltd.",
      supplierInvoiceNo: session.supplierInvoiceNo || `YMH-INV-${Date.now().toString().slice(-4)}`,
      purchaseDate: isOfficialDemo ? "2026-09-10" : now.split("T")[0],
      branchId: branch.branchId,
      branchName: branch.branchName,
      locationId: location.locationId,
      locationName: location.locationName,
      storageBinId: bin.binId,
      binCode: bin.binCode,
      taxClassId: "GST001",
      totalQuantity: newVehicles.length,
      subtotal,
      discountTotal: 0,
      taxAmount,
      grandTotal,
      status: "POSTED",
      createdBy: "Inventory Head",
      createdAt: now,
      postedAt: now,
      items,
    };

    const currentVouchers = this.getPurchaseVouchers().filter((v) => !isOfficialDemo || v.supplierInvoiceNo !== "E126008210");
    this.save(STORAGE_KEYS.PURCHASES, [newVoucher, ...currentVouchers]);

    return { addedCount, deductedCount, voucher: newVoucher };
  }

  /**
   * Commit a Retail Sales Invoice and Lock Vehicle to SOLD (Focus 5A)
   */
  public static postSalesInvoice(invoice: SalesInvoiceRecord): void {
    const vehicles = this.getVehicles();
    const movements = this.getMovements();
    const now = new Date().toISOString();

    const targetVehicle = vehicles.find((v) => v.vehicleId === invoice.items[0].vehicleId);
    if (!targetVehicle) {
      throw new Error("Vehicle not found in inventory.");
    }
    if (targetVehicle.status !== "AVAILABLE" && targetVehicle.status !== "RESERVED") {
      throw new Error(`Vehicle is not available for sale. Current status: ${targetVehicle.status}`);
    }

    targetVehicle.status = "SOLD";
    targetVehicle.customerId = invoice.customerId;
    targetVehicle.customerName = invoice.customerName;
    targetVehicle.customerPhone = invoice.customerPhone;
    targetVehicle.salesInvoiceId = invoice.invoiceId;
    targetVehicle.updatedAt = now;

    movements.unshift({
      movementId: `MOV-${Date.now()}`,
      vehicleId: targetVehicle.vehicleId,
      chassisNumber: targetVehicle.chassisNumber,
      movementType: "SALE",
      referenceType: "SALES_INVOICE",
      referenceId: invoice.invoiceId,
      fromBranchId: targetVehicle.branchId,
      fromBranchName: targetVehicle.branchName,
      quantity: 1,
      movementDate: now,
      createdBy: "Sales Executive",
      notes: `Sold to ${invoice.customerName} (Invoice: ${invoice.invoiceNumber})`,
      createdAt: now,
    });

    const invoices = this.load<SalesInvoiceRecord[]>(STORAGE_KEYS.INVOICES, () => []);
    invoices.unshift(invoice);

    this.save(STORAGE_KEYS.VEHICLES, vehicles);
    this.save(STORAGE_KEYS.MOVEMENTS, movements);
    this.save(STORAGE_KEYS.INVOICES, invoices);
  }

  /**
   * Initiate and Dispatch a Stock Transfer (Focus 5B)
   */
  public static createAndDispatchTransfer(transfer: TransferRecord): void {
    const vehicles = this.getVehicles();
    const movements = this.getMovements();
    const transfers = this.getTransfers();
    const now = new Date().toISOString();

    transfer.items.forEach((item) => {
      const v = vehicles.find((unit) => unit.vehicleId === item.vehicleId);
      if (v) {
        v.status = "IN_TRANSIT";
        v.transferId = transfer.transferId;
        v.updatedAt = now;

        movements.unshift({
          movementId: `MOV-${Date.now()}-${item.vehicleId}`,
          vehicleId: v.vehicleId,
          chassisNumber: v.chassisNumber,
          movementType: "TRANSFER_OUT",
          referenceType: "TRANSFER",
          referenceId: transfer.transferId,
          fromBranchId: transfer.fromBranchId,
          fromBranchName: transfer.fromBranchName,
          toBranchId: transfer.toBranchId || null,
          toBranchName: transfer.toBranchName || transfer.subDealerName,
          quantity: 1,
          movementDate: now,
          createdBy: transfer.initiatedBy,
          notes: `Transfer dispatched: ${transfer.transferNumber}`,
          createdAt: now,
        });
      }
    });

    transfers.unshift(transfer);
    this.save(STORAGE_KEYS.VEHICLES, vehicles);
    this.save(STORAGE_KEYS.MOVEMENTS, movements);
    this.save(STORAGE_KEYS.TRANSFERS, transfers);
  }

  /**
   * Confirm Receipt of Transfer at Destination Branch
   */
  public static receiveTransfer(
    transferId: string,
    receivedLocationId: string,
    receivedBinId: string
  ): void {
    const transfers = this.getTransfers();
    const vehicles = this.getVehicles();
    const movements = this.getMovements();
    const now = new Date().toISOString();

    const transfer = transfers.find((t) => t.transferId === transferId);
    if (!transfer) throw new Error("Transfer not found");

    transfer.status = "COMPLETED";
    transfer.receivedAt = now;
    transfer.receivedBy = "Receiving Branch Supervisor";

    const targetBranchId = transfer.toBranchId || transfer.fromBranchId;
    const targetBranch = DEFAULT_BRANCHES.find((b) => b.branchId === targetBranchId);
    const targetLocation = DEFAULT_LOCATIONS.find((l) => l.locationId === receivedLocationId);
    const targetBin = DEFAULT_STORAGE_BINS.find((b) => b.binId === receivedBinId);

    transfer.items.forEach((item) => {
      item.itemStatus = "RECEIVED";
      const v = vehicles.find((unit) => unit.vehicleId === item.vehicleId);
      if (v) {
        v.status = "AVAILABLE";
        v.branchId = targetBranchId;
        v.branchName = targetBranch?.branchName || v.branchName;
        v.locationId = targetLocation?.locationId || v.locationId;
        v.locationName = targetLocation?.locationName || v.locationName;
        v.storageBinId = targetBin?.binId || v.storageBinId;
        v.binCode = targetBin?.binCode || v.binCode;
        v.transferId = undefined;
        v.updatedAt = now;

        movements.unshift({
          movementId: `MOV-${Date.now()}-${item.vehicleId}`,
          vehicleId: v.vehicleId,
          chassisNumber: v.chassisNumber,
          movementType: "TRANSFER_IN",
          referenceType: "TRANSFER",
          referenceId: transfer.transferId,
          toBranchId: targetBranchId,
          toBranchName: targetBranch?.branchName,
          quantity: 1,
          movementDate: now,
          createdBy: "Receiving Branch Supervisor",
          notes: `Transfer completed: received in ${targetBin?.binCode || "Yard"}`,
          createdAt: now,
        });
      }
    });

    this.save(STORAGE_KEYS.TRANSFERS, transfers);
    this.save(STORAGE_KEYS.VEHICLES, vehicles);
    this.save(STORAGE_KEYS.MOVEMENTS, movements);
  }

  /**
   * Reset demonstration data back to pristine state
   */
  public static resetDemoData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.MODELS);
    window.location.reload();
  }
}

