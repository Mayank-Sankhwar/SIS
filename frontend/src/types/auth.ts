export type UserRole = 'ADMIN' | 'EE' | 'AE' | 'JE' | string

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthTokens {
  accessToken: string
  tokenType: 'Bearer'
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    tokenType: 'Bearer'
    user: AuthUser
  }
}

export interface ProfileResponse {
  id: string
  name: string
  email: string
  role: string
  reportingParent: {
    id: string
    name: string
    email: string
    role: string
  } | null
  assignedAreas: Array<{
    id: string
    areaType: string
    isPrimary: boolean
    area: {
      id: string
      name: string
      code: string
    }
  }>
}
