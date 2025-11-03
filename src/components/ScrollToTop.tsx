import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component handles scroll restoration on route changes
 * - Scrolls to top when navigating to a new route (forward navigation)
 * - Saves scroll position when navigating away
 * - Restores scroll position ONLY when using browser back/forward buttons
 */
export function ScrollToTop() {
  const location = useLocation()
  const previousPathname = useRef<string>(location.pathname)
  const isPopStateNavigation = useRef<boolean>(false)
  const hasScrolled = useRef<boolean>(false)

  // Save scroll position before navigation
  const saveScrollPosition = (path: string) => {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    if (scrollY > 0) {
      sessionStorage.setItem(`scrollPos:${path}`, scrollY.toString())
    }
  }

  // Detect browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isPopStateNavigation.current = true
      hasScrolled.current = false
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    // Reset popstate flag after a short delay to distinguish from regular navigation
    const popStateTimeout = setTimeout(() => {
      isPopStateNavigation.current = false
    }, 100)

    // Save scroll position of previous route when pathname changes
    if (previousPathname.current && previousPathname.current !== location.pathname) {
      saveScrollPosition(previousPathname.current)
    }

    // Handle hash fragments (scroll to specific element)
    const hash = location.hash.slice(1) // Remove the #
    
    // Check for saved scroll position (only use for back/forward navigation)
    const savedScroll = sessionStorage.getItem(`scrollPos:${location.pathname}`)
    
    // Detect if this is a detail page (contains /:id pattern)
    const isDetailPage = /\/[^/]+\/[^/]+/.test(location.pathname) && location.pathname !== '/'
    
    // CRITICAL: Always scroll to top IMMEDIATELY and SYNCHRONOUSLY
    // This prevents the "bottom of previous page" flash
    // Detail pages should ALWAYS scroll to top on forward navigation
    if (!isPopStateNavigation.current || !savedScroll || isDetailPage) {
      // For forward navigation, first visit, or detail pages: scroll to top immediately
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // Also scroll the main container if it exists
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.scrollTop = 0
      }
      
      hasScrolled.current = true
    }

    // Then handle scroll restoration or hash navigation after DOM is ready
    const scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (hash) {
            // Scroll to element with matching ID
            const element = document.getElementById(hash)
            if (element) {
              const headerOffset = 80 // Account for fixed header
              const elementPosition = element.getBoundingClientRect().top
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset
              
              window.scrollTo({
                top: offsetPosition,
                left: 0,
                behavior: 'smooth'
              })
              hasScrolled.current = true
              return
            }
          }
          
          // Only restore scroll position if this was a browser back/forward navigation
          if (isPopStateNavigation.current && savedScroll !== null) {
            const scrollPosition = parseInt(savedScroll, 10)
            window.scrollTo({
              top: scrollPosition,
              left: 0,
              behavior: 'instant'
            })
            hasScrolled.current = true
          } else if (!hash) {
            // Ensure we're at top for forward navigation
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
            document.documentElement.scrollTop = 0
            document.body.scrollTop = 0
          }
        })
      })
    }, 50) // Small delay to ensure DOM is ready
    
    previousPathname.current = location.pathname
    
    // Cleanup: save scroll position when leaving this route and clear timeouts
    return () => {
      clearTimeout(scrollTimeout)
      clearTimeout(popStateTimeout)
      if (location.pathname === previousPathname.current) {
        saveScrollPosition(location.pathname)
      }
    }
  }, [location.pathname, location.hash])

  return null
}

