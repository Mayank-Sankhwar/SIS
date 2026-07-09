import { useMutation, useQuery } from '@tanstack/react-query'

import { exportReport, getReportPreview, reportFileName } from '../api/reports'
import type { ReportCategoryId, ReportFormat, ReportRequestParams } from '../types/reports'

export const reportQueryKeys = {
  all: ['reports'] as const,
  preview: (category: ReportCategoryId, params: ReportRequestParams) => [...reportQueryKeys.all, category, 'preview', params] as const,
}

export function useReportPreview(category: ReportCategoryId, params: ReportRequestParams) {
  return useQuery({
    queryKey: reportQueryKeys.preview(category, params),
    queryFn: () => getReportPreview(category, params),
    placeholderData: (previous) => previous,
  })
}

function downloadBlob(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}

export function useReportExport() {
  return useMutation({
    mutationFn: async ({
      category,
      format,
      params,
    }: {
      category: ReportCategoryId
      format: ReportFormat
      params: ReportRequestParams
    }) => {
      const response = await exportReport(category, format, params)
      downloadBlob(response.data, reportFileName(category, format))
      return response
    },
  })
}
