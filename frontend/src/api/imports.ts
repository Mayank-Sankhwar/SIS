import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { ImportExecutionResponse, ImportMode, ImportValidationResponse } from '../types/imports'

function formDataFor(file: File, mode?: ImportMode) {
  const formData = new FormData()
  formData.append('file', file)
  if (mode) {
    formData.append('mode', mode)
  }
  return formData
}

export async function validateWorkbook(file: File) {
  const response = await apiClient.post<ApiResponse<ImportValidationResponse>>('/imports/validate', formDataFor(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}

export async function importWorkbook(file: File, mode: ImportMode) {
  const response = await apiClient.post<ApiResponse<ImportExecutionResponse>>('/imports', formDataFor(file, mode), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}
