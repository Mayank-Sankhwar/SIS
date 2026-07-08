import type ExcelJS from "exceljs";
import type {
  BatteryBankImportDto,
  CapacitorBankImportDto,
  DiscomImportDto,
  IncomingSourceImportDto,
  LightningArresterImportDto,
  OutgoingFeederImportDto,
  ParsedWorkbookDto,
  SubstationImportDto,
  SubVerticalImportDto,
  TransformerImportDto,
  VerticalImportDto,
  WorkbookSheetValidationSummary,
  WorkbookValidationIssue,
  WorkbookValidationResultDto,
  WorkbookValidationWarning,
  ZoneImportDto
} from "../dtos/import-workbook.dto.js";
import { workbookFromBuffer } from "../utils/excel.js";
import { SUBSTATION_WORKBOOK_SHEETS } from "./substation-workbook.schema.js";

type CellValue = ExcelJS.CellValue;

export class SubstationWorkbookParser {
  async validate(buffer: Buffer): Promise<WorkbookValidationResultDto> {
    let workbook: ExcelJS.Workbook;

    try {
      workbook = await workbookFromBuffer(buffer);
    } catch {
      const validationErrors: WorkbookValidationIssue[] = [
        {
          rowNumber: 0,
          errorCode: "CORRUPTED_WORKBOOK",
          errorMessage: "Workbook could not be opened as a valid .xlsx file"
        }
      ];

      return this.buildResult([], [], validationErrors, []);
    }

    const sheetNames = workbook.worksheets.map((worksheet) => worksheet.name);
    const validationErrors = this.validateDuplicateSheets(sheetNames);
    const validationWarnings: WorkbookValidationWarning[] = [];
    const sheets: WorkbookSheetValidationSummary[] = [];

    for (const schema of SUBSTATION_WORKBOOK_SHEETS) {
      const worksheet = workbook.getWorksheet(schema.sheetName);

      if (!worksheet) {
        validationErrors.push({
          sheetName: schema.sheetName,
          rowNumber: 0,
          errorCode: "MISSING_SHEET",
          errorMessage: `Required worksheet '${schema.sheetName}' is missing`
        });
        continue;
      }

      const headers = this.readHeaders(worksheet);
      const requiredHeaders: readonly string[] = schema.headers;
      const missingColumns = requiredHeaders.filter((header) => !headers.includes(header));
      const extraColumns = headers.filter((header) => !requiredHeaders.includes(header));
      const headerOrderValid = this.isHeaderOrderValid(headers, requiredHeaders);

      for (const missingColumn of missingColumns) {
        validationErrors.push({
          sheetName: schema.sheetName,
          rowNumber: 1,
          columnName: missingColumn,
          errorCode: "MISSING_COLUMN",
          errorMessage: `Required column '${missingColumn}' is missing from '${schema.sheetName}'`
        });
      }

      if (schema.enforceHeaderOrder && !headerOrderValid) {
        validationErrors.push({
          sheetName: schema.sheetName,
          rowNumber: 1,
          errorCode: "INVALID_HEADER_ORDER",
          errorMessage: `Worksheet '${schema.sheetName}' headers must match the required order`
        });
      }

      if (extraColumns.length > 0) {
        validationWarnings.push({
          sheetName: schema.sheetName,
          warningCode: "EXTRA_COLUMNS",
          warningMessage: `Worksheet '${schema.sheetName}' contains columns that are not part of the import contract`,
          columns: extraColumns
        });
      }

      sheets.push({
        sheetName: schema.sheetName,
        rowCount: this.countDataRows(worksheet),
        headers,
        missingColumns,
        extraColumns,
        headerOrderValid
      });
    }

    return this.buildResult(sheetNames, sheets, validationErrors, validationWarnings);
  }

