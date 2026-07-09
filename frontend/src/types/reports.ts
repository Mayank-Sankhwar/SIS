export type ReportCategoryId =
  | 'substations'
  | 'transformers'
  | 'feeders'
  | 'equipment-summary'
  | 'import-history'
  | 'import-errors'
  | 'audit-log'

export type ReportFormat = 'json' | 'xlsx' | 'pdf'

export type ReportCellValue = string | number | boolean | null

export type ReportRow = Record<string, ReportCellValue>

export type ReportStatusFilter = 'all' | 'true' | 'false'

export interface ReportFiltersState {
  discomId: string
  zoneId: string
  verticalId: string
  subVerticalId: string
  substationId: string
  voltageLevelKv: string
  isActive: ReportStatusFilter
  dateFrom: string
  dateTo: string
}

export interface ReportRequestParams {
  discomId?: string
  zoneId?: string
  verticalId?: string
  subVerticalId?: string
  substationId?: string
  voltageLevelKv?: string
  isActive?: 'true' | 'false'
  dateFrom?: string
  dateTo?: string
}

export interface ReportCategory {
  id: ReportCategoryId
  title: string
  description: string
  accent: string
}

export type ReportSortOrder = 'asc' | 'desc'

export interface ReportSortState {
  key: string
  order: ReportSortOrder
}
