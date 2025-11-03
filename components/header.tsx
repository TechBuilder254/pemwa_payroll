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
  
  const config = pageConfig[pathname] || { title: "Pemwa Payroll", icon: BarChart3 }
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
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
          
          <div className={cn(
            "kenya-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
            "transition-all duration-300",
            shouldExpand ? "w-10 h-10" : "w-9 h-9"
          )}>
            <Icon className={cn(
              "text-white transition-all duration-300",
              shouldExpand ? "h-5 w-5" : "h-4 w-4"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold truncate transition-all duration-300 text-slate-900 dark:text-foreground",
              shouldExpand ? "text-lg" : "text-base"
            )}>
              {config.title}
            </h1>
            {shouldExpand && (
              <p className="text-xs text-slate-600 dark:text-muted-foreground truncate">
                Manage your payroll operations
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Theme Toggle and User Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - Only show if not on login page */}
          {pathname !== '/login' && (
            <div className="p-1.5 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
              <ThemeToggle />
            </div>
          )}
          
          {/* User Profile - Only show if not on login page */}
          {pathname !== '/login' && user && (
          <Popover open={profileOpen} onOpenChange={setProfileOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-accent/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all"
                aria-label="User profile"
              >
                <div className="kenya-gradient w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-0" 
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
      </div>
    </header>
  )
}

