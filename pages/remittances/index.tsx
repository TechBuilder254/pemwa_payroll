import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Download, 
  Calendar,
  FileText,
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Minus,
  Shield,
  Home,
  Banknote,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/payroll-calculations'
import { getMonthlyRemittanceDueDate, getDueDateMessage } from '@/lib/kenyan-due-dates'
import { generateRemittancePDF } from '@/lib/exports/pdf'
import { generateRemittanceExcel } from '@/lib/exports/excel'
import { useRemittances } from '@/hooks/useRemittances'
import { useEmployees } from '@/hooks/useEmployees'

// Remittance data structure (matches API response)
type RemittanceEmployee = {
  id?: string
  employee_id: string
  employee_code: string
  employee_name: string
  gross_salary: number
  nssf_employee: number
  nssf_employer: number
  shif_employee: number
  shif_employer: number
  ahl_employee: number
  ahl_employer: number
  paye: number
  net_salary: number
  employer_cost: number
}

interface RemittanceTotals {
  nssfEmployee: number
  nssfEmployer: number
  nssfTotal: number
  shifEmployee: number
  shifEmployer: number
  shifTotal: number
  ahlEmployee: number
  ahlEmployer: number
  ahlTotal: number
  payeTotal: number
  totalNetPayroll: number
  totalEmployerCost: number
}

