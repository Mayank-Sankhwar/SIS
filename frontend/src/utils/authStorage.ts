import type { AuthResponse } from '../types/auth'

const ACCESS_TOKEN_KEY = 'sis_access_token'
const USER_KEY = 'sis_user'

type StoredUser = AuthResponse['data']['user']

export const AuthStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
  setUser(user: StoredUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? (JSON.parse(user) as StoredUser) : null
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
