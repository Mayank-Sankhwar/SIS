export type ImportMode = 'INSERT_ONLY' | 'UPSERT'

export interface WorkbookSummary {
  sheetCount: number
  requiredSheetCount: number
  totalRows: number
}

export interface WorkbookSheetSummary {
  sheetName: string
  rowCount: number
  headers: string[]
  missingColumns: string[]
  extraColumns: string[]
  headerOrderValid: boolean
}

export interface WorkbookValidationIssue {
  sheetName?: string
  rowNumber: number
  columnName?: string
  fieldName?: string
  rawValue?: string
  errorCode: string
  errorMessage: string
}

export interface WorkbookValidationWarning {
  sheetName?: string
  warningCode: string
  warningMessage: string
  columns?: string[]
}

export interface UploadedWorkbookFile {
  id: string
  originalFileName: string
  mimeType: string
  fileSizeBytes: number
  checksum: string
}

export interface ImportJobInfo {
  id: string
  status: string
  totalRows: number
  failedRows: number
}

export interface ImportValidationResponse {
  isValid: boolean
  workbookSummary: WorkbookSummary
  sheetNames: string[]
  sheets: WorkbookSheetSummary[]
  validationErrors: WorkbookValidationIssue[]
  validationWarnings: WorkbookValidationWarning[]
  uploadedFile: UploadedWorkbookFile
  importJob: ImportJobInfo
}

export interface ImportSummary {
  rowsRead: number
  rowsImported: number
  rowsUpdated: number
  rowsFailed: number
  validationErrors: WorkbookValidationIssue[]
  executionTimeMs: number
}

export interface ImportExecutionResponse extends ImportValidationResponse {
  mode: ImportMode
  summary: ImportSummary
}

export interface ImportHistoryEntry {
  id: string
  status: string
  user: string
  time: string
  executionTimeMs: number | null
  rows: number
  fileName: string
}

export interface ImportApiError {
  response?: {
    data?: {
      message?: string
    }
  }
  message?: string
}
