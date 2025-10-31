"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Menu, X, Users, Calculator, FileText, BarChart3, Settings, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/contexts/sidebar-context"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Payroll", href: "/payroll", icon: Calculator },
  { name: "Payslips", href: "/payslips", icon: FileText },
  { name: "Remittances", href: "/remittances", icon: Building2 },
  { name: "P9 Forms", href: "/p9", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { isCollapsed, isPinned, isHovered, shouldExpand, setIsCollapsed, setIsPinned, setIsHovered } = useSidebar()
  const location = useLocation()
  const pathname = location.pathname
  const prefersReducedMotion = useReducedMotion()

  const sidebarWidth = shouldExpand ? "w-64" : "w-16"

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-lg">Pemwa Payroll</span>
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
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-3 border-b pt-12">
                    <div className="flex items-center space-x-2">
                      <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <span className="font-semibold text-lg">Pemwa Payroll</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-9 w-9"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Navigation Items */}
                  <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {/* Footer */}
                  <div className="px-3 py-3 border-t">
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Desktop Navigation */}
      <motion.nav 
        className={cn(
          "hidden sm:flex sm:flex-col sm:fixed sm:inset-y-0 sm:z-50",
          "bg-background/95 backdrop-blur-xl",
          "shadow-xl"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={prefersReducedMotion ? undefined : { width: shouldExpand ? 200 : 56 }}
        transition={prefersReducedMotion ? { duration: 0 } : { 
          type: "spring", 
          damping: 30, 
          stiffness: 300,
          mass: 0.8
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center",
            shouldExpand ? "px-2.5 py-3" : "px-2 py-2 justify-center"
          )}>
            <motion.div 
              className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">P</span>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {shouldExpand && (
                <>
                  <motion.div 
                    className="ml-4 overflow-hidden"
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { 
                      type: "spring", 
                      damping: 25, 
                      stiffness: 200,
                      delay: 0.1
                    }}
                  >
                    <h1 className="text-sm font-semibold whitespace-nowrap">
                      Pemwa Payroll
                    </h1>
                    <p className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                      Kenyan Payroll System
                    </p>
                  </motion.div>
                  
                  {/* Toggle Button */}
                  <motion.div
                    className="ml-auto"
                    initial={prefersReducedMotion ? false : { opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0 }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        setIsCollapsed(!isCollapsed)
                        setIsPinned(!isCollapsed)
                      }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Navigation Items */}
          <div className={cn(
            "flex-1 px-2 py-2 space-y-1",
            shouldExpand ? "overflow-y-auto" : "overflow-hidden"
          )}>
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <motion.div
                  key={item.name}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { 
                    delay: index * 0.05,
                    type: "spring",
                    damping: 25,
                    stiffness: 200
                  }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-2 py-2 rounded-md text-[12px] font-medium transition-all duration-300 group relative",
                      "hover:shadow-md hover:shadow-primary/10",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow lg:shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    )}
                    title={!shouldExpand ? item.name : undefined}
                  >
                    <motion.div
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    >
                      <Icon className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    </motion.div>
                    
                    <AnimatePresence mode="wait">
                      {shouldExpand && (
                        <motion.span 
                          className="ml-2 font-medium whitespace-normal break-words leading-snug pr-2"
                          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                          transition={prefersReducedMotion ? { duration: 0 } : { 
                            type: "spring", 
                            damping: 25, 
                            stiffness: 200,
                            delay: 0.1
                          }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    )}
                    
                    {/* Enhanced Tooltip for collapsed state */}
                    {!shouldExpand && (
                      <motion.div 
                        className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap"
                      >
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
          
          {/* Footer - Hide horizontal navigation when collapsed */}
          {shouldExpand && (
            <div className="px-3 py-4">
              <motion.div 
                className="flex items-center"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
              >
                <ThemeToggle />
                <AnimatePresence mode="wait">
                  {shouldExpand && (
                    <motion.div 
                      className="ml-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ 
                        type: "spring", 
                        damping: 25, 
                        stiffness: 200,
                        delay: 0.1
                      }}
                    >
                      <span className="text-sm text-muted-foreground font-medium">Theme Settings</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
          
          {/* Collapsed Footer - Only Theme Toggle */}
          {!shouldExpand && (
            <div className="px-2 py-3">
              <motion.div 
                className="flex justify-center"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
              >
                <ThemeToggle />
              </motion.div>
            </div>
          )}
        </div>
      </motion.nav>
    </>
  )
}
