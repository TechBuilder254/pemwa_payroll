import { useState, useEffect } from 'react'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { InactivityTimeoutModal } from './InactivityTimeoutModal'
import { useAuth } from '@/contexts/auth-context'

interface InactivityTimeoutProps {
  /** Time in milliseconds before showing warning (default: 10 minutes) */
  inactivityTimeout?: number
  /** Time in milliseconds for warning countdown (default: 60 seconds) */
  warningTimeout?: number
}

/**
 * Component that handles inactivity timeout and shows warning modal
 * 
 * Inactivity timeout: 10 minutes before showing warning
 * Warning countdown: 60 seconds before automatic logout
 */
export function InactivityTimeout({
  inactivityTimeout = 10 * 60 * 1000, // 10 minutes inactivity timeout
  warningTimeout = 60 * 1000, // 60 seconds warning countdown before logout
}: InactivityTimeoutProps) {
  const { isAuthenticated, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(warningTimeout / 1000)

  // Handle logout
  const handleLogout = async () => {
    setShowWarning(false)
    await logout()
  }

  // Handle staying logged in
  const handleStayLoggedIn = () => {
    setShowWarning(false)
    extendSession()
  }

  const { extendSession } = useInactivityTimeout({
    inactivityTimeout,
    warningTimeout,
    enabled: isAuthenticated,
    onWarning: () => {
      setShowWarning(true)
      setTimeRemaining(warningTimeout / 1000)
    },
    onLogout: handleLogout,
  })

  // Update time remaining countdown
  useEffect(() => {
    if (!showWarning) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showWarning])

  // Reset warning state when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <InactivityTimeoutModal
      open={showWarning}
      timeRemaining={timeRemaining}
      onStayLoggedIn={handleStayLoggedIn}
      onLogout={handleLogout}
    />
  )
}

