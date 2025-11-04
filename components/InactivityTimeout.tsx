import { useState, useEffect } from 'react'
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'
import { InactivityTimeoutModal } from './InactivityTimeoutModal'
import { useAuth } from '@/contexts/auth-context'

interface InactivityTimeoutProps {
  /** Time in milliseconds before showing warning (default: 1 minute for testing) */
  inactivityTimeout?: number
  /** Time in milliseconds for warning countdown (default: 60 seconds) */
  warningTimeout?: number
}

/**
 * Component that handles inactivity timeout and shows warning modal
 * 
 * For testing: Uses 1 minute inactivity timeout
 * For production: Change to 10 minutes (10 * 60 * 1000)
 */
export function InactivityTimeout({
  inactivityTimeout = 60 * 1000, // 1 minute for testing (change to 10 * 60 * 1000 for production)
  warningTimeout = 60 * 1000, // 60 seconds warning countdown
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

