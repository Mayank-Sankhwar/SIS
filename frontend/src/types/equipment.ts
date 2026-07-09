import type { BackendApiError } from './hierarchy'
import type { Substation } from './substation'

export type EquipmentType =
  | 'incoming-sources'
  | 'outgoing-feeders'
  | 'transformers'
  | 'lightning-arresters'
  | 'battery-banks'
  | 'capacitor-banks'

export type EquipmentFieldType = 'text' | 'number' | 'date' | 'checkbox'
export type EquipmentSortOrder = 'asc' | 'desc'

export interface EquipmentUser {
  id: string
  name: string
  email: string
}

export interface EquipmentEntity {
  id: string
  substationId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  createdBy?: EquipmentUser | null
  updatedBy?: EquipmentUser | null
  deletedBy?: EquipmentUser | null
  substation: Substation
  [key: string]: unknown
}

export interface EquipmentPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface EquipmentListResponse {
  success: boolean
  data: EquipmentEntity[]
  pagination: EquipmentPagination
}

export interface EquipmentListParams {
  page: number
  limit: number
  search?: string
  sortBy: string
  sortOrder: EquipmentSortOrder
  discomId?: string
  zoneId?: string
  verticalId?: string
  subVerticalId?: string
  substationId?: string
  isActive?: string
  [key: string]: string | number | undefined
}

export interface EquipmentFieldConfig {
  name: string
  label: string
  type: EquipmentFieldType
  required?: boolean
  createOnly?: boolean
  readOnlyOnEdit?: boolean
  min?: number
  step?: string
}

export interface EquipmentColumnConfig {
  key: string
  label: string
  sortable?: boolean
}

export interface EquipmentConfig {
  type: EquipmentType
  title: string
  endpoint: string
  route: string
  primaryField: string
  defaultSortBy: string
  columns: EquipmentColumnConfig[]
  fields: EquipmentFieldConfig[]
  numericFilters?: EquipmentFieldConfig[]
  textFilters?: EquipmentFieldConfig[]
}

export type EquipmentPayload = Record<string, string | number | boolean | undefined>
export type EquipmentApiError = BackendApiError
