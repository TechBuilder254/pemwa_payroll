import React, { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Prevent back button access - ensure authentication is checked
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Clear any stored auth data and force redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        // Replace history to prevent back button access
        navigate('/login', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  // Prevent browser back/forward navigation to protected pages
  useEffect(() => {
    if (!isAuthenticated) {
      // Disable browser back button
      window.history.pushState(null, '', window.location.href)
      
      const handlePopState = () => {
        if (!isAuthenticated) {
          window.history.pushState(null, '', window.location.href)
          navigate('/login', { replace: true })
        }
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login with return url - using replace to prevent back button
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

