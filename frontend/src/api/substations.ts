import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  Substation,
  SubstationDetail,
  SubstationListParams,
  SubstationListResponse,
  SubstationPayload,
} from '../types/substation'

function cleanParams(params: SubstationListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'all'),
  )
}

export async function listSubstations(params: SubstationListParams) {
  const response = await apiClient.get<SubstationListResponse>('/substations', {
    params: cleanParams(params),
  })
  return response.data
}

export async function getSubstation(id: string) {
  const response = await apiClient.get<ApiResponse<SubstationDetail>>(`/substations/${id}`)
  return response.data.data
}

export async function createSubstation(payload: SubstationPayload) {
  const response = await apiClient.post<ApiResponse<SubstationDetail>>('/substations', payload)
  return response.data.data
}

export async function updateSubstation(id: string, payload: SubstationPayload) {
  const response = await apiClient.patch<ApiResponse<SubstationDetail>>(`/substations/${id}`, payload)
  return response.data.data
}

export async function deleteSubstation(id: string) {
  const response = await apiClient.delete<ApiResponse<Substation>>(`/substations/${id}`)
  return response.data.data
}
