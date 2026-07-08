export interface DiscomImportDto {
  name: string;
  code: string;
}

export interface ZoneImportDto {
  discomCode: string;
  name: string;
  code: string;
}

export interface VerticalImportDto {
  zoneCode: string;
  name: string;
  code: string;
}

export interface SubVerticalImportDto {
  verticalCode: string;
  name: string;
  code: string;
}

export interface SubstationImportDto {
  subVerticalCode: string;
  name: string;
  code: string;
  voltageLevelKv: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  commissioningDate?: Date;
  isActive?: boolean;
}

export interface IncomingSourceImportDto {
  substationCode: string;
  sourceName: string;
  sourceType?: string;
  voltageLevelKv: number;
  feederName?: string;
  meterNumber?: string;
  isActive?: boolean;
}

export interface OutgoingFeederImportDto {
  substationCode: string;
  feederName: string;
  feederCode?: string;
  voltageLevelKv: number;
  feederType?: string;
  connectedLoadMw?: number;
  isActive?: boolean;
}

export interface TransformerImportDto {
  substationCode: string;
  transformerCode: string;
  capacityMva: number;
  primaryVoltageKv: number;
  secondaryVoltageKv: number;
  make?: string;
  serialNumber?: string;
  commissioningDate?: Date;
  isActive?: boolean;
}

export interface LightningArresterImportDto {
  substationCode: string;
  arresterCode: string;
  locationDescription?: string;
  voltageRatingKv: number;
  make?: string;
  serialNumber?: string;
  installationDate?: Date;
  isActive?: boolean;
}

export interface BatteryBankImportDto {
  substationCode: string;
  batteryBankCode: string;
  batteryType?: string;
  voltageV: number;
  capacityAh: number;
  cellCount?: number;
  make?: string;
  installationDate?: Date;
  isActive?: boolean;
}

export interface CapacitorBankImportDto {
  substationCode: string;
  capacitorBankCode: string;
  capacityMvar: number;
  voltageLevelKv: number;
  stepsCount?: number;
  make?: string;
  installationDate?: Date;
  isActive?: boolean;
}

export type ImportMode = "INSERT_ONLY" | "UPSERT";

export interface ImportRowDto<T> {
  rowNumber: number;
  data: T;
}

export interface ParsedWorkbookDto {
  discoms: ImportRowDto<DiscomImportDto>[];
  zones: ImportRowDto<ZoneImportDto>[];
  verticals: ImportRowDto<VerticalImportDto>[];
  subVerticals: ImportRowDto<SubVerticalImportDto>[];
  substations: ImportRowDto<SubstationImportDto>[];
  incomingSources: ImportRowDto<IncomingSourceImportDto>[];
  transformers: ImportRowDto<TransformerImportDto>[];
  outgoingFeeders: ImportRowDto<OutgoingFeederImportDto>[];
  lightningArresters: ImportRowDto<LightningArresterImportDto>[];
  batteryBanks: ImportRowDto<BatteryBankImportDto>[];
  capacitorBanks: ImportRowDto<CapacitorBankImportDto>[];
}

export interface ImportSummaryDto {
  rowsRead: number;
  rowsImported: number;
  rowsUpdated: number;
  rowsFailed: number;
  validationErrors: WorkbookValidationIssue[];
  executionTimeMs: number;
}

export interface WorkbookSheetValidationSummary {
  sheetName: string;
  rowCount: number;
  headers: string[];
  missingColumns: string[];
  extraColumns: string[];
  headerOrderValid: boolean;
}

export interface WorkbookValidationIssue {
  sheetName?: string;
  rowNumber: number;
  columnName?: string;
  fieldName?: string;
  rawValue?: string;
  errorCode: string;
  errorMessage: string;
}

export interface WorkbookValidationWarning {
  sheetName?: string;
  warningCode: string;
  warningMessage: string;
  columns?: string[];
}

export interface WorkbookValidationResultDto {
  isValid: boolean;
  workbookSummary: {
    sheetCount: number;
    requiredSheetCount: number;
    totalRows: number;
  };
  sheetNames: string[];
  sheets: WorkbookSheetValidationSummary[];
  validationErrors: WorkbookValidationIssue[];
  validationWarnings: WorkbookValidationWarning[];
}

export interface ImportValidationResponseDto extends WorkbookValidationResultDto {
  uploadedFile: {
    id: string;
    originalFileName: string;
    mimeType: string;
    fileSizeBytes: number;
    checksum: string;
  };
  importJob: {
    id: string;
    status: string;
    totalRows: number;
    failedRows: number;
  };
}

export interface ImportExecutionResponseDto extends ImportValidationResponseDto {
  mode: ImportMode;
  summary: ImportSummaryDto;
}
