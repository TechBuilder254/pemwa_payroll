"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Menu, X, Users, Calculator, FileText, BarChart3, Settings, ChevronLeft, ChevronRight, Building2, LogOut, Shield } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/logo"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Payroll", href: "/payroll", icon: Calculator },
  { name: "Payslips", href: "/payslips", icon: FileText },
  { name: "Remittances", href: "/remittances", icon: Building2 },
  { name: "P9 Forms", href: "/p9", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "System Control", href: "/system-control", icon: Shield },
]

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(true) // Default to mobile for SSR
  const { isCollapsed, isPinned, isHovered, shouldExpand, setIsCollapsed, setIsPinned, setIsHovered } = useSidebar()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const prefersReducedMotion = useReducedMotion()

  // Detect mobile on client side (after mount)
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // 640px is Tailwind's sm breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sidebarWidth = shouldExpand ? "w-64" : "w-16"

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b-2 border-border/50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Logo variant="icon" size="md" />
            <div>
              <span className="font-bold text-xs text-[#1e3a8a] dark:text-blue-400 uppercase">PEMWA AGENCY</span>
              <p className="text-[10px] font-medium text-[#84cc16] dark:text-green-400 uppercase">PAYROLL</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 w-9"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1 }}
                exit={prefersReducedMotion ? {} : { opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 h-screen"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: "100%" }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, x: "100%" }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-screen w-64 max-w-[75vw] bg-background border-l shadow-xl z-50"
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex flex-col h-full">
                  {/* Header - Fixed at top, compact */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Logo variant="icon" size="md" />
                      <div>
                        <span className="font-bold text-xs text-[#1e3a8a] dark:text-blue-400 uppercase">PEMWA AGENCY</span>
                        <p className="text-[9px] font-medium text-[#84cc16] dark:text-green-400 uppercase">PAYROLL</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Navigation Items - Compact, no scroll needed, all items visible */}
                  <div className="flex-1 px-2 py-1 space-y-0.5 flex flex-col justify-start overflow-visible">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      const isSettings = item.name === "Settings"
                      
                      return (
                        <React.Fragment key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border flex-shrink-0",
                              isActive
                                ? "bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-lg border-primary/50"
                                : "text-slate-700 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-card/80 border-transparent hover:border-border/50"
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        </React.Fragment>
                      )
                    })}
                  </div>
                  
                  {/* Theme Toggle and Logout - Mobile only, always at bottom */}
                  <div className="px-2 py-2 border-t border-border/50 space-y-1 flex-shrink-0 bg-background">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-card/50">
                      <span className="text-sm font-semibold text-slate-700 dark:text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    {/* Logout Button */}
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        setIsLoggingOut(true)
                        try {
                          await logout()
                          setIsOpen(false)
                        } finally {
                          setIsLoggingOut(false)
                        }
                      }}
                      disabled={isLoggingOut}
                      className="w-full justify-start text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto min-h-[36px]"
                    >
                      <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Desktop Navigation - Hidden on mobile */}
      {!isMobile && (
        <motion.nav 
          className={cn(
            "flex flex-col fixed left-0 top-0 bottom-0 z-40",
            "bg-card/80 backdrop-blur-xl border-r-2 border-border/50",
            "shadow-2xl",
            // Hide scrollbars when collapsed and ensure overflow is hidden during animation
            !shouldExpand && "scrollbar-hide",
            "overflow-hidden" // Always clip content to prevent overflow during animation
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={prefersReducedMotion ? undefined : { width: shouldExpand ? 200 : 56 }}
          transition={prefersReducedMotion ? { duration: 0 } : { 
            type: "spring", 
            damping: 35, 
            stiffness: 400,
            mass: 0.7
          }}
          style={{
            scrollbarWidth: !shouldExpand ? 'none' : undefined,
            msOverflowStyle: !shouldExpand ? 'none' : undefined,
            overflowX: 'hidden',
          }}
        >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-border/50",
            shouldExpand ? "px-3 py-4" : "px-2 py-3 justify-center"
          )}>
            <motion.div 
              className="flex-shrink-0"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <Logo variant={shouldExpand ? "compact" : "icon"} showText={false} size="md" />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {shouldExpand && (
                <>
                  <motion.div 
                    className="ml-3 overflow-hidden flex-1 min-w-0"
                    initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, width: 'auto' }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, width: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { 
                      type: "spring", 
                      damping: 30, 
                      stiffness: 300,
                      delay: 0.05
                    }}
                  >
                    <h1 className="text-xs font-bold whitespace-nowrap text-[#1e3a8a] dark:text-blue-400 uppercase tracking-tight">
                      PEMWA AGENCY
                    </h1>
                    <p className="text-[10px] font-medium text-[#84cc16] dark:text-green-400 whitespace-nowrap uppercase tracking-wide">
                      PAYROLL SYSTEM
                    </p>
                  </motion.div>
                  
                  {/* Toggle Button */}
                  <motion.div
                    className="ml-auto flex-shrink-0"
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0 }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-accent/60 transition-colors border border-border/50"
                      onClick={() => {
                        setIsCollapsed(!isCollapsed)
                        setIsPinned(!isCollapsed)
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Navigation Items */}
          <div className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            shouldExpand ? "px-2 py-3 space-y-1.5" : "px-2 py-4 space-y-2",
            // Hide scrollbar completely when collapsed
            !shouldExpand && "scrollbar-hide"
          )}
          style={!shouldExpand ? {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } : {
            scrollbarWidth: 'thin',
          }}
          >
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isSettings = item.name === "Settings"
              
              return (
                <React.Fragment key={item.name}>
                  <motion.div
                    layout
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { 
                      delay: index * 0.05,
                      type: "spring",
                      damping: 25,
                      stiffness: 200,
                      layout: { type: "spring", damping: 30, stiffness: 300 }
                    }}
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-semibold transition-all duration-300 group relative overflow-hidden min-w-0",
                        "hover:bg-accent/50",
                        shouldExpand ? "px-3 py-2.5" : "px-3 py-2.5 justify-center",
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground"
                      )}
                      title={!shouldExpand ? item.name : undefined}
                    >
                      {/* Left border indicator for active state */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                          layoutId="activeIndicator"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                      
                      <motion.div
                        className={cn(
                          "rounded-lg transition-colors flex items-center justify-center",
                          shouldExpand ? "p-1.5" : "p-2",
                          isActive 
                            ? "kenya-gradient" 
                            : "group-hover:bg-accent/50"
                        )}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                      >
                        <Icon className={cn(
                          "flex-shrink-0 transition-colors",
                          shouldExpand ? "h-4 w-4" : "h-4 w-4",
                          isActive 
                            ? "text-white" 
                            : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-foreground"
                        )} />
                      </motion.div>
                      
                      <AnimatePresence mode="wait">
                        {shouldExpand && (
                        <motion.span 
                          className="ml-3 font-semibold whitespace-nowrap flex-1 overflow-hidden text-sm"
                          initial={prefersReducedMotion ? false : { opacity: 0, width: 0 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, width: 'auto' }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, width: 0 }}
                          transition={prefersReducedMotion ? { duration: 0 } : { 
                            type: "spring", 
                            damping: 30, 
                            stiffness: 300,
                            delay: 0.08
                          }}
                        >
                          {item.name}
                        </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {/* Enhanced Tooltip for collapsed state */}
                      {!shouldExpand && (
                        <motion.div 
                          className="absolute left-full ml-3 px-3 py-2 bg-popover border border-border text-popover-foreground text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap"
                        >
                          {item.name}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                  
                </React.Fragment>
              )
            })}
          </div>
          
          {/* Footer - Theme and Logout (Desktop only - Theme not shown in desktop) */}
          <div className={cn(
            "border-t border-border/50 flex-shrink-0",
            shouldExpand ? "px-3 py-3" : "px-2 py-2"
          )}>
            {/* Logout Button */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.35 }}
            >
              <Button
                variant="ghost"
                onClick={async () => {
                  setIsLoggingOut(true)
                  try {
                    await logout()
                  } finally {
                    setIsLoggingOut(false)
                  }
                }}
                disabled={isLoggingOut}
                className={cn(
                  "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm font-semibold",
                  shouldExpand ? "justify-start px-3 py-2.5" : "justify-center px-3 py-2.5"
                )}
                title={!shouldExpand ? "Logout" : undefined}
              >
                <LogOut className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "h-4 w-4 mr-3" : "h-4 w-4"
                )} />
                {shouldExpand && (
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>
      )}
    </>
  )
}
