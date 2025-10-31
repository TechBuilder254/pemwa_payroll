"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, ChevronRight } from "lucide-react"
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
  const pathname = location.pathname
  
  const config = pageConfig[pathname] || { title: "Pemwa Payroll", icon: BarChart3 }
  const Icon = config.icon

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-all duration-300"
    )}>
      <div className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsCollapsed(!isCollapsed)
              setIsPinned(!isCollapsed)
            }}
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            aria-label={shouldExpand ? "Collapse sidebar" : "Expand sidebar"}
          >
            {shouldExpand ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          <div className={cn(
            "kenya-gradient rounded-md flex items-center justify-center flex-shrink-0",
            "transition-all duration-300",
            shouldExpand ? "w-8 h-8" : "w-7 h-7"
          )}>
            <Icon className={cn(
              "text-white transition-all duration-300",
              shouldExpand ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-semibold truncate transition-all duration-300",
              shouldExpand ? "text-base" : "text-[15px]"
            )}>
              {config.title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  )
}

