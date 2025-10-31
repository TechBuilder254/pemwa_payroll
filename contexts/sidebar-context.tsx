"use client"

import * as React from "react"

interface SidebarContextType {
  isCollapsed: boolean
  isPinned: boolean
  isHovered: boolean
  shouldExpand: boolean
  setIsCollapsed: (collapsed: boolean) => void
  setIsPinned: (pinned: boolean) => void
  setIsHovered: (hovered: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isPinned, setIsPinned] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const shouldExpand = isPinned || (!isCollapsed && isHovered)

  const value = React.useMemo(
    () => ({
      isCollapsed,
      isPinned,
      isHovered,
      shouldExpand,
      setIsCollapsed,
      setIsPinned,
      setIsHovered,
    }),
    [isCollapsed, isPinned, isHovered, shouldExpand]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
