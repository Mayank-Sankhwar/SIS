export type UserRole = 'EE' | 'AE' | 'JE'
export type UserStatus = 'Active' | 'Inactive' | 'Pending'
export type UserAreaType = 'DISCOM' | 'ZONE' | 'VERTICAL' | 'SUB_VERTICAL' | 'SUBSTATION'

export interface UserAreaMapping {
  id: string
  areaType: UserAreaType
  areaId: string
  areaName: string
  isPrimary: boolean
}

export interface UserRecord {
  id: string
  employeeId?: string
  name: string
  email: string
  role: UserRole | string
  designation?: string
  assignedArea: string
  status: UserStatus
  lastLogin: string | null
  createdAt: string
  createdBy: string
  areaMappings: UserAreaMapping[]
  temporaryPassword?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  role: UserRole
  employeeId?: string
  designation?: string
  areaMappings: Array<{
    areaType: UserAreaType
    isPrimary: boolean
    discomId?: string
    zoneId?: string
    verticalId?: string
    subVerticalId?: string
    substationId?: string
  }>
}

export interface UserFormValues {
  name: string
  email: string
  role: UserRole
  employeeId?: string
  designation?: string
  areaType: UserAreaType
  discomId?: string
  zoneId?: string
  verticalId?: string
  subVerticalId?: string
  substationId?: string
}
