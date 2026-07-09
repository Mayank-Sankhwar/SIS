import type { AxiosResponse } from 'axios'

import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { ReportCategoryId, ReportFormat, ReportRequestParams, ReportRow } from '../types/reports'

const reportEndpointMap: Record<ReportCategoryId, string> = {
  substations: '/reports/substations',
  transformers: '/reports/transformers',
  feeders: '/reports/feeders',
  'equipment-summary': '/reports/equipment-summary',
  'import-history': '/reports/import-history',
  'import-errors': '/reports/import-errors',
  'audit-log': '/reports/audit-log',
}

const explicitPdfEndpointMap: Partial<Record<ReportCategoryId, string>> = {
  substations: '/reports/substations/pdf',
  transformers: '/reports/transformers/pdf',
  feeders: '/reports/feeders/pdf',
  'equipment-summary': '/reports/equipment-summary/pdf',
}

function cleanParams(params: ReportRequestParams & { format?: ReportFormat }) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ''),
  )
}

export async function getReportPreview(category: ReportCategoryId, params: ReportRequestParams): Promise<ReportRow[]> {
  const response = await apiClient.get<ApiResponse<ReportRow[]>>(reportEndpointMap[category], {
    params: cleanParams({ ...params, format: 'json' }),
  })

  return response.data.data
}

export async function exportReport(
  category: ReportCategoryId,
  format: ReportFormat,
  params: ReportRequestParams,
): Promise<AxiosResponse<Blob>> {
  const endpoint = format === 'pdf' ? explicitPdfEndpointMap[category] ?? reportEndpointMap[category] : reportEndpointMap[category]
  const queryParams = format === 'pdf' && explicitPdfEndpointMap[category] ? params : { ...params, format }

  return apiClient.get<Blob>(endpoint, {
    params: cleanParams(queryParams),
    responseType: 'blob',
  })
}

export function reportFileName(category: ReportCategoryId, format: ReportFormat) {
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${category}-report-${timestamp}.${format === 'xlsx' ? 'xlsx' : format}`
}
