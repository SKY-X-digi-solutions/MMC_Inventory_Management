import { VehicleRecord, StockMovement, TransferRecord } from "@/types/inventory";

export class ExportService {
  /**
   * Generates and downloads a clean CSV file in the browser
   */
  public static downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export Current Stock Yard to CSV
   */
  public static exportCurrentStock(vehicles: VehicleRecord[], branchName: string): void {
    const headers = [
      "Vehicle ID",
      "Model Name",
      "Model Code",
      "Color",
      "Chassis Number (VIN)",
      "Engine Number",
      "Key No",
      "Battery No",
      "Status",
      "Branch",
      "Yard / Location",
      "Storage Bay",
      "Purchase Rate (INR)",
      "Received Date",
    ];

    const rows = vehicles.map((v) => [
      v.vehicleId,
      `"${v.modelName}"`,
      v.modelCode || "",
      `"${v.colorName}"`,
      v.chassisNumber,
      v.engineNumber,
      v.keyNumber || "",
      v.batteryNumber || "",
      v.status,
      `"${v.branchName || branchName}"`,
      `"${v.locationName || ""}"`,
      v.binCode || "",
      v.purchaseRate || 0,
      v.createdAt ? v.createdAt.split("T")[0] : "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dateStr = new Date().toISOString().split("T")[0];
    this.downloadCSV(`MMC_Yamaha_Stock_${dateStr}.csv`, csvContent);
  }

  /**
   * Export Stock Movement Audit Log
   */
  public static exportMovementLedger(movements: StockMovement[]): void {
    const headers = [
      "Movement ID",
      "Chassis Number",
      "Movement Type",
      "Reference Type",
      "Reference ID",
      "From Branch",
      "To Branch",
      "Quantity",
      "Date Time",
      "Notes",
    ];

    const rows = movements.map((m) => [
      m.movementId,
      m.chassisNumber,
      m.movementType,
      m.referenceType,
      m.referenceId,
      `"${m.fromBranchName || ""}"`,
      `"${m.toBranchName || ""}"`,
      m.quantity,
      m.movementDate ? m.movementDate.replace("T", " ").slice(0, 19) : "",
      `"${m.notes || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dateStr = new Date().toISOString().split("T")[0];
    this.downloadCSV(`MMC_Stock_Ledger_${dateStr}.csv`, csvContent);
  }

  /**
   * Export Transfers List
   */
  public static exportTransfers(transfers: TransferRecord[]): void {
    const headers = [
      "Transfer Number",
      "Transfer Type",
      "From Branch",
      "Destination",
      "Total Units",
      "Status",
      "Initiated Date",
      "Dispatched Date",
      "Received Date",
    ];

    const rows = transfers.map((t) => [
      t.transferNumber,
      t.transferType,
      `"${t.fromBranchName}"`,
      `"${t.toBranchName || t.subDealerName || ""}"`,
      t.items.length,
      t.status,
      t.initiatedAt ? t.initiatedAt.split("T")[0] : "",
      t.dispatchedAt ? t.dispatchedAt.split("T")[0] : "",
      t.receivedAt ? t.receivedAt.split("T")[0] : "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dateStr = new Date().toISOString().split("T")[0];
    this.downloadCSV(`MMC_Transfers_Report_${dateStr}.csv`, csvContent);
  }
}

