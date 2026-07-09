import type { BackendApiError, Discom, SubVertical, Vertical, Zone } from './hierarchy'

export type SubstationSortBy = 'name' | 'code' | 'createdAt' | 'updatedAt' | 'commissioningDate' | 'voltageLevelKv'
export type SortOrder = 'asc' | 'desc'
export type ActiveFilter = 'all' | 'true' | 'false'

export interface Substation {
  id: string
  name: string
  code: string
  voltageLevelKv: number
  address: string | null
  latitude: number | null
  longitude: number | null
  commissioningDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  subVertical: SubVertical
}

export interface SubstationDetail extends Substation {
  subVerticalId: string
  createdById: string
  updatedById: string
  deletedById: string | null
  deletedAt: string | null
  createdBy: {
    id: string
    name: string
    email: string
  }
  updatedBy: {
    id: string
    name: string
    email: string
  }
}

export interface SubstationListParams {
  page: number
  limit: number
  search?: string
  sortBy: SubstationSortBy
  sortOrder: SortOrder
  discomId?: string
  zoneId?: string
  verticalId?: string
  subVerticalId?: string
  voltageLevelKv?: string
  isActive?: string
}

export interface SubstationPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SubstationListResponse {
  data: Substation[]
  pagination: SubstationPagination
}

export interface SubstationFormValues {
  discomId?: string
  zoneId?: string
  verticalId?: string
  subVerticalId?: string
  name: string
  code: string
  voltageLevelKv: string
  address?: string
  latitude?: string
  longitude?: string
  commissioningDate?: string
  isActive: boolean
}

export interface SubstationPayload {
  subVerticalId?: string
  name?: string
  code?: string
  voltageLevelKv?: number
  address?: string
  latitude?: number
  longitude?: number
  commissioningDate?: string
  isActive?: boolean
}

export interface HierarchyLookups {
  discoms: Discom[]
  zones: Zone[]
  verticals: Vertical[]
  subVerticals: SubVertical[]
}

export type SubstationApiError = BackendApiError
