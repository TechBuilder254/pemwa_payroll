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
  CheckCircle
} from 'lucide-react'
import { formatCurrency, calculatePayroll } from '@/lib/payroll-calculations'
import { Employee } from '@/lib/supabase'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'

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
    <Card className="overflow-hidden min-w-0">
      <CardHeader className="min-w-0">
        <CardTitle className="flex items-center gap-2 truncate">
          <Calculator className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Payroll Summary</span>
        </CardTitle>
        <CardDescription className="truncate">Total amounts for {calculations.length} employees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gross Salary</span>
              <span className="font-semibold">{formatCurrency(totals.grossSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Deductions</span>
              <span className="font-semibold text-red-600">{formatCurrency(totals.totalDeductions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Net Payroll</span>
              <span className="font-semibold text-green-600">{formatCurrency(totals.netSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Employer Cost</span>
              <span className="font-semibold text-blue-600">{formatCurrency(totals.employerCost)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">NSSF (Emp/Er)</span>
              <span className="text-sm">{formatCurrency(totals.nssfEmployee)} / {formatCurrency(totals.nssfEmployer)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">SHIF (Emp/Er)</span>
              <span className="text-sm">{formatCurrency(totals.shifEmployee)} / {formatCurrency(totals.shifEmployer)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AHL (Emp/Er)</span>
              <span className="text-sm">{formatCurrency(totals.ahlEmployee)} / {formatCurrency(totals.ahlEmployer)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">PAYE</span>
              <span className="text-sm">{formatCurrency(totals.paye)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="hover:shadow-md transition-all duration-200 overflow-hidden min-w-0">
      <CardHeader className="pb-3 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {employee.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate" title={employee.name}>{employee.name}</CardTitle>
              <CardDescription className="text-sm truncate" title={`${employee.position} • ${employee.employee_id}`}>
                {employee.position} • {employee.employee_id}
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" className="text-xs flex-shrink-0 ml-2" title={formatCurrency(calc.netSalary)}>
            {formatCurrency(calc.netSalary)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`bonuses-${employee.id}`} className="text-xs">Bonuses</Label>
            <Input
              id={`bonuses-${employee.id}`}
              type="number"
              value={bonuses}
              onChange={(e) => onUpdate(employee.id, Number(e.target.value), overtime)}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`overtime-${employee.id}`} className="text-xs">Overtime</Label>
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
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Basic + Allowances</span>
            <span>{formatCurrency(calc.basicSalary + calc.allowancesTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bonuses + Overtime</span>
            <span>{formatCurrency(calc.bonuses + calc.overtime)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Gross Salary</span>
            <span>{formatCurrency(calc.grossSalary)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">NSSF</span>
            <span>{formatCurrency(calc.nssfEmployee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SHIF</span>
            <span>{formatCurrency(calc.shifEmployee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">AHL</span>
            <span>{formatCurrency(calc.ahlEmployee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PAYE</span>
            <span>{formatCurrency(calc.payeAfterRelief)}</span>
          </div>
          {calc.helb > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">HELB</span>
              <span>{formatCurrency(calc.helb)}</span>
            </div>
          )}
          {calc.voluntaryDeductionsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Voluntary</span>
              <span>{formatCurrency(calc.voluntaryDeductionsTotal)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-sm font-semibold">
            <span>Net Salary</span>
            <span className="text-green-600">{formatCurrency(calc.netSalary)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PayrollPage() {
  const { shouldExpand } = useSidebar()
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: settings, isLoading: isSettingsLoading } = usePayrollSettings()

  const employeeOptions = (employees ?? []).map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`
  }))

  const processPayroll = () => {
    if (!selectedMonth || selectedEmployees.length === 0) return

    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(() => {
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
      setIsProcessing(false)
    }, 1000)
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
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Payroll</h1>
            <p className="text-[12px] text-muted-foreground truncate">Process monthly payroll</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
            <Calculator className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold transition-all duration-300",
              shouldExpand ? "text-xl" : "text-xl"
            )}>
              Payroll Processing
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 truncate",
              shouldExpand ? "text-sm" : "text-base"
            )}>
              Calculate and process monthly payroll for your employees
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
            <Calculator className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        {/* Configuration */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center gap-2 truncate">
              <Calendar className="h-5 w-5 flex-shrink-0" />
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
                <Label>Select Employees</Label>
                <Combobox
                  options={employeeOptions}
                  value=""
                  onValueChange={(value) => {
                    if (value && !selectedEmployees.includes(value)) {
                      setSelectedEmployees([...selectedEmployees, value])
                    }
                  }}
                  placeholder="Add employees..."
                />
              </div>
            </div>
            
            {selectedEmployees.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Employees ({selectedEmployees.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map(employeeId => {
                    const employee = mockEmployees.find(emp => emp.id === employeeId)!
                    return (
                      <Badge key={employeeId} variant="secondary" className="text-sm">
                        {employee.name}
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
              onClick={processPayroll}
              disabled={!selectedMonth || selectedEmployees.length === 0 || isProcessing}
              className="kenya-gradient text-white hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Calculate Payroll'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculations.length > 0 && (
          <>
            <PayrollSummary calculations={calculations} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Employee Calculations</h2>
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
                className="kenya-gradient text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Payroll'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
