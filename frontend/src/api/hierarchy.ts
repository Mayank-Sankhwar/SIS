import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  CreateHierarchyPayload,
  Discom,
  HierarchyEntityType,
  HierarchyListParams,
  PaginatedHierarchyResponse,
  SubVertical,
  UpdateHierarchyPayload,
  Vertical,
  Zone,
} from '../types/hierarchy'

type EntityMap = {
  discoms: Discom
  zones: Zone
  verticals: Vertical
  'sub-verticals': SubVertical
}

function listParams(params: HierarchyListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'all'),
  )
}

export async function listHierarchyEntities<TType extends HierarchyEntityType>(
  type: TType,
  params: HierarchyListParams,
) {
  const response = await apiClient.get<ApiResponse<PaginatedHierarchyResponse<EntityMap[TType]>>>(`/${type}`, {
    params: listParams(params),
  })

  return response.data.data
}

export async function createHierarchyEntity<TType extends HierarchyEntityType>(
  type: TType,
  payload: CreateHierarchyPayload,
) {
  const response = await apiClient.post<ApiResponse<EntityMap[TType]>>(`/${type}`, payload)
  return response.data.data
}

export async function updateHierarchyEntity<TType extends HierarchyEntityType>(
  type: TType,
  id: string,
  payload: UpdateHierarchyPayload,
) {
  const response = await apiClient.patch<ApiResponse<EntityMap[TType]>>(`/${type}/${id}`, payload)
  return response.data.data
}

export async function deleteHierarchyEntity<TType extends HierarchyEntityType>(type: TType, id: string) {
  const response = await apiClient.delete<ApiResponse<EntityMap[TType]>>(`/${type}/${id}`)
  return response.data.data
}
