import { apiClient } from './client'
import type { AuthResponse, ProfileResponse } from '../types/auth'

export async function loginUser(payload: { email: string; password: string }) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function getProfile() {
  const response = await apiClient.get<{ success: boolean; message: string; data: ProfileResponse }>('/auth/profile')
  return response.data.data
}
