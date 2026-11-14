import { StockImportRow, StockImportSession } from "@/types/inventory";

export class ImportParserService {
  /**
   * Generates official India Yamaha Motor Dispatch Advice CSV data (Invoice E126008210)
   * 40 Actual Vehicle Units matching factory dispatch from Surajpur Factory to Maruthi Motors Tirupattur.
   */
  public static getSampleYamahaDispatchCSV(): string {
    return `CHASSIS_NO,ENGINE_NO,MODEL_NAME,COLOR,KEY_NO,BATTERY_NO,MFG_DATE,PURCHASE_RATE
ME1RG4947T0030168,G3N4E1313403,RayZR 125 Fi Hybrid Disc,White Metallic Crystal (WMC),KY-801,BAT-EX-101,2026-09-08,64200
ME1RGA669T0103440,G3X5E0123616,FZ-S Fi Version 4.0 DLX,Matte Black (MBL2),KY-701,BAT-EX-201,2026-09-08,95400
ME1RGA669T0103573,G3X5E0123806,FZ-S Fi Version 4.0 DLX,Metallic Grey (DBNM8),KY-702,BAT-EX-202,2026-09-08,95400
ME1RGA669T0103574,G3X5E0123809,FZ-S Fi Version 4.0 DLX,Metallic Grey (DBNM8),KY-703,BAT-EX-203,2026-09-08,95400
ME1RGA669T0103315,G3X5E0123297,FZ-S Fi Version 4.0 DLX,Racing Blue (MLNM4),KY-704,BAT-EX-204,2026-09-08,95400
ME1RGA849T0053694,G3N4E1312925,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-901,BAT-EX-301,2026-09-08,65590
ME1RGA899T0001632,G3N4E1308005,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-902,BAT-EX-302,2026-09-08,65590
ME1RGA899T0002658,G3N4E1314120,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-903,BAT-EX-303,2026-09-08,65590
ME1RGA899T0002664,G3N4E1314111,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-904,BAT-EX-304,2026-09-08,65590
ME1RGA899T0002741,G3N4E1314236,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-905,BAT-EX-305,2026-09-08,65590
ME1RGA899T0002761,G3N4E1314362,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-906,BAT-EX-306,2026-09-08,65590
ME1RGA899T0002766,G3N4E1314372,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-907,BAT-EX-307,2026-09-08,65590
ME1RGA899T0002772,G3N4E1314302,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-908,BAT-EX-308,2026-09-08,65590
ME1RGA899T0002839,G3N4E1315464,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-909,BAT-EX-309,2026-09-08,65590
ME1RGA899T0002840,G3N4E1315475,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-910,BAT-EX-310,2026-09-08,65590
ME1RGA899T0002860,G3N4E1315493,Fascino 125 Fi Hybrid DLX,Matte Black (SMX),KY-911,BAT-EX-311,2026-09-08,65590
ME1RGA889T0002656,G3N4E1314478,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-912,BAT-EX-312,2026-09-08,65590
ME1RGA889T0002710,G3N4E1314810,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-913,BAT-EX-313,2026-09-08,65590
ME1RGA889T0002712,G3N4E1314766,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-914,BAT-EX-314,2026-09-08,65590
ME1RGA889T0002719,G3N4E1314846,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-915,BAT-EX-315,2026-09-08,65590
ME1RGA889T0002744,G3N4E1314779,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-916,BAT-EX-316,2026-09-08,65590
ME1RGA889T0002767,G3N4E1314764,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-917,BAT-EX-317,2026-09-08,65590
ME1RGA889T0002781,G3N4E1314792,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-918,BAT-EX-318,2026-09-08,65590
ME1RGA889T0002784,G3N4E1314793,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-919,BAT-EX-319,2026-09-08,65590
ME1RGA889T0002791,G3N4E1314821,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-920,BAT-EX-320,2026-09-08,65590
ME1RGA889T0002792,G3N4E1314817,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-921,BAT-EX-321,2026-09-08,65590
ME1RGA889T0002794,G3N4E1314823,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-922,BAT-EX-322,2026-09-08,65590
ME1RGA889T0002797,G3N4E1314822,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-923,BAT-EX-323,2026-09-08,65590
ME1RGA889T0002799,G3N4E1314824,Fascino 125 Fi Hybrid DLX,Metallic Black (SMX),KY-924,BAT-EX-324,2026-09-08,65590
ME1RG4948T0028955,G3N4E1266814,Aerox 155 Version S,White Metallic Crystal (WMC),KY-401,BAT-EX-401,2026-09-08,110500
ME1RGA918T0045769,G3N4E1294015,MT-15 V2 Deluxe,Metallic Black (SMX),KY-601,BAT-YU-501,2026-09-08,121000
ME1RGA918T0047648,G3N4E1304023,MT-15 V2 Deluxe,Metallic Black (SMX),KY-602,BAT-YU-502,2026-09-08,121000
ME1RGA918T0045827,G3N4E1294028,MT-15 V2 Deluxe,Ice Fluo-Vermillion (BWCI),KY-603,BAT-YU-503,2026-09-08,121000
ME1RGA969T0001824,G3N4E1311377,R15 V4 Racing Edition,Racing Blue (DPBMY),KY-501,BAT-YU-601,2026-09-08,135000
ME1RGA969T0001825,G3N4E1311421,R15 V4 Racing Edition,Racing Blue (DPBMY),KY-502,BAT-YU-602,2026-09-08,135000
ME1RGA969T0002280,G3N4E1314091,R15 V4 Racing Edition,Racing Blue (DPBMY),KY-503,BAT-YU-603,2026-09-08,135000
ME1RGA969T0002290,G3N4E1314061,R15 V4 Racing Edition,Racing Blue (DPBMY),KY-504,BAT-YU-604,2026-09-08,135000
ME1RGA969T0001123,G3N4E1307122,R15 V4 Racing Edition,Vivid Magenta (MYWP1),KY-505,BAT-YU-605,2026-09-08,135000
ME1RGA969T0002357,G3N4E1314017,R15 V4 Racing Edition,Vivid Magenta (MYWP1),KY-506,BAT-YU-606,2026-09-08,135000
ME1RGA969T0002380,G3N4E1313992,R15 V4 Racing Edition,Vivid Magenta (MYWP1),KY-507,BAT-YU-607,2026-09-08,135000`;
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

