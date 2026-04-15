import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth'
import { getCurrentUser } from '../api/user'
import { saveTokens, clearTokens } from '../api/client'
import type { CurrentUser, LoginRequest, RegisterRequest } from '../types'

interface AuthState {
  user: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // 初始化：检查是否有 token，有则获取用户信息
  useEffect(() => {
    // 兼容多种存储位置：sessionStorage、localStorage
    const token = 
      sessionStorage.getItem('accessToken') || 
      localStorage.getItem('accessToken') || 
      localStorage.getItem('token')
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    let cancelled = false
    getCurrentUser()
      .then((u) => {
        if (!cancelled) {
          setState({ user: u, isAuthenticated: true, isLoading: false })
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTokens()
          setState({ user: null, isAuthenticated: false, isLoading: false })
        }
      })

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const result = await apiLogin(data)
    saveTokens(result.accessToken, result.refreshToken)
    const user = await getCurrentUser()
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await apiRegister(data)
    saveTokens(result.accessToken, result.refreshToken)
    const user = await getCurrentUser()
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      clearTokens()
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      setState((prev) => ({ ...prev, user, isAuthenticated: true }))
    } catch {
      // 静默失败，不中断应用
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
