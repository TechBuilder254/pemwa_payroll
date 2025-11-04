import React from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'
import { Navigation } from '@/components/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Employees from '@/src/routes/Employees'
import NewEmployee from '@/src/routes/NewEmployee'
import Settings from '@/src/routes/Settings'
import Dashboard from '@/src/routes/Dashboard'
import Payroll from '@/src/routes/Payroll'
import Payslips from '@/src/routes/Payslips'
import Remittances from '@/src/routes/Remittances'
import P9 from '@/src/routes/P9'
import Login from '@/src/routes/Login'
import EmployeeDetails from '@/src/routes/EmployeeDetails'
import { ScrollToTop } from '@/src/components/ScrollToTop'
import { InactivityTimeout } from '@/components/InactivityTimeout'
import { startDbKeepAlive, stopDbKeepAlive } from '@/lib/db-keepalive'

import { useSidebar } from '@/contexts/sidebar-context'
import { useAuth } from '@/contexts/auth-context'

const App: React.FC = () => {
  const { shouldExpand } = useSidebar()
  const { isAuthenticated, isLoading } = useAuth()
  const sidebarPad = shouldExpand ? 'lg:pl-[200px]' : 'lg:pl-[56px]'
  const location = useLocation()
  const mainRef = React.useRef<HTMLElement>(null)
  
  // Start database keep-alive service when authenticated
  // This prevents Supabase from putting the database to sleep
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Start keep-alive: ping database every 2 hours (7200000 ms)
      startDbKeepAlive(2 * 60 * 60 * 1000)
      
      return () => {
        // Stop keep-alive when component unmounts or user logs out
        stopDbKeepAlive()
      }
    } else {
      // Stop keep-alive when not authenticated
      stopDbKeepAlive()
    }
  }, [isAuthenticated, isLoading])
  
  // Scroll main container to top on route change
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
    // Also scroll window to top immediately
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])
  
  const isLoginPage = location.pathname === '/login'

  // Show loading state while checking authentication
  if (isLoading && !isLoginPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <div className="kenya-gradient w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Redirect to login if not authenticated and trying to access protected route
  // This ensures we always redirect before rendering protected routes
  if (!isLoading && !isAuthenticated && !isLoginPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Navigate to="/login" replace />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground">
        {!isLoginPage && <Header />}
        {!isLoginPage && <Navigation />}
        <main 
          ref={mainRef}
          key={location.pathname} 
          className={isLoginPage ? '' : `transition-all duration-300 ${sidebarPad} px-3 sm:px-6 py-4`}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
            <Route path="/employees/new" element={<ProtectedRoute><NewEmployee /></ProtectedRoute>} />
            <Route path="/employees/:id/edit" element={<ProtectedRoute><NewEmployee /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
            <Route path="/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
            <Route path="/remittances" element={<ProtectedRoute><Remittances /></ProtectedRoute>} />
            <Route path="/p9" element={<ProtectedRoute><P9 /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>
        <Toaster />
        <InactivityTimeout />
      </div>
    </ThemeProvider>
  )
}

export default App


