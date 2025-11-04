"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, ChevronLeft, ChevronRight, LogOut, User, ChevronDown } from "lucide-react"
import { 
  BarChart3, 
  Users, 
  Calculator, 
  FileText, 
  Building2, 
  Settings 
} from "lucide-react"

const pageConfig: Record<string, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  "/": { title: "Dashboard", icon: BarChart3 },
  "/employees": { title: "Employees", icon: Users },
  "/employees/new": { title: "Add Employee", icon: Users },
  "/payroll": { title: "Payroll", icon: Calculator },
  "/payslips": { title: "Payslips", icon: FileText },
  "/remittances": { title: "Remittances", icon: Building2 },
  "/p9": { title: "P9 Forms", icon: FileText },
  "/settings": { title: "Settings", icon: Settings },
}

export function Header() {
  const location = useLocation()
  const { shouldExpand, isCollapsed, setIsCollapsed, setIsPinned } = useSidebar()
  const { logout, user } = useAuth()
  const pathname = location.pathname
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  
  const config = pageConfig[pathname] || { title: "PEMWA AGENCY LIMITED", icon: BarChart3 }
  const Icon = config.icon

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setProfileOpen(false)
    }
  }

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b-2 border-border/50 bg-card/80 backdrop-blur-xl",
      "transition-all duration-300 shadow-sm"
    )}>
      <div className="relative flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 gap-2">
        {/* Left side - Sidebar toggle, icon, and title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsCollapsed(!isCollapsed)
              setIsPinned(!isCollapsed)
            }}
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-lg hover:bg-accent/60 border border-border/50 transition-all"
            aria-label={shouldExpand ? "Collapse sidebar" : "Expand sidebar"}
          >
            {shouldExpand ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {/* Page Icon */}
          <div className={cn(
            "kenya-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
            "transition-all duration-300",
            "w-9 h-9 sm:w-10 sm:h-10"
          )}>
            <Icon className={cn(
              "text-white transition-all duration-300",
              "h-4 w-4 sm:h-5 sm:w-5"
            )} />
          </div>
          
          {/* Title Section */}
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold truncate transition-all duration-300 text-slate-900 dark:text-foreground",
              "text-sm sm:text-base md:text-lg"
            )}>
              {config.title}
            </h1>
            {shouldExpand && (
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-muted-foreground truncate hidden sm:block">
                Manage your payroll operations
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Theme Toggle and User Profile */}
        {pathname !== '/login' && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <div className="p-1 sm:p-1.5 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors z-10">
              <ThemeToggle />
            </div>
            
            {/* User Profile */}
            {user && (
              <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 sm:gap-2 hover:bg-accent/50 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-lg transition-all"
                    aria-label="User profile"
                  >
                    <div className="kenya-gradient w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div className="text-left min-w-0 hidden min-[375px]:block">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[90px] sm:max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[90px] sm:max-w-[120px] hidden sm:block">
                        {user.email}
                      </p>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[280px] sm:w-64 p-0" 
                  align="end"
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="kenya-gradient w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-semibold text-base">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Role: {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

