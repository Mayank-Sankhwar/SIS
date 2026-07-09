export type HierarchyEntityType = 'discoms' | 'zones' | 'verticals' | 'sub-verticals'

export type HierarchySortBy = 'name' | 'code' | 'createdAt' | 'updatedAt' | 'isActive'
export type SortOrder = 'asc' | 'desc'
export type ActiveFilter = 'all' | 'true' | 'false'

export interface HierarchyUser {
  id: string
  name: string
  email: string
}

export interface BaseHierarchyEntity {
  id: string
  name: string
  code: string
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Discom extends BaseHierarchyEntity {
  createdById?: string
  updatedById?: string
  deletedById?: string | null
}

export interface Zone extends BaseHierarchyEntity {
  discomId: string
  discom: Discom
}

export interface Vertical extends BaseHierarchyEntity {
  zoneId: string
  zone: Zone
}

export interface SubVertical extends BaseHierarchyEntity {
  verticalId: string
  vertical: Vertical
}

export type HierarchyEntity = Discom | Zone | Vertical | SubVertical

export interface PaginatedHierarchyResponse<T> {
  items: T[]
  total: number
}

export interface HierarchyListParams {
  search?: string
  page: number
  limit: number
  sortBy: HierarchySortBy
  sortOrder: SortOrder
  isActive?: string
  discomId?: string
  zoneId?: string
  verticalId?: string
}

export interface HierarchyFormValues {
  name: string
  code: string
  discomId?: string
  zoneId?: string
  verticalId?: string
}

export type CreateHierarchyPayload = HierarchyFormValues
export type UpdateHierarchyPayload = Partial<HierarchyFormValues>

export interface BackendFieldErrors {
  formErrors?: string[]
  fieldErrors?: Record<string, string[] | undefined>
}

export interface BackendApiError {
  response?: {
    data?: {
      message?: string
      details?: BackendFieldErrors
    }
  }
}
