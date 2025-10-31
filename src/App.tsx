import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'
import { Navigation } from '@/components/navigation'
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

import { useSidebar } from '@/contexts/sidebar-context'

const App: React.FC = () => {
  const { shouldExpand } = useSidebar()
  const sidebarPad = shouldExpand ? 'lg:pl-[200px]' : 'lg:pl-[56px]'
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Navigation />
        <main className={`transition-all duration-300 ${sidebarPad} px-3 sm:px-6 py-4`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<NewEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/remittances" element={<Remittances />} />
            <Route path="/p9" element={<P9 />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<div className="p-6">Not Found</div>} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App


