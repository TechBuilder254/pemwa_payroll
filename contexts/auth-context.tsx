import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout as apiLogout, type User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const checkAuth = useCallback(async (): Promise<User | null> => {
    // First check if token exists in localStorage
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
    
    if (!hasToken) {
      // No token means not authenticated - set state immediately
      setUser(null)
      return null
    }

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      // Auth check failed - clear user state and token
      console.log('[Auth] Authentication check failed:', error)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      return null
    }
  }, [])

  const login = useCallback((userData: User) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      navigate('/login')
    }
  }, [navigate])

  // Check authentication on mount
  useEffect(() => {
    let mounted = true

    const verifyAuth = async () => {
      setIsLoading(true)
      
      // Immediately check if there's a token - if not, we can skip the API call
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
      
      if (!hasToken && mounted) {
        // No token - immediately set as not authenticated
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await checkAuth()
        if (mounted) {
          // User is authenticated, state is updated by checkAuth
          if (!currentUser) {
            // Ensure user is null if checkAuth returned null
            setUser(null)
          }
        }
      } catch (error) {
        // Not authenticated - user state will be null
        if (mounted) {
          setUser(null)
          // Clear any stale tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    verifyAuth()

    return () => {
      mounted = false
    }
  }, [checkAuth])

  // Watch for storage changes (logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        setUser(null)
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true })
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location.pathname, navigate])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

