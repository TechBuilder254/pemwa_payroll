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
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Shield,
  Home,
  Sparkles,
  Info
} from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'
import { getAnnualTaxReturnDueDate, getDueDateMessage } from '@/lib/kenyan-due-dates'
import { useEmployees } from '@/hooks/useEmployees'
import { useP9Form } from '@/hooks/useP9Form'
import { generateP9PDF } from '@/lib/exports/pdf'
import { generateP9Excel } from '@/lib/exports/excel'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import { Logo } from '@/components/logo'

// Data is computed from employees + settings (annualized from monthly)

type P9Shape = {
  id: string
  employee_id: string
  employee_name: string
  kra_pin: string
  year: number
  gross_salary_total: number
  basic_salary_total: number
  allowances_total: number
  nssf_employee_total: number
  nssf_employer_total: number
  shif_employee_total: number
  shif_employer_total: number
  ahl_employee_total: number
  ahl_employer_total: number
  helb_total: number
  voluntary_deductions_total: number
  paye_total: number
  net_salary_total: number
  total_employer_cost: number
  months_count?: number
  status: 'completed' | 'pending'
  created_at: string
}

function P9Card({ p9Form, onView }: { p9Form: P9Shape, onView: (p: P9Shape) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-base">
                  {p9Form.employee_name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{p9Form.employee_name}</CardTitle>
                <CardDescription className="text-sm truncate">
                  {p9Form.employee_id} • {p9Form.year}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={p9Form.status === 'completed' ? 'success' : 'secondary'} 
              className="flex-shrink-0 ml-2"
            >
              {p9Form.status === 'completed' ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </>
              ) : 'Pending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Gross Salary</p>
              <p className="text-base font-semibold">{formatCurrency(p9Form.gross_salary_total)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">PAYE</p>
              <p className="text-base font-semibold text-red-600">{formatCurrency(p9Form.paye_total)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Net Salary</p>
              <p className="text-base font-semibold text-green-600">{formatCurrency(p9Form.net_salary_total)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Deductions</p>
              <p className="text-sm font-medium">
                {formatCurrency(
                  p9Form.nssf_employee_total + 
                  p9Form.shif_employee_total + 
                  p9Form.ahl_employee_total + 
                  p9Form.paye_total
                )}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => onView(p9Form)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => {
                generateP9PDF({
                  employee: { name: p9Form.employee_name, employee_id: p9Form.employee_id, kra_pin: p9Form.kra_pin },
                  year: p9Form.year,
                  gross_salary_total: p9Form.gross_salary_total,
                  basic_salary_total: p9Form.basic_salary_total,
                  allowances_total: p9Form.allowances_total,
                  nssf_employee_total: p9Form.nssf_employee_total,
                  nssf_employer_total: p9Form.nssf_employer_total,
                  shif_employee_total: p9Form.shif_employee_total,
                  shif_employer_total: p9Form.shif_employer_total,
                  ahl_employee_total: p9Form.ahl_employee_total,
                  ahl_employer_total: p9Form.ahl_employer_total,
                  helb_total: p9Form.helb_total,
                  voluntary_deductions_total: p9Form.voluntary_deductions_total,
                  paye_total: p9Form.paye_total,
                  net_salary_total: p9Form.net_salary_total,
                  total_employer_cost: p9Form.total_employer_cost,
                })
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function P9Table({ data, onView }: { data: P9Shape[]; onView: (p: P9Shape) => void }) {
  return (
    <Card className="hidden sm:block overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-primary/10 kenya-gradient">
            <FileText className="h-5 w-5 text-white" />
          </div>
          P9 Forms Overview
        </CardTitle>
        <CardDescription>Annual tax summaries for KRA submission</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-card/50">
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Employee
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Year
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Gross Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  PAYE
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Net Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((p9Form, index) => (
                <motion.tr
                  key={p9Form.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b hover:bg-card/80 transition-colors cursor-pointer"
                  onClick={() => onView(p9Form)}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-sm">
                          {p9Form.employee_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p9Form.employee_name}</div>
                        <div className="text-sm text-muted-foreground truncate">{p9Form.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-mono">
                      {p9Form.year}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold">{formatCurrency(p9Form.gross_salary_total)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-red-600">{formatCurrency(p9Form.paye_total)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-green-600">{formatCurrency(p9Form.net_salary_total)}</div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={p9Form.status === 'completed' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {p9Form.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </>
                      ) : 'Pending'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(p9Form)
                        }}
                        className="hover:bg-primary/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          generateP9PDF({
                            employee: { name: p9Form.employee_name, employee_id: p9Form.employee_id, kra_pin: p9Form.kra_pin },
                            year: p9Form.year,
                            gross_salary_total: p9Form.gross_salary_total,
                            basic_salary_total: p9Form.basic_salary_total,
                            allowances_total: p9Form.allowances_total,
                            nssf_employee_total: p9Form.nssf_employee_total,
                            nssf_employer_total: p9Form.nssf_employer_total,
                            shif_employee_total: p9Form.shif_employee_total,
                            shif_employer_total: p9Form.shif_employer_total,
                            ahl_employee_total: p9Form.ahl_employee_total,
                            ahl_employer_total: p9Form.ahl_employer_total,
                            helb_total: p9Form.helb_total,
                            voluntary_deductions_total: p9Form.voluntary_deductions_total,
                            paye_total: p9Form.paye_total,
                            net_salary_total: p9Form.net_salary_total,
                            total_employer_cost: p9Form.total_employer_cost,
                          })
                        }}
                        className="hover:bg-primary/5"
                      >
                        <Download className="h-4 w-4" />
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

function P9Viewer({ p9Form }: { p9Form: P9Shape }) {
  const renderAnnualWithBreakdown = (total: number) => {
    const months = 12
    const monthly = total / months
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-base text-foreground">{formatCurrency(total)}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          ({formatCurrency(monthly)} × {months})
        </span>
      </div>
    )
  }


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-5xl mx-auto overflow-hidden border-2 shadow-xl">
        <CardHeader className="text-center border-b-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="flex justify-center mb-4">
            <Logo variant="full" showText={true} size="xl" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2 text-[#1e3a8a] dark:text-blue-400">P9 Form - Annual Tax Summary</CardTitle>
          <CardDescription className="text-base font-medium">PAYROLL SYSTEM</CardDescription>
          <div className="flex justify-between items-center mt-6 pt-4 border-t px-4 gap-4">
            <div className="text-left space-y-1 min-w-0 flex-1">
              <p className="font-bold text-lg truncate">{p9Form.employee_name}</p>
              <p className="text-sm text-muted-foreground truncate">ID: {p9Form.employee_id}</p>
              <p className="text-sm text-muted-foreground font-mono truncate">KRA PIN: {p9Form.kra_pin}</p>
            </div>
            <div className="text-right space-y-1 flex-shrink-0">
              <Badge variant="outline" className="text-lg px-4 py-2 font-mono whitespace-nowrap">
                Tax Year {p9Form.year}
              </Badge>
              <p className="text-sm text-muted-foreground">Annual Summary</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Employee Information */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-card">
                    <span className="text-sm text-muted-foreground">Employee Name</span>
                    <span className="font-semibold text-foreground">{p9Form.employee_name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-card">
                    <span className="text-sm text-muted-foreground">Employee ID</span>
                    <span className="font-semibold font-mono text-foreground">{p9Form.employee_id}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-card">
                    <span className="text-sm text-muted-foreground">KRA PIN</span>
                    <span className="font-semibold font-mono text-foreground">{p9Form.kra_pin}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-card">
                    <span className="text-sm text-muted-foreground">Tax Year</span>
                    <Badge variant="outline" className="font-mono">{p9Form.year}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annual Earnings */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                Annual Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-lg border border-green-200/30 bg-card">
                  <span className="font-medium text-foreground">Basic Salary</span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.basic_salary_total)}</div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg border border-green-200/30 bg-card">
                  <span className="font-medium text-foreground">Allowances</span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.allowances_total)}</div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg border-2 border-green-300/50">
                  <span className="text-lg font-bold">Gross Salary</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(p9Form.gross_salary_total)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(p9Form.gross_salary_total / 12)} per month
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annual Deductions */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Calculator className="h-5 w-5 text-red-600" />
                </div>
                Annual Deductions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="font-medium flex items-center gap-2 text-foreground">
                    <Shield className="h-4 w-4 text-blue-500" />
                    NSSF (Employee)
                  </span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.nssf_employee_total)}</div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="font-medium flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    SHIF (Employee)
                  </span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.shif_employee_total)}</div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                  <span className="font-medium flex items-center gap-2 text-foreground">
                    <Home className="h-4 w-4 text-purple-500" />
                    AHL (Employee)
                  </span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.ahl_employee_total)}</div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg border-2 border-red-400/50 bg-card">
                  <span className="font-semibold flex items-center gap-2 text-foreground">
                    <Calculator className="h-5 w-5 text-red-500" />
                    PAYE
                  </span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.paye_total)}</div>
                </div>
                {p9Form.helb_total > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                    <span className="font-medium text-foreground">HELB</span>
                    <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.helb_total)}</div>
                  </div>
                )}
                {p9Form.voluntary_deductions_total > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                    <span className="font-medium text-foreground">Voluntary Deductions</span>
                    <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.voluntary_deductions_total)}</div>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-red-500/10 to-red-600/5 rounded-lg border-2 border-red-300/50">
                  <span className="text-lg font-bold">Total Deductions</span>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(
                      p9Form.nssf_employee_total + 
                      p9Form.shif_employee_total + 
                      p9Form.ahl_employee_total + 
                      p9Form.paye_total + 
                      p9Form.helb_total + 
                      p9Form.voluntary_deductions_total
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Salary */}
          <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-foreground">Net Salary</h3>
                  <p className="text-sm text-muted-foreground">Total amount paid to employee annually</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(p9Form.net_salary_total)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(p9Form.net_salary_total / 12)} per month
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
                  <span className="font-medium text-foreground">NSSF (Employer)</span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.nssf_employer_total)}</div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-amber-300/40 border-dashed bg-card/50">
                  <span className="font-medium italic text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    SHIF (Employer)
                  </span>
                  <span className="text-foreground font-semibold italic">N/A</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-purple-200/30 bg-card">
                  <span className="font-medium flex items-center gap-2 text-foreground">
                    <Home className="h-4 w-4 text-purple-500" />
                    AHL (Employer)
                  </span>
                  <div className="text-foreground">{renderAnnualWithBreakdown(p9Form.ahl_employer_total)}</div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg border-2 border-blue-300/50">
                  <span className="text-lg font-bold">Total Employer Cost</span>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(p9Form.total_employer_cost)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-green-500/20 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">KRA Compliance Ready</h3>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-3">
                    This P9 form is ready for submission to KRA. All statutory deductions have been calculated 
                    according to current tax regulations for {p9Form.year}.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="bg-green-500/10 border-green-400/50 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Statutory Compliant
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 border-green-400/50 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      KRA Ready
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function P9Page() {
  const { shouldExpand } = useSidebar()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const currentYear = String(new Date().getFullYear())
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: p9FormData, isLoading: isP9Loading, error: p9Error } = useP9Form(
    selectedEmployeeId || undefined,
    selectedEmployeeId ? Number(selectedYear) : undefined
  )
  const [viewingP9, setViewingP9] = useState<P9Shape | null>(null)

  // Scroll to top when viewing a P9 form
  useEffect(() => {
    if (viewingP9) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.scrollTop = 0
      }
    }
  }, [viewingP9])

  // When P9 data is loaded and employee is selected, convert to P9Shape
  const p9Form: P9Shape | null = useMemo(() => {
    if (!p9FormData || !selectedEmployeeId) return null
    return {
      id: p9FormData.id,
      employee_id: p9FormData.employee_id,
      employee_name: p9FormData.employee_name,
      kra_pin: p9FormData.kra_pin,
      year: p9FormData.year,
      gross_salary_total: p9FormData.gross_salary_total,
      basic_salary_total: p9FormData.basic_salary_total,
      allowances_total: p9FormData.allowances_total,
      nssf_employee_total: p9FormData.nssf_employee_total,
      nssf_employer_total: p9FormData.nssf_employer_total,
      shif_employee_total: p9FormData.shif_employee_total,
      shif_employer_total: p9FormData.shif_employer_total,
      ahl_employee_total: p9FormData.ahl_employee_total,
      ahl_employer_total: p9FormData.ahl_employer_total,
      helb_total: p9FormData.helb_total,
      voluntary_deductions_total: p9FormData.voluntary_deductions_total,
      paye_total: p9FormData.paye_total,
      net_salary_total: p9FormData.net_salary_total,
      total_employer_cost: p9FormData.total_employer_cost,
      status: p9FormData.status,
      created_at: new Date().toISOString(),
    }
  }, [p9FormData, selectedEmployeeId])

  const employeeOptions = useMemo(() => {
    if (!employees) return [] as { value: string; label: string }[]
    return employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employee_id})` }))
  }, [employees])

  const earliestYear = useMemo(() => {
    if (!employees || employees.length === 0) return Number(currentYear)
    const min = Math.min(
      ...employees
        .map((e) => new Date(e.created_at).getFullYear())
        .filter((y) => Number.isFinite(y))
    )
    return Math.min(new Date().getFullYear(), min) || Number(currentYear)
  }, [employees, currentYear])

  const yearOptions = useMemo(() => {
    const end = new Date().getFullYear()
    const start = earliestYear
    const years: string[] = []
    for (let y = end; y >= start; y--) years.push(String(y))
    return years
  }, [earliestYear])

  // Show P9 form if selected and has data
  // Only show if there's actual payroll data (months_count > 0 or totals > 0)
  const filteredP9Forms: P9Shape[] = useMemo(() => {
    if (!p9Form) return []
    // Check if there's actual data - if months_count is 0 or all totals are 0, don't show it
    const monthsCount = p9FormData?.months_count ?? 0
    if (monthsCount === 0 && 
        p9Form.gross_salary_total === 0 && 
        p9Form.net_salary_total === 0) {
      return []
    }
    return [p9Form]
  }, [p9Form, p9FormData])

  const totalStats = useMemo(() => {
    if (!p9Form) {
      return { totalPAYE: 0, totalGross: 0, totalNet: 0, totalDeductions: 0 }
    }
    return {
      totalPAYE: p9Form.paye_total,
      totalGross: p9Form.gross_salary_total,
      totalNet: p9Form.net_salary_total,
      totalDeductions: p9Form.nssf_employee_total + p9Form.shif_employee_total + p9Form.ahl_employee_total + p9Form.paye_total,
    }
  }, [p9Form])

  // Check if employee is selected but has no payroll data
  const hasNoPayrollData = selectedEmployeeId && p9FormData && 
    p9FormData.months_count === 0 && 
    p9FormData.gross_salary_total === 0

  // Auto-view when P9 form data is loaded
  useEffect(() => {
    if (p9Form && !viewingP9) {
      setViewingP9(p9Form)
    }
  }, [p9Form, viewingP9])

  // Calculate annual tax return due date (last day of February following tax year)
  const annualDueDateInfo = selectedYear ? getAnnualTaxReturnDueDate(Number(selectedYear)) : null
  const annualDueDateMessage = annualDueDateInfo ? getDueDateMessage(annualDueDateInfo, 'annual') : null

  if (viewingP9) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
        <div className={cn(
          "max-w-6xl mx-auto space-y-6 transition-all duration-300",
          "p-4 sm:p-6",
          shouldExpand ? "sm:px-4" : "sm:px-6"
        )}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <Button 
              variant="outline" 
              onClick={() => {
                setViewingP9(null)
                setSelectedEmployeeId('')
              }}
              className="gap-2 hover:bg-primary/5"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to P9 Forms
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  const d = viewingP9
                  if (!d) return
                  generateP9PDF({
                    employee: { name: d.employee_name, employee_id: d.employee_id, kra_pin: d.kra_pin },
                    year: d.year,
                    gross_salary_total: d.gross_salary_total,
                    basic_salary_total: d.basic_salary_total,
                    allowances_total: d.allowances_total,
                    nssf_employee_total: d.nssf_employee_total,
                    nssf_employer_total: d.nssf_employer_total,
                    shif_employee_total: d.shif_employee_total,
                    shif_employer_total: d.shif_employer_total,
                    ahl_employee_total: d.ahl_employee_total,
                    ahl_employer_total: d.ahl_employer_total,
                    helb_total: d.helb_total,
                    voluntary_deductions_total: d.voluntary_deductions_total,
                    paye_total: d.paye_total,
                    net_salary_total: d.net_salary_total,
                    total_employer_cost: d.total_employer_cost,
                  })
                }}
                className="gap-2 hover:bg-primary/5"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </Button>
              <Button 
                className="kenya-gradient text-white hover:opacity-90 gap-2 shadow-lg" 
                onClick={() => {
                  const d = viewingP9
                  if (!d) return
                  generateP9Excel({
                    employee: { name: d.employee_name, employee_id: d.employee_id, kra_pin: d.kra_pin },
                    year: d.year,
                    gross_salary_total: d.gross_salary_total,
                    basic_salary_total: d.basic_salary_total,
                    allowances_total: d.allowances_total,
                    nssf_employee_total: d.nssf_employee_total,
                    nssf_employer_total: d.nssf_employer_total,
                    shif_employee_total: d.shif_employee_total,
                    shif_employer_total: d.shif_employer_total,
                    ahl_employee_total: d.ahl_employee_total,
                    ahl_employer_total: d.ahl_employer_total,
                    helb_total: d.helb_total,
                    voluntary_deductions_total: d.voluntary_deductions_total,
                    paye_total: d.paye_total,
                    net_salary_total: d.net_salary_total,
                    total_employer_cost: d.total_employer_cost,
                  })
                }}
                size="lg"
              >
                <FileText className="h-5 w-5" />
                Export Excel
              </Button>
            </div>
          </motion.div>
          <P9Viewer p9Form={viewingP9} />
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
            <h1 className="text-lg font-bold truncate">P9 Forms</h1>
            <p className="text-[12px] text-muted-foreground truncate">Annual tax summaries</p>
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
              P9 Forms
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 mt-1",
              shouldExpand ? "text-xs" : "text-sm"
            )}>
              Annual tax summaries for KRA submission and compliance reporting
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
        {/* Annual Tax Return Due Date Alert */}
        {selectedYear && annualDueDateInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={cn(
              "border-2",
              annualDueDateInfo.isOverdue 
                ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                : annualDueDateInfo.isDueSoon
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      annualDueDateInfo.isOverdue 
                        ? "bg-red-500/20" 
                        : annualDueDateInfo.isDueSoon
                        ? "bg-yellow-500/20"
                        : "bg-blue-500/20"
                    )}>
                      <Calendar className={cn(
                        "h-5 w-5",
                        annualDueDateInfo.isOverdue 
                          ? "text-red-600 dark:text-red-400" 
                          : annualDueDateInfo.isDueSoon
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-blue-600 dark:text-blue-400"
                      )} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {annualDueDateInfo.isOverdue 
                          ? '⚠️ Annual Tax Return (P9/P10) Overdue!' 
                          : annualDueDateInfo.isDueSoon
                          ? '⏰ Annual Tax Return Due Soon'
                          : '📅 Annual Tax Return Due Date'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Tax Year {selectedYear}: Deadline <span className="font-medium">{annualDueDateInfo.dueDateFormatted}</span> • {annualDueDateMessage}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Annual P9/P10 returns must be submitted to KRA by the last day of February following the tax year
                      </div>
                    </div>
                  </div>
                  {annualDueDateInfo.isOverdue && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      OVERDUE
                    </Badge>
                  )}
                  {annualDueDateInfo.isDueSoon && !annualDueDateInfo.isOverdue && (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-yellow-500 text-yellow-700 dark:text-yellow-400">
                      DUE SOON
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total P9 Forms</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredP9Forms.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Gross Salary</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalStats.totalGross)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total PAYE</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(totalStats.totalPAYE)}</p>
                </div>
                <Calculator className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Net Salary</p>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(totalStats.totalNet)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 kenya-gradient">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filter & Search
            </CardTitle>
            <CardDescription>Find P9 forms by employee, year, or search term</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Search Employee</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Tax Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-medium"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Select Employee</Label>
                <Combobox
                  options={employeeOptions}
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  placeholder="All employees..."
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <FileText className="h-3 w-3 mr-1" />
                {filteredP9Forms.length} P9 forms found
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Calculator className="h-3 w-3 mr-1" />
                Total PAYE: {formatCurrency(totalStats.totalPAYE)}
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                <DollarSign className="h-3 w-3 mr-1" />
                Year: {selectedYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isP9Loading && selectedEmployeeId && (
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span>Loading P9 form...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {p9Error && selectedEmployeeId && (
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading P9 form: {p9Error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Mobile Cards */}
        {!isP9Loading && filteredP9Forms.length > 0 && (
        <div className="sm:hidden space-y-4">
          <AnimatePresence>
            {filteredP9Forms.map((p9Form) => (
              <P9Card key={p9Form.id} p9Form={p9Form} onView={(p) => {
                setViewingP9(p)
                // Scroll to top when viewing P9 form
                window.scrollTo({ top: 0, behavior: 'smooth' })
                document.documentElement.scrollTop = 0
                document.body.scrollTop = 0
              }} />
            ))}
          </AnimatePresence>
        </div>
        )}

        {/* Desktop Table */}
        {!isP9Loading && filteredP9Forms.length > 0 && (
        <P9Table data={filteredP9Forms} onView={(p) => {
          setViewingP9(p)
          // Scroll to top when viewing P9 form
          window.scrollTo({ top: 0, behavior: 'smooth' })
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0
        }} />
        )}

        {/* Empty State - No Employee Selected */}
        {!selectedEmployeeId && !isP9Loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <div className="kenya-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select an Employee</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Choose an employee from the dropdown above and select a tax year to view their P9 form
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State - Employee Selected but No Payroll Data */}
        {hasNoPayrollData && !isP9Loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-16 border-2 border-amber-300 bg-amber-50/50">
              <CardContent>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-amber-100">
                  <AlertCircle className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-900">No Payroll Data Found</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {p9FormData?.employee_name || 'This employee'} has no payroll records for the year {selectedYear}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Payroll records must be processed first before P9 forms can be generated.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedEmployeeId('')
                      setViewingP9(null)
                    }}
                  >
                    Select Different Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State - Search/Filter Results */}
        {selectedEmployeeId && !hasNoPayrollData && filteredP9Forms.length === 0 && !isP9Loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <div className="kenya-gradient w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">No P9 Forms Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find P9 forms
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedYear(currentYear)
                    setSelectedEmployeeId('')
                    setViewingP9(null)
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KRA Compliance Notice */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              KRA Submission Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>P9 forms must be submitted to KRA by <strong>January 31st</strong> of the following year</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Ensure all employee information matches KRA records exactly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Verify PAYE calculations against current KRA tax brackets</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Keep copies of all submitted P9 forms for audit purposes</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

