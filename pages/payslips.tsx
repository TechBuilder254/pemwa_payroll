import React, { useMemo, useState, useEffect } from 'react'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Combobox } from '@/components/ui/combobox'
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  User,
  Building2,
  DollarSign,
  Calculator,
  Eye,
  Filter,
  Shield,
  Home,
  TrendingUp,
  CheckCircle,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/payroll-calculations'
import { usePayslips } from '@/hooks/usePayslips'
import { useEmployees } from '@/hooks/useEmployees'
import { generatePayslipPDF } from '@/lib/exports/pdf'
import { generatePayslipExcel } from '@/lib/exports/excel'

// Payslips are computed from employees + active settings for the selected month

type PayslipShape = {
  id: string
  employee_id: string
  employee_name: string
  month: string
  gross_salary: number
  basic_salary: number
  allowances_total: number
  overtime: number
  bonuses: number
  nssf_employee: number
  nssf_employer: number
  shif_employee: number
  shif_employer: number
  ahl_employee: number
  ahl_employer: number
  helb: number
  voluntary_deductions_total: number
  paye_before_relief: number
  personal_relief: number
  paye_after_relief: number
  total_deductions: number
  net_salary: number
  total_employer_cost: number
  created_at: string
}

function PayslipCard({ payslip, onView, onExportPDF, onExportExcel }: { payslip: PayslipShape, onView: (p: PayslipShape) => void, onExportPDF: (p: PayslipShape) => void, onExportExcel: (p: PayslipShape) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden min-w-0 border-2">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="kenya-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-base">
                  {payslip.employee_name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-lg text-slate-900 dark:text-foreground truncate">{payslip.employee_name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">
                  <span className="truncate block">{payslip.employee_id}</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline truncate">{new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </CardDescription>
              </div>
            </div>
            <Badge variant="success" className="text-xs sm:text-sm px-2 sm:px-3 py-1 font-semibold flex-shrink-0 whitespace-nowrap">
              {formatCurrency(payslip.net_salary)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex justify-between items-center p-2 rounded-lg border border-green-200/30 bg-card min-w-0">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Gross</span>
              <span className="font-semibold text-slate-900 dark:text-foreground text-xs sm:text-sm truncate text-right ml-1">{formatCurrency(payslip.gross_salary)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card min-w-0">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Deduct</span>
              <span className="font-semibold text-red-600 text-xs sm:text-sm truncate text-right ml-1">{formatCurrency(payslip.total_deductions)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-orange-200/30 bg-card min-w-0">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">PAYE</span>
              <span className="font-medium text-slate-900 dark:text-foreground text-xs truncate text-right ml-1">{formatCurrency(payslip.paye_after_relief)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-blue-200/30 bg-card min-w-0">
              <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">NSSF</span>
              <span className="font-medium text-slate-900 dark:text-foreground text-xs truncate text-right ml-1">{formatCurrency(payslip.nssf_employee)}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => onView(payslip)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => onExportPDF(payslip)}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => onExportExcel(payslip)}>
              <FileText className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PayslipTable({ data, onView, onExportPDF, onExportExcel }: { data: PayslipShape[]; onView: (p: PayslipShape) => void, onExportPDF: (p: PayslipShape) => void, onExportExcel: (p: PayslipShape) => void }) {
  return (
    <Card className="hidden sm:block overflow-hidden min-w-0 border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          Payslips
        </CardTitle>
        <CardDescription>Employee payslips for selected period</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border-2 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-card/50">
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Employee
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Period
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Gross Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Net Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((payslip, index) => (
                <motion.tr 
                  key={payslip.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b hover:bg-card/80 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">
                          {payslip.employee_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-foreground">{payslip.employee_name}</div>
                        <div className="text-sm text-slate-600 dark:text-muted-foreground">{payslip.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900 dark:text-foreground font-medium">
                      {new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.gross_salary)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-primary">{formatCurrency(payslip.net_salary)}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant="success" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Generated
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onView(payslip)}
                        className="hover:bg-primary/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onExportPDF(payslip)} className="hover:bg-primary/5">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onExportExcel(payslip)} className="hover:bg-primary/5">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PayslipViewer({ payslip }: { payslip: PayslipShape }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto overflow-hidden min-w-0 w-full border-2 shadow-xl">
        <CardHeader className="text-center border-b-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="kenya-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">PEMWA PAYROLL SYSTEM</CardTitle>
          <CardDescription className="text-lg font-semibold">Monthly Payslip</CardDescription>
          <div className="flex justify-between items-center mt-6 pt-4 border-t px-4 gap-4">
            <div className="text-left min-w-0 flex-1">
              <p className="font-bold text-lg truncate text-slate-900 dark:text-foreground">{payslip.employee_name}</p>
              <p className="text-sm text-slate-600 dark:text-muted-foreground truncate">{payslip.employee_id}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-medium text-slate-900 dark:text-foreground">
                {new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-slate-600 dark:text-muted-foreground">Pay Period</p>
            </div>
          </div>
        </CardHeader>
      
        <CardContent className="space-y-6 pt-6">
          {/* Earnings */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Basic Salary</span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.basic_salary)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Allowances</span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.allowances_total)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Overtime</span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.overtime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Bonuses</span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.bonuses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-5 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border-2 border-green-300/50">
                  <span className="text-lg font-bold text-slate-900 dark:text-foreground">Gross Salary</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(payslip.gross_salary)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Calculator className="h-5 w-5 text-red-600" />
                </div>
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    NSSF (Employee)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.nssf_employee)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    SHIF (Employee)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.shif_employee)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                    <Home className="h-4 w-4 text-purple-500" />
                    AHL (Employee)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.ahl_employee)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg border-2 border-red-300/50 bg-card">
                  <span className="font-semibold flex items-center gap-2 text-slate-900 dark:text-foreground">
                    <Calculator className="h-5 w-5 text-red-600" />
                    PAYE
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.paye_after_relief)}</span>
                </div>
                {payslip.helb > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                    <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">HELB</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.helb)}</span>
                  </div>
                )}
                {payslip.voluntary_deductions_total > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                    <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Voluntary Deductions</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.voluntary_deductions_total)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center p-5 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/5 border-2 border-red-300/50">
                  <span className="text-lg font-bold text-slate-900 dark:text-foreground">Total Deductions</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(payslip.total_deductions)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Pay */}
          <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-foreground">Net Salary</h3>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">Amount to be paid</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(payslip.net_salary)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employer Contributions */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                Employer Contributions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">NSSF (Employer)</span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.nssf_employer)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-amber-300/40 border-dashed bg-card/50">
                  <span className="text-sm italic text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    SHIF (Employer)
                  </span>
                  <span className="font-semibold italic text-slate-900 dark:text-foreground">N/A</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-purple-200/30 bg-card">
                  <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                    <Home className="h-4 w-4 text-purple-500" />
                    AHL (Employer)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(payslip.ahl_employer)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-5 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-2 border-blue-300/50">
                  <span className="text-lg font-bold text-slate-900 dark:text-foreground">Total Employer Cost</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(payslip.total_employer_cost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function PayslipsPage() {
  const { shouldExpand } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('')
  // Default to current month instead of empty string
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const { data: employees } = useEmployees()
  // Always require a month - only fetch when month is selected
  const { data: payslipsData, isLoading: isPayslipsLoading, error: payslipsError } = usePayslips(
    selectedEmployeeId || undefined, 
    selectedMonth || undefined
  )
  const [viewingPayslip, setViewingPayslip] = useState<PayslipShape | null>(null)

  // Scroll to top when viewing a payslip
  useEffect(() => {
    if (viewingPayslip) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.scrollTop = 0
      }
    }
  }, [viewingPayslip])

  const payslips: PayslipShape[] = React.useMemo(() => {
    if (!payslipsData) return []
    return payslipsData.map((p: any) => ({
      id: p.id,
      employee_id: p.employee_id || '',
      employee_name: p.employee_name || '',
      month: p.month || '',
      gross_salary: Number(p.gross_salary) || 0,
      basic_salary: Number(p.basic_salary) || 0,
      allowances_total: Number(p.allowances_total) || 0,
      overtime: Number(p.overtime) || 0,
      bonuses: Number(p.bonuses) || 0,
      nssf_employee: Number(p.nssf_employee) || 0,
      nssf_employer: Number(p.nssf_employer) || 0,
      shif_employee: Number(p.shif_employee) || 0,
      shif_employer: Number(p.shif_employer) || 0,
      ahl_employee: Number(p.ahl_employee) || 0,
      ahl_employer: Number(p.ahl_employer) || 0,
      helb: Number(p.helb) || 0,
      voluntary_deductions_total: Number(p.voluntary_deductions_total) || 0,
      paye_before_relief: Number(p.paye_before_relief) || 0,
      personal_relief: Number(p.personal_relief) || 0,
      paye_after_relief: Number(p.paye_after_relief) || 0,
      total_deductions: Number(p.total_deductions) || 0,
      net_salary: Number(p.net_salary) || 0,
      total_employer_cost: Number(p.total_employer_cost) || 0,
      created_at: p.created_at || new Date().toISOString(),
    }))
  }, [payslipsData])

  const employeeOptions = (employees ?? []).map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`
  }))

  const filteredPayslips = useMemo(() => {
    return payslips.filter(payslip => {
      // Filter by month if selected (safety check - API should already filter)
      const matchesMonth = !selectedMonth || payslip.month === selectedMonth || payslip.month.slice(0, 7) === selectedMonth
      
      // Filter by search term
      const matchesSearch = !searchTerm || 
        payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesMonth && matchesSearch
    })
  }, [payslips, selectedMonth, searchTerm])

  if (viewingPayslip) {
    return (
      <div className="min-h-screen bg-background w-full overflow-x-hidden p-4">
        <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setViewingPayslip(null)}
              className="flex items-center gap-2"
            >
              ← Back to Payslips
            </Button>
            <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const d = viewingPayslip
            if (!d) return
            generatePayslipPDF({
              employee: { name: d.employee_name, employee_id: d.employee_id },
              month: d.month,
              gross_salary: d.gross_salary,
              basic_salary: d.basic_salary,
              allowances_total: d.allowances_total,
              overtime: d.overtime,
              bonuses: d.bonuses,
              nssf_employee: d.nssf_employee,
              nssf_employer: d.nssf_employer,
              shif_employee: d.shif_employee,
              shif_employer: d.shif_employer,
              ahl_employee: d.ahl_employee,
              ahl_employer: d.ahl_employer,
              helb: d.helb,
              voluntary_deductions_total: d.voluntary_deductions_total,
              paye_after_relief: d.paye_before_relief - d.personal_relief < 0 ? 0 : d.paye_after_relief,
              total_deductions: d.total_deductions,
              net_salary: d.net_salary,
              total_employer_cost: d.total_employer_cost,
            })
          }}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
              <Button className="kenya-gradient text-white hover:opacity-90" onClick={() => {
                const d = viewingPayslip
                if (!d) return
                generatePayslipExcel({
                  employee: { name: d.employee_name, employee_id: d.employee_id },
                  month: d.month,
                  gross_salary: d.gross_salary,
                  basic_salary: d.basic_salary,
                  allowances_total: d.allowances_total,
                  overtime: d.overtime,
                  bonuses: d.bonuses,
                  nssf_employee: d.nssf_employee,
                  nssf_employer: d.nssf_employer,
                  shif_employee: d.shif_employee,
                  shif_employer: d.shif_employer,
                  ahl_employee: d.ahl_employee,
                  ahl_employer: d.ahl_employer,
                  helb: d.helb,
                  voluntary_deductions_total: d.voluntary_deductions_total,
                  paye_after_relief: d.paye_after_relief,
                  total_deductions: d.total_deductions,
                  net_salary: d.net_salary,
                  total_employer_cost: d.total_employer_cost,
                })
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          <PayslipViewer payslip={viewingPayslip} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Payslips</h1>
            <p className="text-[12px] text-muted-foreground truncate">View employee payslips</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 shadow-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={cn(
        "hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/80 backdrop-blur-sm transition-all duration-300",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold transition-all duration-300",
              shouldExpand ? "text-xl" : "text-2xl"
            )}>
              Payslips
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 mt-1",
              shouldExpand ? "text-xs" : "text-sm"
            )}>
              View and export employee monthly payslips
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        {/* Filters */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              Filter Payslips
            </CardTitle>
            <CardDescription>Search and filter payslips by employee and period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search Employee</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Payroll Month *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 h-11 font-medium"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Select a month to view payslips for that period</p>
              </div>
              <div className="space-y-2">
                <Label>Employee</Label>
                <Combobox
                  options={employeeOptions}
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  placeholder="All employees"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <FileText className="h-3 w-3 mr-1" />
                {filteredPayslips.length} payslip{filteredPayslips.length !== 1 ? 's' : ''} found
              </Badge>
              {selectedMonth && (
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm px-4 py-2">
                <DollarSign className="h-3 w-3 mr-1" />
                Total: {formatCurrency(filteredPayslips.reduce((sum, p) => sum + p.net_salary, 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isPayslipsLoading && (
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span>Loading payslips...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {payslipsError && (
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading payslips: {payslipsError.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isPayslipsLoading && !payslipsError && filteredPayslips.length === 0 && (
          <Card className="border-2 text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payslips found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedMonth
                  ? `No payslips available for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. ${selectedEmployeeId ? 'Try a different employee or ' : ''}Process payroll for this month to create payslips.`
                  : 'Please select a month to view payslips.'}
              </p>
              {selectedMonth && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedEmployeeId('')
                    setSearchTerm('')
                  }}
                  className="mt-4"
                >
                  Clear Employee Filter
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Cards */}
        {!isPayslipsLoading && filteredPayslips.length > 0 && (
        <div className="sm:hidden space-y-4">
          {filteredPayslips.map((payslip) => (
            <PayslipCard 
              key={payslip.id} 
              payslip={payslip}
              onView={(p) => {
                setViewingPayslip(p)
                // Scroll to top when viewing payslip
                window.scrollTo({ top: 0, behavior: 'smooth' })
                document.documentElement.scrollTop = 0
                document.body.scrollTop = 0
              }}
              onExportPDF={(d) => generatePayslipPDF({
                employee: { name: d.employee_name, employee_id: d.employee_id },
                month: d.month,
                gross_salary: d.gross_salary,
                basic_salary: d.basic_salary,
                allowances_total: d.allowances_total,
                overtime: d.overtime,
                bonuses: d.bonuses,
                nssf_employee: d.nssf_employee,
                nssf_employer: d.nssf_employer,
                shif_employee: d.shif_employee,
                shif_employer: d.shif_employer,
                ahl_employee: d.ahl_employee,
                ahl_employer: d.ahl_employer,
                helb: d.helb,
                voluntary_deductions_total: d.voluntary_deductions_total,
                paye_after_relief: d.paye_after_relief,
                total_deductions: d.total_deductions,
                net_salary: d.net_salary,
                total_employer_cost: d.total_employer_cost,
              })}
              onExportExcel={(d) => generatePayslipExcel({
                employee: { name: d.employee_name, employee_id: d.employee_id },
                month: d.month,
                gross_salary: d.gross_salary,
                basic_salary: d.basic_salary,
                allowances_total: d.allowances_total,
                overtime: d.overtime,
                bonuses: d.bonuses,
                nssf_employee: d.nssf_employee,
                nssf_employer: d.nssf_employer,
                shif_employee: d.shif_employee,
                shif_employer: d.shif_employer,
                ahl_employee: d.ahl_employee,
                ahl_employer: d.ahl_employer,
                helb: d.helb,
                voluntary_deductions_total: d.voluntary_deductions_total,
                paye_after_relief: d.paye_after_relief,
                total_deductions: d.total_deductions,
                net_salary: d.net_salary,
                total_employer_cost: d.total_employer_cost,
              })}
            />
          ))}
        </div>
        )}

        {/* Desktop Table */}
        {!isPayslipsLoading && filteredPayslips.length > 0 && (
        <PayslipTable 
          data={filteredPayslips}
          onView={(p) => setViewingPayslip(p)}
          onExportPDF={(d) => generatePayslipPDF({
            employee: { name: d.employee_name, employee_id: d.employee_id },
            month: d.month,
            gross_salary: d.gross_salary,
            basic_salary: d.basic_salary,
            allowances_total: d.allowances_total,
            overtime: d.overtime,
            bonuses: d.bonuses,
            nssf_employee: d.nssf_employee,
            nssf_employer: d.nssf_employer,
            shif_employee: d.shif_employee,
            shif_employer: d.shif_employer,
            ahl_employee: d.ahl_employee,
            ahl_employer: d.ahl_employer,
            helb: d.helb,
            voluntary_deductions_total: d.voluntary_deductions_total,
            paye_after_relief: d.paye_after_relief,
            total_deductions: d.total_deductions,
            net_salary: d.net_salary,
            total_employer_cost: d.total_employer_cost,
          })}
          onExportExcel={(d) => generatePayslipExcel({
            employee: { name: d.employee_name, employee_id: d.employee_id },
            month: d.month,
            gross_salary: d.gross_salary,
            basic_salary: d.basic_salary,
            allowances_total: d.allowances_total,
            overtime: d.overtime,
            bonuses: d.bonuses,
            nssf_employee: d.nssf_employee,
            nssf_employer: d.nssf_employer,
            shif_employee: d.shif_employee,
            shif_employer: d.shif_employer,
            ahl_employee: d.ahl_employee,
            ahl_employer: d.ahl_employer,
            helb: d.helb,
            voluntary_deductions_total: d.voluntary_deductions_total,
            paye_after_relief: d.paye_after_relief,
            total_deductions: d.total_deductions,
            net_salary: d.net_salary,
            total_employer_cost: d.total_employer_cost,
          })}
        />
        )}
      </div>
    </div>
  )
}
