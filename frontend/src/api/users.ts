import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type { CreateUserPayload, UserRecord } from '../types/user'

export async function createUser(payload: CreateUserPayload) {
  const response = await apiClient.post<ApiResponse<{ user: UserRecord; temporaryPassword: string; areaMappings: unknown[] }>>('/users', payload)
  return response.data.data
}

export async function listUsers(params: Record<string, string | number | undefined>) {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  )

  const response = await apiClient.get<ApiResponse<{ data: UserRecord[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>>('/users', { params: query })
  return response.data.data
}
