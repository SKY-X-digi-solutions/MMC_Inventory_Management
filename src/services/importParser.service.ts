import { StockImportRow, StockImportSession } from "@/types/inventory";

export class ImportParserService {
  /**
   * Generates a sample Yamaha factory dispatch CSV string for demo/testing
   */
  public static getSampleYamahaDispatchCSV(): string {
    return `CHASSIS_NO,ENGINE_NO,MODEL_NAME,COLOR,KEY_NO,BATTERY_NO,MFG_DATE,PURCHASE_RATE
ME1RG431000101,EN1RG431000101,Fascino 125 Fi Hybrid DLX,Cyan Blue,KY-901,BAT-EX-101,2026-10-15,65590
ME1RG431000102,EN1RG431000102,Fascino 125 Fi Hybrid DLX,Cyan Blue,KY-902,BAT-EX-102,2026-10-15,65590
ME1RG431000103,EN1RG431000103,Fascino 125 Fi Hybrid DLX,Matte Black,KY-903,BAT-EX-103,2026-10-16,65590
ME1RG431000104,EN1RG431000104,Fascino 125 Fi Hybrid DLX,Armada Blue,KY-904,BAT-EX-104,2026-10-16,65590
ME1RG431000105,EN1RG431000105,RayZR 125 Fi Hybrid Disc,Matte Copper,KY-801,BAT-AM-201,2026-10-18,64200
ME1RG431000106,EN1RG431000106,RayZR 125 Fi Hybrid Disc,Racing Blue,KY-802,BAT-AM-202,2026-10-18,64200
ME1RG431000107,EN1RG431000107,FZ-S Fi Version 4.0 DLX,Racing Blue,KY-701,BAT-EX-301,2026-10-20,95400
ME1RG431000108,EN1RG431000108,FZ-S Fi Version 4.0 DLX,Metallic Grey,KY-702,BAT-EX-302,2026-10-20,95400
ME1RG431000109,EN1RG431000109,MT-15 V2 Deluxe,Ice Fluo-Vermillion,KY-601,BAT-YU-401,2026-10-22,121000
ME1RG431000110,EN1RG431000110,MT-15 V2 Deluxe,Cyber Green,KY-602,BAT-YU-402,2026-10-22,121000
ME1RG431000111,EN1RG431000111,R15 V4 Racing Edition,Racing Blue,KY-501,BAT-YU-501,2026-10-25,135000
ME1RG431000112,EN1RG431000112,Aerox 155 Version S,Silver Star,KY-401,BAT-EX-601,2026-10-26,110500
ME1RG431000101,EN1RG431000101,Fascino 125 Fi Hybrid DLX,Cyan Blue,KY-901,BAT-EX-101,2026-10-15,65590`;
  }

  /**
   * Parses raw CSV or TSV content into a validated StockImportSession
   * with automatic duplicate detection & deduction.
   */
  public static parseDispatchSheet(
    fileContent: string,
    fileName: string,
    supplierInvoiceNo: string,
    branchId: string,
    existingChassisRegistry: Set<string>
  ): StockImportSession {
    const lines = fileContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      throw new Error("File is empty. Please provide a valid CSV or Excel file.");
    }

    const headerLine = lines[0];
    const headers = this.parseCSVLine(headerLine).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    const getColIndex = (keywords: string[]): number => {
      return headers.findIndex((h) =>
        keywords.some((kw) => h.includes(kw.replace(/[^a-z0-9]/g, "")))
      );
    };

    const chassisIdx = getColIndex(["chassis", "vin", "frame", "chassisno", "frameno"]);
    const engineIdx = getColIndex(["engine", "engineno", "motorno"]);
    const modelIdx = getColIndex(["model", "modelname", "vehiclename", "description", "variant"]);
    const colorIdx = getColIndex(["color", "colour", "shade"]);
    const keyIdx = getColIndex(["key", "keyno", "keynumber"]);
    const batteryIdx = getColIndex(["battery", "batteryno", "battery1"]);
    const mfgDateIdx = getColIndex(["mfgdate", "manufacturingdate", "date"]);
    const rateIdx = getColIndex(["rate", "purchaserate", "price", "amount", "cost"]);

    if (chassisIdx === -1) {
      throw new Error(
        "Could not detect Chassis / VIN column in the uploaded file. Please ensure a header with 'CHASSIS_NO' or 'VIN' exists."
      );
    }

    const seenInFile = new Set<string>();
    const rows: StockImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCSVLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

      const rawChassis = (cols[chassisIdx] || "").trim().toUpperCase();
      const rawEngine = (engineIdx !== -1 ? cols[engineIdx] || "" : "").trim().toUpperCase();
      const rawModel = (modelIdx !== -1 ? cols[modelIdx] || "" : "Yamaha Motorcycle").trim();
      const rawColor = (colorIdx !== -1 ? cols[colorIdx] || "" : "Standard").trim();
      const rawKey = keyIdx !== -1 ? cols[keyIdx] || "" : "";
      const rawBattery = batteryIdx !== -1 ? cols[batteryIdx] || "" : "";
      const rawMfgDate = mfgDateIdx !== -1 ? cols[mfgDateIdx] || "" : new Date().toISOString().split("T")[0];
      const rawRate = rateIdx !== -1 ? parseFloat(cols[rateIdx].replace(/[^0-9.]/g, "")) : 0;

      let isValid = true;
      let isDuplicate = false;
      let duplicateReason: string | undefined = undefined;
      let validationError: string | undefined = undefined;

      if (!rawChassis) {
        isValid = false;
        validationError = "Missing Chassis Number";
      } else if (seenInFile.has(rawChassis)) {
        isDuplicate = true;
        isValid = false;
        duplicateReason = "Duplicate within uploaded sheet (Row repeated)";
      } else if (existingChassisRegistry.has(rawChassis)) {
        isDuplicate = true;
        isValid = false;
        duplicateReason = "Chassis already registered in dealership stock";
      }

      if (isValid) {
        seenInFile.add(rawChassis);
      }

      rows.push({
        rowNumber: i,
        chassisNumber: rawChassis,
        engineNumber: rawEngine || (rawChassis ? `ENG-${rawChassis.slice(-6)}` : ""),
        modelName: rawModel,
        color: rawColor,
        keyNumber: rawKey.trim(),
        batteryNumber: rawBattery.trim(),
        manufacturingDate: rawMfgDate,
        purchaseRate: isNaN(rawRate) ? 0 : rawRate,
        isValid,
        isDuplicate,
        duplicateReason,
        validationError,
      });
    }

    const validRows = rows.filter((r) => r.isValid).length;
    const duplicateRows = rows.filter((r) => r.isDuplicate).length;
    const invalidRows = rows.filter((r) => !r.isValid && !r.isDuplicate).length;

    return {
      importId: `IMP-${Date.now()}`,
      fileName,
      supplierInvoiceNo: supplierInvoiceNo || `YMH-INV-${Date.now().toString().slice(-5)}`,
      branchId,
      totalRows: rows.length,
      validRows,
      duplicateRows,
      invalidRows,
      rows,
      uploadedAt: new Date().toISOString(),
    };
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }
}

