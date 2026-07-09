import { useQuery } from '@tanstack/react-query'

import {
  getDashboardMap,
  getDashboardSummary,
  getEquipmentDistribution,
  getEquipmentSummary,
  getFeederLoad,
  getHierarchySummary,
  getImportHistory,
  getRecentImportErrors,
  getSubstationStatus,
  getTransformerCapacity,
} from '../api/dashboard'
import type { DashboardFilters } from '../types/dashboard'

const DASHBOARD_REFRESH_INTERVAL_MS = 60_000

function dashboardQueryOptions<T>(queryKey: readonly unknown[], queryFn: () => Promise<T>) {
  return {
    queryKey,
    queryFn,
    staleTime: 30_000,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  }
}

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'summary', filters] as const,
  equipmentSummary: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'equipment-summary', filters] as const,
  hierarchySummary: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'hierarchy-summary', filters] as const,
  equipmentDistribution: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'equipment-distribution', filters] as const,
  substationStatus: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'substation-status', filters] as const,
  transformerCapacity: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'transformer-capacity', filters] as const,
  feederLoad: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'feeder-load', filters] as const,
  importHistory: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'import-history', filters] as const,
  recentImportErrors: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'recent-import-errors', filters] as const,
  map: (filters: DashboardFilters) => [...dashboardQueryKeys.all, 'map', filters] as const,
}

export function useDashboardSummary(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.summary(filters), () => getDashboardSummary(filters)))
}

export function useEquipmentSummary(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.equipmentSummary(filters), () => getEquipmentSummary(filters)))
}

export function useHierarchySummary(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.hierarchySummary(filters), () => getHierarchySummary(filters)))
}

export function useEquipmentDistribution(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.equipmentDistribution(filters), () => getEquipmentDistribution(filters)))
}

export function useSubstationStatus(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.substationStatus(filters), () => getSubstationStatus(filters)))
}

export function useTransformerCapacity(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.transformerCapacity(filters), () => getTransformerCapacity(filters)))
}

export function useFeederLoad(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.feederLoad(filters), () => getFeederLoad(filters)))
}

export function useImportHistory(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.importHistory(filters), () => getImportHistory(filters)))
}

export function useRecentImportErrors(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.recentImportErrors(filters), () => getRecentImportErrors(filters)))
}

export function useDashboardMap(filters: DashboardFilters = {}) {
  return useQuery(dashboardQueryOptions(dashboardQueryKeys.map(filters), () => getDashboardMap(filters)))
}
