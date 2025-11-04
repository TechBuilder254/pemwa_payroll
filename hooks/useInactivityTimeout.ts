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
  const tabHiddenTimeRef = useRef<number | null>(null) // Track when tab was hidden

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

    // Check if user has been inactive too long when component mounts
    // This handles cases where page was refreshed or reopened
    const timeSinceLastActivity = Date.now() - lastActivityRef.current
    const totalTimeout = inactivityTimeout + warningTimeout
    
    if (timeSinceLastActivity >= totalTimeout) {
      // User has been inactive too long - logout immediately
      console.log('[InactivityTimeout] User inactive too long on mount - logging out')
      onLogout()
      return
    } else if (timeSinceLastActivity >= inactivityTimeout) {
      // User has been inactive longer than timeout - show warning
      console.log('[InactivityTimeout] User inactive on mount - showing warning')
      warningShownRef.current = true
      onWarning()
      
      const remainingWarningTime = totalTimeout - timeSinceLastActivity
      if (remainingWarningTime > 0) {
        warningTimerRef.current = setTimeout(() => {
          onLogout()
        }, remainingWarningTime)
      } else {
        onLogout()
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

    // Track visibility changes (tab focus/blur)
    // This is critical for detecting when user switches tabs or goes to another website
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab was hidden - record the time
        tabHiddenTimeRef.current = Date.now()
        console.log('[InactivityTimeout] Tab hidden at:', new Date(tabHiddenTimeRef.current).toISOString())
      } else if (document.visibilityState === 'visible') {
        // Tab became visible again - check how long it was hidden
        if (tabHiddenTimeRef.current !== null) {
          const timeHidden = Date.now() - tabHiddenTimeRef.current
          const timeSinceLastActivity = Date.now() - lastActivityRef.current
          const totalInactiveTime = Math.max(timeHidden, timeSinceLastActivity)
          
          console.log('[InactivityTimeout] Tab visible again after:', Math.round(timeHidden / 1000), 'seconds')
          console.log('[InactivityTimeout] Total inactive time:', Math.round(totalInactiveTime / 1000), 'seconds')
          
          // If user was away longer than inactivity timeout + warning timeout, log them out immediately
          const totalTimeout = inactivityTimeout + warningTimeout
          if (totalInactiveTime >= totalTimeout) {
            console.log('[InactivityTimeout] User was away too long - logging out immediately')
            onLogout()
            return
          }
          
          // If user was away longer than inactivity timeout, show warning immediately
          if (totalInactiveTime >= inactivityTimeout) {
            console.log('[InactivityTimeout] User was away longer than inactivity timeout - showing warning')
            warningShownRef.current = true
            onWarning()
            
            // Calculate remaining warning time
            const remainingWarningTime = totalTimeout - totalInactiveTime
            if (remainingWarningTime > 0) {
              warningTimerRef.current = setTimeout(() => {
                onLogout()
              }, remainingWarningTime)
            } else {
              // No time left, logout immediately
              onLogout()
            }
            return
          }
        }
        
        // If user wasn't away too long, reset timers normally
        if (!warningShownRef.current) {
          resetTimers()
        }
        
        tabHiddenTimeRef.current = null
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

