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
  const warningShownRef = useRef(false)
  const lastActivityRef = useRef<number>(Date.now())

  // Reset timers when user is active
  const resetTimers = useCallback(() => {
    if (!enabled) return

    const now = Date.now()
    lastActivityRef.current = now
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

    // Set new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      // Show warning when inactivity timeout is reached
      warningShownRef.current = true
      onWarning()

      // Start countdown timer for automatic logout
      warningTimerRef.current = setTimeout(() => {
        onLogout()
      }, warningTimeout)
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
      return
    }

    // Initialize timer on mount
    resetTimers()

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

    // Also track visibility changes (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !warningShownRef.current) {
        resetTimers()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
  }, [enabled, resetTimers])

  return {
    extendSession,
    resetTimers,
  }
}

