import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  DashboardFilters,
  DashboardMapMarker,
  DashboardSummary,
  EquipmentDistribution,
  EquipmentSummary,
  FeederLoad,
  HierarchySummary,
  ImportHistoryItem,
  RecentImportError,
  SubstationStatus,
  TransformerCapacity,
} from '../types/dashboard'

function dashboardParams(filters?: DashboardFilters) {
  if (!filters) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
}

async function getDashboardData<T>(endpoint: string, filters?: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<T>>(endpoint, {
    params: dashboardParams(filters),
  })

  return response.data.data
}

export function getDashboardSummary(filters?: DashboardFilters) {
  return getDashboardData<DashboardSummary>('/dashboard/summary', filters)
}

export function getEquipmentSummary(filters?: DashboardFilters) {
  return getDashboardData<EquipmentSummary>('/dashboard/equipment-summary', filters)
}

export function getHierarchySummary(filters?: DashboardFilters) {
  return getDashboardData<HierarchySummary>('/dashboard/hierarchy-summary', filters)
}

export function getEquipmentDistribution(filters?: DashboardFilters) {
  return getDashboardData<EquipmentDistribution>('/dashboard/equipment-distribution', filters)
}

export function getSubstationStatus(filters?: DashboardFilters) {
  return getDashboardData<SubstationStatus>('/dashboard/substation-status', filters)
}

export function getTransformerCapacity(filters?: DashboardFilters) {
  return getDashboardData<TransformerCapacity>('/dashboard/transformer-capacity', filters)
}

export function getFeederLoad(filters?: DashboardFilters) {
  return getDashboardData<FeederLoad>('/dashboard/feeder-load', filters)
}

export function getImportHistory(filters?: DashboardFilters) {
  return getDashboardData<ImportHistoryItem[]>('/dashboard/import-history', filters)
}

export function getRecentImportErrors(filters?: DashboardFilters) {
  return getDashboardData<RecentImportError[]>('/dashboard/recent-import-errors', filters)
}

export function getDashboardMap(filters?: DashboardFilters) {
  return getDashboardData<DashboardMapMarker[]>('/dashboard/map', filters)
}
