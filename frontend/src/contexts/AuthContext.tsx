import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { getProfile, loginUser } from '../api/auth'
import { AuthStorage } from '../utils/authStorage'
import type { AuthUser, ProfileResponse, UserRole } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const role = user?.role ?? profile?.role ?? null
  const isAuthenticated = Boolean(user || profile)

  const logout = useCallback(() => {
    AuthStorage.clear()
    setUser(null)
    setProfile(null)
    setIsLoading(false)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = AuthStorage.getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const payload = await getProfile()
      setProfile(payload)
      setUser((current) => current ?? ({ id: payload.id, name: payload.name, email: payload.email, role: payload.role }))
    } catch {
      AuthStorage.clear()
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await loginUser({ email, password })
      const authData = response.data
      AuthStorage.setAccessToken(authData.accessToken)
      AuthStorage.setUser(authData.user)
      setUser(authData.user)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshSession,
    }),
    [isAuthenticated, isLoading, login, logout, profile, refreshSession, role, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