  async parse(buffer: Buffer): Promise<ParsedWorkbookDto> {
    const workbook = await workbookFromBuffer(buffer);

    return {
      discoms: this.readSheet<DiscomImportDto>(workbook, "Discoms", (row) => ({
        name: this.requiredText(row, "Name"),
        code: this.requiredCode(row, "Code")
      })),
      zones: this.readSheet<ZoneImportDto>(workbook, "Zones", (row) => ({
        discomCode: this.requiredCode(row, "Discom Code"),
        name: this.requiredText(row, "Name"),
        code: this.requiredCode(row, "Code")
      })),
      verticals: this.readSheet<VerticalImportDto>(workbook, "Verticals", (row) => ({
        zoneCode: this.requiredCode(row, "Zone Code"),
        name: this.requiredText(row, "Name"),
        code: this.requiredCode(row, "Code")
      })),
      subVerticals: this.readSheet<SubVerticalImportDto>(workbook, "Sub Verticals", (row) => ({
        verticalCode: this.requiredCode(row, "Vertical Code"),
        name: this.requiredText(row, "Name"),
        code: this.requiredCode(row, "Code")
      })),
      substations: this.readSheet<SubstationImportDto>(workbook, "Substations", (row) => ({
        subVerticalCode: this.requiredCode(row, "Sub Vertical Code"),
        name: this.requiredText(row, "Name"),
        code: this.requiredCode(row, "Code"),
        voltageLevelKv: this.optionalNumber(row, "Voltage Level KV") ?? Number.NaN,
        address: this.optionalText(row, "Address"),
        latitude: this.optionalNumber(row, "Latitude"),
        longitude: this.optionalNumber(row, "Longitude"),
        commissioningDate: this.optionalDate(row, "Commissioning Date"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      incomingSources: this.readSheet<IncomingSourceImportDto>(workbook, "Incoming Sources", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        sourceName: this.requiredText(row, "Source Name"),
        sourceType: this.optionalText(row, "Source Type"),
        voltageLevelKv: this.optionalNumber(row, "Voltage Level KV") ?? Number.NaN,
        feederName: this.optionalText(row, "Feeder Name"),
        meterNumber: this.optionalText(row, "Meter Number"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      transformers: this.readSheet<TransformerImportDto>(workbook, "Transformers", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        transformerCode: this.requiredCode(row, "Transformer Code"),
        capacityMva: this.optionalNumber(row, "Capacity MVA") ?? Number.NaN,
        primaryVoltageKv: this.optionalNumber(row, "Primary Voltage KV") ?? Number.NaN,
        secondaryVoltageKv: this.optionalNumber(row, "Secondary Voltage KV") ?? Number.NaN,
        make: this.optionalText(row, "Make"),
        serialNumber: this.optionalText(row, "Serial Number"),
        commissioningDate: this.optionalDate(row, "Commissioning Date"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      outgoingFeeders: this.readSheet<OutgoingFeederImportDto>(workbook, "Outgoing Feeders", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        feederName: this.requiredText(row, "Feeder Name"),
        feederCode: this.optionalText(row, "Feeder Code"),
        voltageLevelKv: this.optionalNumber(row, "Voltage Level KV") ?? Number.NaN,
        feederType: this.optionalText(row, "Feeder Type"),
        connectedLoadMw: this.optionalNumber(row, "Connected Load MW"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      lightningArresters: this.readSheet<LightningArresterImportDto>(workbook, "Lightning Arresters", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        arresterCode: this.requiredCode(row, "Arrester Code"),
        locationDescription: this.optionalText(row, "Location Description"),
        voltageRatingKv: this.optionalNumber(row, "Voltage Rating KV") ?? Number.NaN,
        make: this.optionalText(row, "Make"),
        serialNumber: this.optionalText(row, "Serial Number"),
        installationDate: this.optionalDate(row, "Installation Date"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      batteryBanks: this.readSheet<BatteryBankImportDto>(workbook, "Battery Banks", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        batteryBankCode: this.requiredCode(row, "Battery Bank Code"),
        batteryType: this.optionalText(row, "Battery Type"),
        voltageV: this.optionalNumber(row, "Voltage V") ?? Number.NaN,
        capacityAh: this.optionalNumber(row, "Capacity Ah") ?? Number.NaN,
        cellCount: this.optionalInteger(row, "Cell Count"),
        make: this.optionalText(row, "Make"),
        installationDate: this.optionalDate(row, "Installation Date"),
        isActive: this.optionalBoolean(row, "Is Active")
      })),
      capacitorBanks: this.readSheet<CapacitorBankImportDto>(workbook, "Capacitor Banks", (row) => ({
        substationCode: this.requiredCode(row, "Substation Code"),
        capacitorBankCode: this.requiredCode(row, "Capacitor Bank Code"),
        capacityMvar: this.optionalNumber(row, "Capacity MVAR") ?? Number.NaN,
        voltageLevelKv: this.optionalNumber(row, "Voltage Level KV") ?? Number.NaN,
        stepsCount: this.optionalInteger(row, "Steps Count"),
        make: this.optionalText(row, "Make"),
        installationDate: this.optionalDate(row, "Installation Date"),
        isActive: this.optionalBoolean(row, "Is Active")
      }))
    };
  }

  private buildResult(
    sheetNames: string[],
    sheets: WorkbookSheetValidationSummary[],
    validationErrors: WorkbookValidationIssue[],
    validationWarnings: WorkbookValidationWarning[]
  ): WorkbookValidationResultDto {
    const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);

    return {
      isValid: validationErrors.length === 0,
      workbookSummary: {
        sheetCount: sheetNames.length,
        requiredSheetCount: SUBSTATION_WORKBOOK_SHEETS.length,
        totalRows
      },
      sheetNames,
      sheets,
      validationErrors,
      validationWarnings
    };
  }

  private validateDuplicateSheets(sheetNames: string[]): WorkbookValidationIssue[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const sheetName of sheetNames) {
      const normalized = sheetName.trim().toLowerCase();

      if (seen.has(normalized)) {
        duplicates.add(sheetName);
      }

      seen.add(normalized);
    }

    return Array.from(duplicates).map((sheetName) => ({
      sheetName,
      rowNumber: 0,
      errorCode: "DUPLICATE_SHEET",
      errorMessage: `Duplicate worksheet '${sheetName}' found`
    }));
  }

  private readHeaders(worksheet: ExcelJS.Worksheet): string[] {
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      const header = this.cellToText(cell.value).trim();

      if (header) {
        headers.push(header);
      }
    });

    return headers;
  }

  private isHeaderOrderValid(actualHeaders: string[], requiredHeaders: readonly string[]): boolean {
    if (actualHeaders.length < requiredHeaders.length) {
      return false;
    }

    return requiredHeaders.every((header, index) => actualHeaders[index] === header);
  }

  private countDataRows(worksheet: ExcelJS.Worksheet): number {
    let rowCount = 0;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      let hasValue = false;

      row.eachCell({ includeEmpty: false }, (cell) => {
        if (this.cellToText(cell.value).trim() !== "") {
          hasValue = true;
        }
      });

      if (hasValue) {
        rowCount += 1;
      }
    });

    return rowCount;
  }

  private readSheet<T>(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    mapper: (row: Record<string, CellValue>) => T
  ) {
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      return [];
    }

    const headers = this.readHeaders(worksheet);
    const rows: Array<{ rowNumber: number; data: T }> = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 1) {
        return;
      }

      const values: Record<string, CellValue> = {};
      let hasValue = false;

      headers.forEach((header, index) => {
        const value = row.getCell(index + 1).value;
        values[header] = value;

        if (this.cellToText(value).trim() !== "") {
          hasValue = true;
        }
      });

      if (hasValue) {
        rows.push({ rowNumber, data: mapper(values) });
      }
    });

    return rows;
  }

