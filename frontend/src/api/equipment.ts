import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { EquipmentEntity, EquipmentListParams, EquipmentListResponse, EquipmentPayload } from '../types/equipment'

function cleanParams(params: EquipmentListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'all'),
  )
}

export async function listEquipment(endpoint: string, params: EquipmentListParams) {
  const response = await apiClient.get<EquipmentListResponse>(`/${endpoint}`, { params: cleanParams(params) })
  return response.data
}

export async function getEquipment(endpoint: string, id: string) {
  const response = await apiClient.get<ApiResponse<EquipmentEntity>>(`/${endpoint}/${id}`)
  return response.data.data
}

export async function createEquipment(endpoint: string, payload: EquipmentPayload) {
  const response = await apiClient.post<ApiResponse<EquipmentEntity>>(`/${endpoint}`, payload)
  return response.data.data
}

export async function updateEquipment(endpoint: string, id: string, payload: EquipmentPayload) {
  const response = await apiClient.patch<ApiResponse<EquipmentEntity>>(`/${endpoint}/${id}`, payload)
  return response.data.data
}

export async function deleteEquipment(endpoint: string, id: string) {
  const response = await apiClient.delete<ApiResponse<EquipmentEntity>>(`/${endpoint}/${id}`)
  return response.data.data
}
