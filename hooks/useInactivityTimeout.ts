import { useEffect, useRef, useCallback } from 'react'

interface UseInactivityTimeoutOptions {
  /** Time in milliseconds before showing warning (default: 1 minute for testing) */
  inactivityTimeout: number
  /** Time in milliseconds for warning countdown (default: 60 seconds) */
  warningTimeout: number
  /** Callback when warning should be shown */
  onWarning: () => void
  /** Callback when user should be logged out */
  onLogout: () => void
  /** Whether the timeout is enabled */
  enabled?: boolean
}

/**
 * Hook to track user inactivity and trigger warnings/logout
 * 
 * @example
 * useInactivityTimeout({
 *   inactivityTimeout: 60 * 1000, // 1 minute
 *   warningTimeout: 60 * 1000, // 60 seconds warning
 *   onWarning: () => setShowWarning(true),
 *   onLogout: () => logout(),
 *   enabled: isAuthenticated
 * })
 */
export function useInactivityTimeout({
  inactivityTimeout,
  warningTimeout,
  onWarning,
  onLogout,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)
  const STORAGE_KEY = 'last_activity_time'
  const CHECK_INTERVAL = 30000 // Check every 30 seconds
  
  // Get last activity time from localStorage or use current time
  const getLastActivityTime = (): number => {
    if (typeof window === 'undefined') return Date.now()
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : Date.now()
  }
  
  // Save last activity time to localStorage
  const saveLastActivityTime = (time: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, time.toString())
    }
  }
  
  const lastActivityRef = useRef<number>(getLastActivityTime())

  // Check if timeout has been reached based on elapsed time
  const checkTimeout = useCallback(() => {
    if (!enabled) return

    const lastActivity = getLastActivityTime()
    const timeSinceLastActivity = Date.now() - lastActivity
    const totalTimeout = inactivityTimeout + warningTimeout

    // If total timeout exceeded, logout immediately
    if (timeSinceLastActivity >= totalTimeout) {
      console.log('[InactivityTimeout] Total timeout exceeded - logging out immediately')
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
        warningTimerRef.current = null
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      warningShownRef.current = false
      onLogout()
      return true
    }

    // If inactivity timeout exceeded but not total timeout, show warning
    if (timeSinceLastActivity >= inactivityTimeout && !warningShownRef.current) {
      console.log('[InactivityTimeout] Inactivity timeout exceeded - showing warning')
      warningShownRef.current = true
      onWarning()

      // Calculate remaining warning time
      const remainingWarningTime = totalTimeout - timeSinceLastActivity
      if (remainingWarningTime > 0) {
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current)
        }
        warningTimerRef.current = setTimeout(() => {
          onLogout()
        }, remainingWarningTime)
      } else {
        // No time left, logout immediately
        onLogout()
      }
      return true
    }

    return false
  }, [enabled, inactivityTimeout, warningTimeout, onWarning, onLogout])

  // Reset timers when user is active
  const resetTimers = useCallback(() => {
    if (!enabled) return

    const now = Date.now()
    lastActivityRef.current = now
    saveLastActivityTime(now) // Persist to localStorage
    warningShownRef.current = false

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }

    // Set new inactivity timer as backup (though we primarily use interval-based checking)
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning when inactivity timeout is reached
      if (!warningShownRef.current) {
        warningShownRef.current = true
        onWarning()

        // Start countdown timer for automatic logout
        warningTimerRef.current = setTimeout(() => {
          onLogout()
        }, warningTimeout)
      }
    }, inactivityTimeout)
  }, [enabled, inactivityTimeout, warningTimeout, onWarning, onLogout])

  // Extend session (user clicked "Stay Logged In")
  const extendSession = useCallback(() => {
    if (!enabled) return

    warningShownRef.current = false

    // Clear warning timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }

    // Reset inactivity timer
    resetTimers()
  }, [enabled, resetTimers])

  // Track user activity
  useEffect(() => {
    if (!enabled) {
      // Clear timers when disabled
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
        warningTimerRef.current = null
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      return
    }

    // Check if user has been inactive too long when component mounts
    // This handles cases where page was refreshed or reopened
    // Re-read from localStorage to get accurate last activity time
    const lastActivity = getLastActivityTime()
    lastActivityRef.current = lastActivity
    
    // Check timeout immediately on mount
    if (checkTimeout()) {
      // Timeout already reached, cleanup will happen in checkTimeout
      return
    }
    
    // Initialize timer on mount
    resetTimers()

    // Start continuous interval-based checking
    // This works even when tab is hidden (though browser may throttle it)
    // The key is we check against localStorage which persists across tabs
    checkIntervalRef.current = setInterval(() => {
      const timeoutReached = checkTimeout()
      // If timeout was reached, the interval will be cleared by cleanup
      // when enabled becomes false (after logout)
      if (timeoutReached && checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }, CHECK_INTERVAL)

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ]

    // Throttle activity tracking to avoid too many resets
    let throttleTimeout: NodeJS.Timeout | null = null
    const handleActivity = () => {
      if (throttleTimeout) return

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null
        // Only reset if warning is not shown (to avoid resetting during countdown)
        if (!warningShownRef.current) {
          resetTimers()
        }
      }, 1000) // Throttle to once per second
    }

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Track visibility changes (tab focus/blur)
    // When tab becomes visible, immediately check timeout
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[InactivityTimeout] Tab became visible - checking timeout immediately')
        // Immediately check timeout when tab becomes visible
        checkTimeout()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for window focus events
    const handleFocus = () => {
      console.log('[InactivityTimeout] Window focused - checking timeout immediately')
      checkTimeout()
    }
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [enabled, resetTimers, checkTimeout])

  return {
    extendSession,
    resetTimers,
  }
}

