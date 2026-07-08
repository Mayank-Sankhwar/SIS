import axios from 'axios'

import { appConfig } from '../config/env'
import { AuthStorage } from '../utils/authStorage'

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = AuthStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      AuthStorage.clearAccessToken()
    }

    return Promise.reject(error)
  },
)
