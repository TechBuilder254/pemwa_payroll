import { useMemo, useState } from 'react'
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
  Calculator, 
  Play, 
  Save, 
  Users,
  Calendar,
  DollarSign,
  TrendingDown,
  CheckCircle,
  Shield,
  Home,
  TrendingUp,
  Info,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, calculatePayroll } from '@/lib/payroll-calculations'
import { Employee } from '@/lib/supabase'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import { usePayslips } from '@/hooks/usePayslips'
import { processPayroll, type PayrollRecord } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

// Data is fetched via hooks; calculations use active payroll settings

interface PayrollCalculation {
  employee: Employee
  bonuses: number
  overtime: number
  calculation: ReturnType<typeof calculatePayroll>
}

function PayrollSummary({ calculations }: { calculations: PayrollCalculation[] }) {
  const totals = calculations.reduce((acc, calc) => {
    acc.grossSalary += calc.calculation.grossSalary
    acc.totalDeductions += calc.calculation.totalDeductions
    acc.netSalary += calc.calculation.netSalary
    acc.employerCost += calc.calculation.totalEmployerCost
    acc.nssfEmployee += calc.calculation.nssfEmployee
    acc.nssfEmployer += calc.calculation.nssfEmployer
    acc.shifEmployee += calc.calculation.shifEmployee
    acc.shifEmployer += calc.calculation.shifEmployer
    acc.ahlEmployee += calc.calculation.ahlEmployee
    acc.ahlEmployer += calc.calculation.ahlEmployer
    acc.paye += calc.calculation.payeAfterRelief
    return acc
  }, {
    grossSalary: 0,
    totalDeductions: 0,
    netSalary: 0,
    employerCost: 0,
    nssfEmployee: 0,
    nssfEmployer: 0,
    shifEmployee: 0,
    shifEmployer: 0,
    ahlEmployee: 0,
    ahlEmployer: 0,
    paye: 0
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden min-w-0 border-2">
        <CardHeader className="min-w-0 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <CardTitle className="flex items-center gap-2 truncate">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary flex-shrink-0" />
            </div>
            <span className="truncate">Payroll Summary</span>
          </CardTitle>
          <CardDescription className="truncate">Total amounts for {calculations.length} employees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Gross Salary</span>
                <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(totals.grossSalary)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-red-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Total Deductions</span>
                <span className="font-semibold text-red-600">{formatCurrency(totals.totalDeductions)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-green-300/50 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Net Payroll</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(totals.netSalary)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Employer Cost</span>
                <span className="font-semibold text-blue-600">{formatCurrency(totals.employerCost)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">NSSF (Emp/Er)</span>
                <span className="text-sm font-medium text-slate-900 dark:text-foreground">{formatCurrency(totals.nssfEmployee)} / {formatCurrency(totals.nssfEmployer)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-green-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">SHIF (Employee)</span>
                <span className="text-sm font-medium text-slate-900 dark:text-foreground">{formatCurrency(totals.shifEmployee)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-purple-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">AHL (Emp/Er)</span>
                <span className="text-sm font-medium text-slate-900 dark:text-foreground">{formatCurrency(totals.ahlEmployee)} / {formatCurrency(totals.ahlEmployer)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-orange-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">PAYE</span>
                <span className="text-sm font-medium text-slate-900 dark:text-foreground">{formatCurrency(totals.paye)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmployeePayrollCard({ 
  calculation, 
  onUpdate 
}: { 
  calculation: PayrollCalculation
  onUpdate: (employeeId: string, bonuses: number, overtime: number) => void
}) {
  const { employee, bonuses, overtime, calculation: calc } = calculation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden min-w-0 border-2">
        <CardHeader className="pb-3 min-w-0 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-base">
                  {employee.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate text-slate-900 dark:text-foreground" title={employee.name}>{employee.name}</CardTitle>
                <CardDescription className="text-sm truncate" title={`${employee.position} • ${employee.employee_id}`}>
                  {employee.position} • {employee.employee_id}
                </CardDescription>
              </div>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1 flex-shrink-0 ml-2 font-semibold" title={formatCurrency(calc.netSalary)}>
              {formatCurrency(calc.netSalary)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Input Fields */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="space-y-2">
              <Label htmlFor={`bonuses-${employee.id}`} className="text-xs font-medium text-slate-700 dark:text-muted-foreground">Bonuses</Label>
              <Input
                id={`bonuses-${employee.id}`}
                type="number"
                value={bonuses}
                onChange={(e) => onUpdate(employee.id, Number(e.target.value), overtime)}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`overtime-${employee.id}`} className="text-xs font-medium text-slate-700 dark:text-muted-foreground">Overtime</Label>
              <Input
                id={`overtime-${employee.id}`}
                type="number"
                value={overtime}
                onChange={(e) => onUpdate(employee.id, bonuses, Number(e.target.value))}
                placeholder="0"
                className="text-sm"
              />
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center p-2 rounded-lg border border-green-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Basic + Allowances</span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.basicSalary + calc.allowancesTotal)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-green-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Bonuses + Overtime</span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.bonuses + calc.overtime)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-300/50">
              <span className="text-sm font-semibold text-slate-900 dark:text-foreground">Gross Salary</span>
              <span className="font-bold text-green-600">{formatCurrency(calc.grossSalary)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                <Shield className="h-3 w-3 text-blue-500" />
                NSSF
              </span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.nssfEmployee)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                SHIF
              </span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.shifEmployee)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium flex items-center gap-2">
                <Home className="h-3 w-3 text-purple-500" />
                AHL
              </span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.ahlEmployee)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
              <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">PAYE</span>
              <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.payeAfterRelief)}</span>
            </div>
            {calc.helb > 0 && (
              <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">HELB</span>
                <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.helb)}</span>
              </div>
            )}
            {calc.voluntaryDeductionsTotal > 0 && (
              <div className="flex justify-between items-center p-2 rounded-lg border border-red-200/30 bg-card">
                <span className="text-sm text-slate-700 dark:text-muted-foreground font-medium">Voluntary</span>
                <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(calc.voluntaryDeductionsTotal)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 border-2 border-green-300/50">
              <span className="text-base font-bold text-slate-900 dark:text-foreground">Net Salary</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(calc.netSalary)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function PayrollPage() {
  const { shouldExpand } = useSidebar()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectAllEmployees, setSelectAllEmployees] = useState(false)
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [comboboxKey, setComboboxKey] = useState(0) // Force reset combobox
  const [existingPayrolls, setExistingPayrolls] = useState<Set<string>>(new Set()) // Track employee IDs with existing payrolls
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: settings, isLoading: isSettingsLoading } = usePayrollSettings()
  const { data: payslipsData } = usePayslips(undefined, selectedMonth) // Check existing payslips for selected month

  const employeeOptions = (employees ?? []).map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`
  }))

  // Check for existing payrolls when month or payslips change
  useMemo(() => {
    if (selectedMonth && payslipsData) {
      const existing = new Set<string>()
      payslipsData.forEach((payslip) => {
        if (payslip.month === selectedMonth) {
          existing.add(payslip.employee_id)
        }
      })
      setExistingPayrolls(existing)
    } else {
      setExistingPayrolls(new Set())
    }
  }, [selectedMonth, payslipsData])

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (selectAllEmployees) {
      // Deselect all
      setSelectedEmployees([])
      setSelectAllEmployees(false)
    } else {
      // Select all employees
      const allIds = (employees ?? []).map(emp => emp.id)
      setSelectedEmployees(allIds)
      setSelectAllEmployees(true)
      toast({
        title: "All Employees Selected",
        description: `Selected ${allIds.length} employee(s) for payroll processing`,
      })
    }
  }

  // Update selectAllEmployees state when selectedEmployees changes manually
  useMemo(() => {
    const allEmployeesCount = employees?.length || 0
    if (allEmployeesCount > 0 && selectedEmployees.length === allEmployeesCount) {
      setSelectAllEmployees(true)
    } else if (selectedEmployees.length < allEmployeesCount) {
      setSelectAllEmployees(false)
    }
  }, [selectedEmployees, employees])

  const calculatePayrollLocal = () => {
    if (!selectedMonth || selectedEmployees.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a month and at least one employee",
        variant: "destructive"
      })
      return
    }

    if (!settings) {
      toast({
        title: "Payroll Settings Required",
        description: "Please configure payroll settings before processing payroll",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        const newCalculations = selectedEmployees.map(employeeId => {
          const employee = (employees ?? []).find(emp => emp.id === employeeId)!
          const calculation = calculatePayroll(
            { id: employee.id, basic_salary: employee.basic_salary, helb_amount: employee.helb_amount } as any,
            employee.allowances as any,
            employee.voluntary_deductions as any,
            0,
            0,
            settings as any
          )
          
          return {
            employee,
            bonuses: 0,
            overtime: 0,
            calculation
          }
        })
        
        setCalculations(newCalculations)
        toast({
          title: "Payroll Calculated",
          description: `Calculated payroll for ${newCalculations.length} employee(s)`,
        })
      } catch (error: any) {
        console.error('Error calculating payroll:', error)
        toast({
          title: "Calculation Error",
          description: error?.message || "Failed to calculate payroll. Please check settings and employee data.",
          variant: "destructive"
        })
      } finally {
        setIsProcessing(false)
      }
    }, 500)
  }

  const updateEmployeeCalculation = (employeeId: string, bonuses: number, overtime: number) => {
    setCalculations(prev => prev.map(calc => {
      if (calc.employee.id === employeeId) {
        const newCalculation = calculatePayroll(
          { id: calc.employee.id, basic_salary: calc.employee.basic_salary, helb_amount: calc.employee.helb_amount } as any,
          calc.employee.allowances as any,
          calc.employee.voluntary_deductions as any,
          bonuses,
          overtime,
          settings as any
        )
        return { ...calc, bonuses, overtime, calculation: newCalculation }
      }
      return calc
    }))
  }

  const savePayroll = async () => {
    if (!selectedMonth || calculations.length === 0) {
      toast({
        title: "Error",
        description: "Please process payroll before saving",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    
    try {
      // Validate we have valid data
      if (calculations.length === 0) {
        throw new Error('No calculations to save. Please process payroll first.')
      }

      // Validate employee IDs exist
      const invalidEmployees = calculations.filter(calc => !calc.employee?.id)
      if (invalidEmployees.length > 0) {
        throw new Error(`Some employees are missing IDs. Please refresh and try again.`)
      }

      // Convert calculations to payroll records format
      // Ensure all required fields are present (use 0 as default, but ensure they're numbers, not undefined)
      const records: PayrollRecord[] = calculations.map(calc => {
        if (!calc.employee?.id) {
          throw new Error(`Employee ${calc.employee?.name || 'unknown'} is missing an ID`)
        }
        // Ensure calculation object exists and has required values
        if (!calc.calculation) {
          throw new Error(`Employee ${calc.employee.name} calculation is missing. Please click "Calculate Payroll" first.`)
        }
        return {
          employee_id: calc.employee.id,
          gross_salary: typeof calc.calculation.grossSalary === 'number' ? calc.calculation.grossSalary : 0,
          basic_salary: typeof calc.calculation.basicSalary === 'number' ? calc.calculation.basicSalary : 0,
          allowances_total: typeof calc.calculation.allowancesTotal === 'number' ? calc.calculation.allowancesTotal : 0,
          overtime: typeof calc.calculation.overtime === 'number' ? calc.calculation.overtime : 0,
          bonuses: typeof calc.calculation.bonuses === 'number' ? calc.calculation.bonuses : 0,
          nssf_employee: typeof calc.calculation.nssfEmployee === 'number' ? calc.calculation.nssfEmployee : 0,
          nssf_employer: typeof calc.calculation.nssfEmployer === 'number' ? calc.calculation.nssfEmployer : 0,
          shif_employee: typeof calc.calculation.shifEmployee === 'number' ? calc.calculation.shifEmployee : 0,
          shif_employer: typeof calc.calculation.shifEmployer === 'number' ? calc.calculation.shifEmployer : 0,
          ahl_employee: typeof calc.calculation.ahlEmployee === 'number' ? calc.calculation.ahlEmployee : 0,
          ahl_employer: typeof calc.calculation.ahlEmployer === 'number' ? calc.calculation.ahlEmployer : 0,
          helb: typeof calc.calculation.helb === 'number' ? calc.calculation.helb : 0,
          voluntary_deductions_total: typeof calc.calculation.voluntaryDeductionsTotal === 'number' ? calc.calculation.voluntaryDeductionsTotal : 0,
          paye_before_relief: typeof calc.calculation.payeBeforeRelief === 'number' ? calc.calculation.payeBeforeRelief : 0,
          personal_relief: typeof calc.calculation.personalRelief === 'number' ? calc.calculation.personalRelief : 0,
          paye_after_relief: typeof calc.calculation.payeAfterRelief === 'number' ? calc.calculation.payeAfterRelief : 0,
          total_deductions: typeof calc.calculation.totalDeductions === 'number' ? calc.calculation.totalDeductions : 0,
          net_salary: typeof calc.calculation.netSalary === 'number' ? calc.calculation.netSalary : 0,
          total_employer_cost: typeof calc.calculation.totalEmployerCost === 'number' ? calc.calculation.totalEmployerCost : 0
        }
      })

      console.log('[savePayroll] Sending payroll data:', {
        period_month: selectedMonth,
        record_count: records.length,
        employee_ids: records.map(r => r.employee_id)
      })

      console.log('[savePayroll] Calling processPayroll function...')
      let result
      try {
        result = await processPayroll({
          period_month: selectedMonth,
          records,
          notes: `Payroll processed for ${calculations.length} employee(s)`
        })
        console.log('[savePayroll] processPayroll returned:', result)
      } catch (apiError: any) {
        console.error('[savePayroll] processPayroll threw error:', apiError)
        throw apiError // Re-throw to be caught by outer catch
      }

      console.log('[savePayroll] Payroll saved successfully:', result)
      console.log('[savePayroll] Result type check:', {
        isUndefined: result === undefined,
        isNull: result === null,
        isFalsy: !result,
        hasRecordsInserted: typeof result?.records_inserted !== 'undefined',
        recordsInserted: result?.records_inserted
      })
      
      // Double check result is not undefined
      if (result === undefined || result === null) {
        console.error('[savePayroll] Result is undefined/null after processPayroll call')
        throw new Error('processPayroll returned undefined. Check console for [processPayroll] logs.')
      }

      // Validate result structure
      if (typeof result !== 'object') {
        console.error('[savePayroll] Result is not an object:', typeof result, result)
        throw new Error('Invalid response from server: expected an object.')
      }
      
      if (typeof result.records_inserted === 'undefined') {
        console.error('[savePayroll] Payroll API response missing records_inserted. Result:', result)
        throw new Error('Invalid response format from server: missing records_inserted field.')
      }

      // Invalidate queries first
      console.log('[savePayroll] Invalidating queries...')
      queryClient.invalidateQueries({ queryKey: ['payslips'] })
      queryClient.invalidateQueries({ queryKey: ['remittances'] }) // This will invalidate all remittances queries for all months
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['p9'] })
      
      // Wait for refetch to complete before showing success
      console.log('[savePayroll] Refetching queries...')
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['payslips'] }),
        queryClient.refetchQueries({ queryKey: ['remittances'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.refetchQueries({ queryKey: ['p9'] }),
      ])
      console.log('[savePayroll] Queries invalidated and refetched successfully')

      // Format period_month for display (convert '2025-09-30' to '2025-09')
      const displayMonth = result.period_month 
        ? result.period_month.slice(0, 7) 
        : selectedMonth

      // Check if all records were unchanged
      if (result.records_unchanged && result.records_unchanged > 0 && result.records_inserted === 0 && result.records_updated === 0) {
        toast({
          title: "No Changes Detected",
          description: result.message || `All ${result.records_unchanged} record(s) already exist and have not been modified. No changes were saved.`,
          variant: "default"
        })
        return // Early return - no need to invalidate queries or reset form
      }

      // Build success message with details about updates vs new records
      let description = `Processed ${result.records_inserted} employee(s) for ${displayMonth}.`
      if (result.records_created && result.records_created > 0 && result.records_updated && result.records_updated > 0) {
        description = `${result.records_created} new record(s) created, ${result.records_updated} existing record(s) updated for ${displayMonth}.`
      } else if (result.records_created && result.records_created > 0) {
        description = `${result.records_created} new payroll record(s) created for ${displayMonth}.`
      } else if (result.records_updated && result.records_updated > 0) {
        description = `${result.records_updated} existing payroll record(s) updated for ${displayMonth}.`
      }
      if (result.message && result.records_unchanged && result.records_unchanged > 0) {
        description += ` ${result.message}`
      }
      if (result.errors && result.errors.length > 0) {
        description += ` ${result.errors.length} record(s) had errors.`
        // Show error details in console and as a separate error toast
        console.error('[savePayroll] Errors occurred:', result.errors)
        toast({
          title: "Some Records Failed",
          description: result.errors.slice(0, 3).join('. ') + (result.errors.length > 3 ? ` ... and ${result.errors.length - 3} more.` : ''),
          variant: "destructive"
        })
      }

      // Show success message
      toast({
        title: "Payroll Saved Successfully",
        description,
      })
      console.log('[savePayroll] Success toast shown')

      // Reset form after successful save
      setTimeout(() => {
        setSelectedMonth('')
        setSelectedEmployees([])
        setCalculations([])
        setComboboxKey(prev => prev + 1) // Reset combobox
        // Optionally redirect to payslips or dashboard
        // router.push('/payslips')
      }, 1500)
    } catch (error: any) {
      console.error('[savePayroll] Error saving payroll:', error)
      console.error('[savePayroll] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      
      let errorMessage = error?.message || "Failed to save payroll. Please try again."
      
      // Provide more helpful error messages
      if (errorMessage.includes('employee') && errorMessage.includes('not exist')) {
        errorMessage = 'One or more selected employees no longer exist. Please refresh the page and try again.'
      } else if (errorMessage.includes('foreign key')) {
        errorMessage = 'Invalid employee data. Please refresh the page and process payroll again.'
      } else if (errorMessage.includes('Invalid response')) {
        errorMessage = 'Server returned an unexpected response. Please check the console for details and try again.'
      }
      
      toast({
        title: "Error Saving Payroll",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6"
      )}>
        {/* Configuration */}
        <Card className="overflow-hidden min-w-0 border-2">
          <CardHeader className="min-w-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
            <CardTitle className="flex items-center gap-2 truncate">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              </div>
              <span className="truncate">Payroll Configuration</span>
            </CardTitle>
            <CardDescription className="truncate">Select month and employees for payroll processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Payroll Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Employees</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="gap-2"
                  >
                    {selectAllEmployees ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
                <Combobox
                  key={comboboxKey}
                  options={employeeOptions.filter(opt => !selectedEmployees.includes(opt.value))}
                  value=""
                  onValueChange={(value) => {
                    if (value && !selectedEmployees.includes(value)) {
                      const employee = (employees ?? []).find(emp => emp.id === value)
                      setSelectedEmployees([...selectedEmployees, value])
                      toast({
                        title: "Employee Added",
                        description: `${employee?.name || 'Employee'} added to payroll`,
                      })
                      // Reset combobox after selection
                      setComboboxKey(prev => prev + 1)
                    }
                  }}
                  placeholder="Add employees..."
                  emptyText="All employees selected or no employees available"
                />
              </div>
            </div>
            
            {selectedEmployees.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selected Employees ({selectedEmployees.length})</Label>
                  {existingPayrolls.size > 0 && selectedMonth && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{existingPayrolls.size} employee(s) already have payroll for this month</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map((employeeId: string) => {
                    const employee = (employees ?? []).find((emp: Employee) => emp.id === employeeId)!
                    const hasExisting = existingPayrolls.has(employeeId)
                    return (
                      <Badge 
                        key={employeeId} 
                        variant={hasExisting ? "default" : "secondary"} 
                        className={`text-sm ${hasExisting ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                      >
                        {employee.name}
                        {hasExisting && <span className="ml-1 text-xs">(Update)</span>}
                        <button
                          onClick={() => setSelectedEmployees(prev => prev.filter(id => id !== employeeId))}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            <Button 
              onClick={calculatePayrollLocal}
              disabled={!selectedMonth || selectedEmployees.length === 0 || isProcessing}
              className="kenya-gradient text-white hover:opacity-90 gap-2 shadow-lg"
              size="lg"
            >
              <Play className="h-5 w-5" />
              {isProcessing ? 'Processing...' : 'Calculate Payroll'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculations.length > 0 && (
          <>
            <PayrollSummary calculations={calculations} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Employee Calculations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {calculations.map((calculation) => (
                  <EmployeePayrollCard
                    key={calculation.employee.id}
                    calculation={calculation}
                    onUpdate={updateEmployeeCalculation}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={savePayroll}
                disabled={isSaving}
                className="kenya-gradient text-white hover:opacity-90 gap-2 shadow-lg"
                size="lg"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Saving...' : 'Save Payroll'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