  private optionalText(row: Record<string, CellValue>, column: string): string | undefined {
    const value = this.cellToText(row[column]).trim();
    return value ? value : undefined;
  }

  private requiredText(row: Record<string, CellValue>, column: string): string {
    return this.optionalText(row, column) ?? "";
  }

  private requiredCode(row: Record<string, CellValue>, column: string): string {
    return this.requiredText(row, column).toUpperCase();
  }

  private optionalNumber(row: Record<string, CellValue>, column: string): number | undefined {
    const value = this.optionalText(row, column);

    if (!value) {
      return undefined;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : Number.NaN;
  }

  private optionalInteger(row: Record<string, CellValue>, column: string): number | undefined {
    const value = this.optionalNumber(row, column);
    return value === undefined ? undefined : Math.trunc(value);
  }

  private optionalBoolean(row: Record<string, CellValue>, column: string): boolean | undefined {
    const value = this.optionalText(row, column)?.toLowerCase();

    if (!value) {
      return undefined;
    }

    if (["true", "yes", "y", "1", "active"].includes(value)) {
      return true;
    }

    if (["false", "no", "n", "0", "inactive"].includes(value)) {
      return false;
    }

    return undefined;
  }

  private optionalDate(row: Record<string, CellValue>, column: string): Date | undefined {
    const rawValue = row[column];

    if (rawValue instanceof Date) {
      return rawValue;
    }

    const value = this.optionalText(row, column);

    if (!value) {
      return undefined;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private cellToText(value: CellValue): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "object") {
      if ("text" in value && typeof value.text === "string") {
        return value.text;
      }

      if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText.map((part) => part.text).join("");
      }

      if ("result" in value) {
        return this.cellToText(value.result as CellValue);
      }

      return JSON.stringify(value);
    }

    return String(value);
  }
}