function RemittanceSummary({ totals, month, employeeCount }: { totals: RemittanceTotals, month: string, employeeCount: number }) {
  const dueDate = new Date(month + '-09')
  const isOverdue = dueDate < new Date()
  
  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              Monthly Remittance Summary
            </CardTitle>
            <CardDescription className="mt-1">
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <Badge variant={isOverdue ? 'destructive' : 'default'} className="gap-2">
            {isOverdue ? (
              <>
                <AlertCircle className="h-3 w-3" />
                Overdue
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                Due Soon
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Due Date Alert */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-lg border-2",
            isOverdue 
              ? 'bg-red-500/10 border-red-400/50 dark:bg-red-950/20' 
              : 'bg-amber-500/10 border-amber-400/50 dark:bg-amber-950/20'
          )}
        >
          <div className="flex items-center gap-3">
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <p className={cn(
                "font-medium",
                isOverdue ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
              )}>
                {isOverdue ? 'Overdue' : 'Due Soon'}
              </p>
              <p className={cn(
                "text-sm",
                isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
              )}>
                Remittance due: {dueDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Agency Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NSSF */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-blue-300/50 hover:border-blue-400/70 transition-colors">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  NSSF
                </CardTitle>
                <CardDescription>National Social Security Fund</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center p-2 rounded-lg border border-blue-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employee</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.nssfEmployee)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-blue-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employer</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.nssfEmployer)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-300/50 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate pr-1">Total</span>
                  <span className="font-bold text-blue-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.nssfTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SHIF */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-green-300/50 hover:border-green-400/70 transition-colors">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-500/10 to-green-600/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  SHIF
                </CardTitle>
                <CardDescription>Social Health Insurance Fund</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center p-2 rounded-lg border border-green-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employee</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.shifEmployee)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-amber-300/40 border-dashed bg-card/50 min-w-0">
                  <span className="text-xs sm:text-sm italic text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employer</span>
                  <span className="font-semibold italic text-xs sm:text-sm text-slate-900 dark:text-foreground whitespace-nowrap ml-1">N/A</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-300/50 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate pr-1">Total</span>
                  <span className="font-bold text-green-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.shifEmployee)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AHL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-purple-300/50 hover:border-purple-400/70 transition-colors">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  AHL
                </CardTitle>
                <CardDescription>Affordable Housing Levy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center p-2 rounded-lg border border-purple-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employee</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.ahlEmployee)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-purple-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employer</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.ahlEmployer)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-300/50 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate pr-1">Total</span>
                  <span className="font-bold text-purple-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.ahlTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* PAYE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-orange-300/50 hover:border-orange-400/70 transition-colors">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  PAYE
                </CardTitle>
                <CardDescription>Income Tax</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center p-2 rounded-lg border border-orange-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">PAYE (KRA)</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(totals.payeTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-300/50 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate pr-1">Total</span>
                  <span className="font-bold text-orange-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.payeTotal)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Totals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Monthly Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border border-green-200/30 bg-card min-w-0">
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Net Payroll</span>
                    <span className="font-bold text-green-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.totalNetPayroll)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border border-blue-200/30 bg-card min-w-0">
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employer Cost</span>
                    <span className="font-bold text-blue-600 text-sm sm:text-lg truncate text-right ml-1">{formatCurrency(totals.totalEmployerCost)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border border-red-200/30 bg-card min-w-0">
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Gov Remit</span>
                    <span className="font-bold text-red-600 text-sm sm:text-lg truncate text-right ml-1">
                      {formatCurrency(totals.nssfTotal + totals.shifTotal + totals.ahlTotal + totals.payeTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg border border-border/50 bg-card min-w-0">
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Employees</span>
                    <Badge variant="outline" className="font-bold text-sm sm:text-lg px-2 sm:px-3 py-1 flex-shrink-0">{employeeCount}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </CardContent>
    </Card>
  )
}

function ExpandableEmployeeCard({ employee }: { employee: RemittanceEmployee }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-0">
        {/* Collapsed View - Minimal Details */}
        <div className="flex items-center justify-between p-3 sm:p-4 gap-2 min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="kenya-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">
                {employee.employee_name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-lg truncate text-slate-900 dark:text-foreground">{employee.employee_name}</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground truncate">{employee.employee_code}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="text-right">
              <div className="font-bold text-primary text-sm sm:text-lg whitespace-nowrap">
                {formatCurrency(employee.net_salary)}
              </div>
              <div className="text-xs text-slate-600 dark:text-muted-foreground font-medium whitespace-nowrap">Net</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 w-9 flex-shrink-0"
            >
              {isExpanded ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded View - Full Details */}
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-card/50"
          >
            {/* Employee Deductions Section */}
            <div className="p-4 border-b border-border/50">
              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-red-500" />
                Employee Deductions
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg border border-green-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">Gross</span>
                  <span className="font-semibold text-sm sm:text-lg text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.gross_salary)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">PAYE</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.paye)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">NSSF Emp</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.nssf_employee)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">SHIF Emp</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.shif_employee)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">AHL Emp</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.ahl_employee)}</span>
                </div>
              </div>
            </div>
            
            {/* Employer Contributions Section */}
            <div className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                Employer Contributions
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg border border-blue-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">NSSF Empr</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.nssf_employer)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-amber-300/40 border-dashed bg-card/50 min-w-0">
                  <span className="text-xs sm:text-sm italic text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">SHIF Empr</span>
                  <span className="font-semibold italic text-xs sm:text-sm text-slate-900 dark:text-foreground whitespace-nowrap ml-1">N/A</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg border border-purple-200/30 bg-card min-w-0">
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-muted-foreground font-medium truncate pr-1">AHL Empr</span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-foreground truncate text-right ml-1">{formatCurrency(employee.ahl_employer)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-300/50 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-foreground truncate pr-1">Total Cost</span>
                  <span className="font-bold text-sm sm:text-lg text-blue-600 truncate text-right ml-1">{formatCurrency(employee.employer_cost)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function EmployeeRemittanceTable({ employees }: { employees: RemittanceEmployee[] }) {
  return (
    <Card className="overflow-hidden min-w-0 border-2">
      <CardHeader className="min-w-0 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <span className="truncate">Employee Breakdown</span>
        </CardTitle>
        <CardDescription className="truncate">Individual contributions for each employee</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {/* Mobile View - Expandable Cards */}
        <div className="sm:hidden space-y-2">
          {employees.map((employee) => (
            <ExpandableEmployeeCard key={employee.employee_id || employee.employee_code} employee={employee} />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden sm:block rounded-md border-2 min-w-0 overflow-hidden">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="border-b bg-card/50">
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"20%"}}>
                  Employee
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  Gross Salary
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  PAYE
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  NSSF (E/E)
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  SHIF (Emp)
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  AHL (E/E)
                </th>
                <th className="h-10 px-2 text-left align-middle font-semibold text-slate-700 dark:text-muted-foreground truncate" style={{width:"12%"}}>
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <motion.tr 
                  key={employee.employee_id || employee.employee_code} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b hover:bg-card/80 transition-colors"
                >
                  <td className="p-2 min-w-0" style={{width:"20%"}}>
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="kenya-gradient w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[11px]">
                          {employee.employee_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-slate-900 dark:text-foreground" title={employee.employee_name}>{employee.employee_name}</div>
                        <div className="text-xs text-slate-600 dark:text-muted-foreground truncate">{employee.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-semibold truncate text-slate-900 dark:text-foreground" title={formatCurrency(employee.gross_salary)}>{formatCurrency(employee.gross_salary)}</div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-semibold truncate text-slate-900 dark:text-foreground" title={formatCurrency(employee.paye)}>{formatCurrency(employee.paye)}</div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs font-medium truncate text-slate-700 dark:text-muted-foreground" title={`${formatCurrency(employee.nssf_employee)} / ${formatCurrency(employee.nssf_employer)}`}>
                      <span className="text-slate-900 dark:text-foreground">{formatCurrency(employee.nssf_employee)}</span> / <span className="text-slate-900 dark:text-foreground">{formatCurrency(employee.nssf_employer)}</span>
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs font-medium truncate text-slate-900 dark:text-foreground" title={formatCurrency(employee.shif_employee)}>
                      {formatCurrency(employee.shif_employee)}
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs font-medium truncate text-slate-700 dark:text-muted-foreground" title={`${formatCurrency(employee.ahl_employee)} / ${formatCurrency(employee.ahl_employer)}`}>
                      <span className="text-slate-900 dark:text-foreground">{formatCurrency(employee.ahl_employee)}</span> / <span className="text-slate-900 dark:text-foreground">{formatCurrency(employee.ahl_employer)}</span>
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-bold text-primary truncate" title={formatCurrency(employee.net_salary)}>{formatCurrency(employee.net_salary)}</div>
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

export default function RemittancesPage() {
  const { shouldExpand } = useSidebar()
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isExporting, setIsExporting] = useState(false)
  const { data: remittanceData, isLoading: isRemittancesLoading, error: remittancesError } = useRemittances(selectedMonth)
  const { data: allEmployees } = useEmployees()

  const currentRemittance = remittanceData

  // Calculate how many employees don't have payroll for this month
  const employeesWithPayroll = currentRemittance?.totals.employeeCount || 0
  const totalEmployees = allEmployees?.length || 0
  const missingEmployeesCount = totalEmployees - employeesWithPayroll

  const totals: RemittanceTotals = currentRemittance ? {
    nssfEmployee: currentRemittance.totals.nssfEmployee,
    nssfEmployer: currentRemittance.totals.nssfEmployer,
    nssfTotal: currentRemittance.totals.nssfTotal,
    shifEmployee: currentRemittance.totals.shifEmployee,
    shifEmployer: 0, // Employer does NOT pay SHIF (backend already sets this)
    shifTotal: currentRemittance.totals.shifTotal,
    ahlEmployee: currentRemittance.totals.ahlEmployee,
    ahlEmployer: currentRemittance.totals.ahlEmployer,
    ahlTotal: currentRemittance.totals.ahlTotal,
    payeTotal: currentRemittance.totals.payeTotal,
    totalNetPayroll: currentRemittance.totals.totalNetPayroll,
    totalEmployerCost: currentRemittance.totals.totalEmployerCost
  } : {
    nssfEmployee: 0, nssfEmployer: 0, nssfTotal: 0,
    shifEmployee: 0, shifEmployer: 0, shifTotal: 0,
    ahlEmployee: 0, ahlEmployer: 0, ahlTotal: 0,
    payeTotal: 0,
    totalNetPayroll: 0, totalEmployerCost: 0
  }

  const totalGovernmentRemittances = totals.nssfTotal + totals.shifTotal + totals.ahlTotal + totals.payeTotal
  const totalEmployerRemittances = totals.nssfEmployer + totals.ahlEmployer // NSSF + AHL, employer does NOT pay SHIF
  const totalEmployeeRemittances = totals.nssfEmployee + totals.shifEmployee + totals.ahlEmployee + totals.payeTotal // Employee portion only

  // Calculate Kenyan government due date (9th of following month)
  const dueDateInfo = getMonthlyRemittanceDueDate(selectedMonth)
  const dueDateMessage = getDueDateMessage(dueDateInfo, 'monthly')

  const handleExportPDF = async () => {
    if (!currentRemittance) return
    setIsExporting(true)
    const data = {
      month: selectedMonth,
      employees: currentRemittance.employees.map((e) => ({
        employee: { name: e.employee_name, employee_id: e.employee_code },
        month: selectedMonth,
        gross_salary: e.gross_salary,
        basic_salary: 0,
        allowances_total: 0,
        overtime: 0,
        bonuses: 0,
        nssf_employee: e.nssf_employee,
        nssf_employer: e.nssf_employer,
        shif_employee: e.shif_employee,
        shif_employer: e.shif_employer,
        ahl_employee: e.ahl_employee,
        ahl_employer: e.ahl_employer,
        helb: 0,
        voluntary_deductions_total: 0,
        paye_after_relief: e.paye,
        total_deductions: 0,
        net_salary: e.net_salary,
        total_employer_cost: e.employer_cost,
      })),
      totals,
    }
    await generateRemittancePDF(data)
    setIsExporting(false)
  }

  const handleExportExcel = async () => {
    if (!currentRemittance) return
    setIsExporting(true)
    const data = {
      month: selectedMonth,
      employees: currentRemittance.employees.map((e) => ({
        employee: { name: e.employee_name, employee_id: e.employee_code },
        month: selectedMonth,
        gross_salary: e.gross_salary,
        basic_salary: 0,
        allowances_total: 0,
        overtime: 0,
        bonuses: 0,
        nssf_employee: e.nssf_employee,
        nssf_employer: e.nssf_employer,
        shif_employee: e.shif_employee,
        shif_employer: e.shif_employer,
        ahl_employee: e.ahl_employee,
        ahl_employer: e.ahl_employer,
        helb: 0,
        voluntary_deductions_total: 0,
        paye_after_relief: e.paye,
        total_deductions: 0,
        net_salary: e.net_salary,
        total_employer_cost: e.employer_cost,
      })),
      totals,
    }
    generateRemittanceExcel(data)
    setIsExporting(false)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Remittances</h1>
            <p className="text-[12px] text-muted-foreground truncate">Monthly statutory payments</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 shadow-lg">
            <Banknote className="h-5 w-5 text-white" />
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
              Remittances
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 mt-1",
              shouldExpand ? "text-xs" : "text-sm"
            )}>
              Monthly statutory payments to government agencies and compliance tracking
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 shadow-lg">
            <Banknote className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6"
      )}>
        {/* Due Date Alert */}
        {currentRemittance && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={cn(
              "border-2",
              dueDateInfo.isOverdue 
                ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                : dueDateInfo.isDueSoon
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      dueDateInfo.isOverdue 
                        ? "bg-red-500/20" 
                        : dueDateInfo.isDueSoon
                        ? "bg-yellow-500/20"
                        : "bg-blue-500/20"
                    )}>
                      <Calendar className={cn(
                        "h-5 w-5",
                        dueDateInfo.isOverdue 
                          ? "text-red-600 dark:text-red-400" 
                          : dueDateInfo.isDueSoon
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-blue-600 dark:text-blue-400"
                      )} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {dueDateInfo.isOverdue 
                          ? '⚠️ Remittance Overdue!' 
                          : dueDateInfo.isDueSoon
                          ? '⏰ Remittance Due Soon'
                          : '📅 Remittance Due Date'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Deadline: <span className="font-medium">{dueDateInfo.dueDateFormatted}</span> • {dueDateMessage}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        All remittances (PAYE, NSSF, SHIF, AHL) must be submitted to KRA by the 9th of the following month
                      </div>
                    </div>
                  </div>
                  {dueDateInfo.isOverdue && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      OVERDUE
                    </Badge>
                  )}
                  {dueDateInfo.isDueSoon && !dueDateInfo.isOverdue && (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-yellow-500 text-yellow-700 dark:text-yellow-400">
                      DUE SOON
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Prominent Government Remittances Summary */}
        {currentRemittance && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-red-400/50 bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-950/20 dark:to-red-950/10">
              <CardHeader className="pb-4 border-b border-red-400/30">
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span>Total Government Remittances</span>
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Amount you owe to the government before paying employees
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end ml-4 flex-shrink-0">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(totalGovernmentRemittances)}
                    </div>
                    <div className={cn(
                      "text-xs font-medium mt-1",
                      dueDateInfo.isOverdue 
                        ? "text-red-600 dark:text-red-400" 
                        : dueDateInfo.isDueSoon
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    )}>
                      Due: {dueDateInfo.dueDateFormatted}
                    </div>
                    <div className={cn(
                      "text-[10px] mt-0.5",
                      dueDateInfo.isOverdue 
                        ? "text-red-600 dark:text-red-400 font-semibold" 
                        : dueDateInfo.isDueSoon
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    )}>
                      {dueDateMessage}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-lg p-4 border border-blue-300/30 bg-card">
                    <div className="text-xs font-medium text-slate-700 dark:text-muted-foreground mb-2">Employer Portion</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalEmployerRemittances)}
                    </div>
                    <div className="text-[12px] text-slate-600 dark:text-muted-foreground mt-2 space-y-1.5">
                      <div className="font-medium">NSSF: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.nssfEmployer)}</span></div>
                      <div className="font-medium">SHIF: <span className="font-semibold text-slate-900 dark:text-foreground">N/A</span></div>
                      <div className="font-medium">AHL: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.ahlEmployer)}</span></div>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-green-300/30 bg-card">
                    <div className="text-xs font-medium text-slate-700 dark:text-muted-foreground mb-2">Employee Portion (Deducted)</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(totalEmployeeRemittances)}
                    </div>
                    <div className="text-[12px] text-slate-600 dark:text-muted-foreground mt-2 space-y-1.5">
                      <div className="font-medium">NSSF: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.nssfEmployee)}</span></div>
                      <div className="font-medium">SHIF: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.shifEmployee)}</span></div>
                      <div className="font-medium">AHL: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.ahlEmployee)}</span></div>
                      <div className="font-medium">PAYE: <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.payeTotal)}</span></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-red-400/30">
                  <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Download PDF'}
                  </Button>
                  <Button 
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="kenya-gradient text-white hover:opacity-90 flex-1 gap-2 shadow-lg"
                    size="lg"
                  >
                    <FileText className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Month Selection */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              Select Month
            </CardTitle>
            <CardDescription>Choose the month for remittance summary</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Payroll Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
            
            {/* Warning about missing employees */}
            {!isRemittancesLoading && currentRemittance && missingEmployeesCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border-2 border-amber-400/50 bg-amber-500/10 dark:bg-amber-950/20"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                      Incomplete Payroll Data
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                      {missingEmployeesCount} of {totalEmployees} employee{totalEmployees !== 1 ? 's' : ''} do not have payroll records for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                    </p>
                    <Button
                      onClick={() => navigate('/payroll')}
                      variant="outline"
                      size="sm"
                      className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Run Payroll for All Employees
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {remittancesError && (
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading remittances: {remittancesError.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Remittance Summary */}
        {!remittancesError && currentRemittance && currentRemittance.totals.employeeCount > 0 ? (
          <>
            <RemittanceSummary totals={totals} month={selectedMonth} employeeCount={currentRemittance.totals.employeeCount} />
            <EmployeeRemittanceTable employees={currentRemittance.employees.map(e => ({
              employee_id: e.employee_id,
              employee_code: e.employee_code,
              employee_name: e.employee_name,
              gross_salary: e.gross_salary,
              nssf_employee: e.nssf_employee,
              nssf_employer: e.nssf_employer,
              shif_employee: e.shif_employee,
              shif_employer: e.shif_employer,
              ahl_employee: e.ahl_employee,
              ahl_employer: e.ahl_employer,
              paye: e.paye,
              net_salary: e.net_salary,
              employer_cost: e.employer_cost,
            }))} />
          </>
        ) : (
          <Card className="border-2 text-center py-12">
            <CardContent>
              <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No remittance data found</h3>
              <p className="text-muted-foreground mb-4">
                No payroll data available for the selected month
              </p>
              <Button 
                onClick={() => navigate('/payroll')}
                className="kenya-gradient text-white hover:opacity-90 gap-2"
              >
                <Calendar className="h-4 w-4" />
                Run Payroll
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
