import { useState } from 'react'
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
  Minus
} from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'
import { generateRemittancePDF } from '@/lib/exports/pdf'
import { generateRemittanceExcel } from '@/lib/exports/excel'

// Mock remittance data
const mockRemittances = [
  {
    month: '2024-12',
    employees: [
      {
        id: '1',
        name: 'John Kamau',
        employee_id: 'EMP001',
        gross_salary: 113000,
        nssf_employee: 4320,
        nssf_employer: 4320,
        shif_employee: 3107.5,
        shif_employer: 3107.5,
        ahl_employee: 1695,
        ahl_employer: 1695,
        paye_after_relief: 23100,
        net_salary: 78777.5,
        total_employer_cost: 124252.5
      },
      {
        id: '2',
        name: 'Mary Wanjiku',
        employee_id: 'EMP002',
        gross_salary: 158000,
        nssf_employee: 4320,
        nssf_employer: 4320,
        shif_employee: 4345,
        shif_employer: 4345,
        ahl_employee: 2370,
        ahl_employer: 2370,
        paye_after_relief: 35100,
        net_salary: 103865,
        total_employer_cost: 173825
      }
    ]
  }
]

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

function RemittanceSummary({ totals, month }: { totals: RemittanceTotals, month: string }) {
  const dueDate = new Date(month + '-09')
  const isOverdue = dueDate < new Date()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Monthly Remittance Summary
        </CardTitle>
        <CardDescription>
          {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Due Date Alert */}
        <div className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <p className={`font-medium ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                {isOverdue ? 'Overdue' : 'Due Soon'}
              </p>
              <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                Remittance due: {dueDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Agency Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NSSF */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                NSSF
              </CardTitle>
              <CardDescription>National Social Security Fund</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employee Contributions</span>
                <span className="font-medium">{formatCurrency(totals.nssfEmployee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employer Contributions</span>
                <span className="font-medium">{formatCurrency(totals.nssfEmployer)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-blue-600">
                <span>Total NSSF</span>
                <span>{formatCurrency(totals.nssfTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* SHIF */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                SHIF
              </CardTitle>
              <CardDescription>Social Health Insurance Fund</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employee Contributions</span>
                <span className="font-medium">{formatCurrency(totals.shifEmployee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employer Contributions</span>
                <span className="font-medium">{formatCurrency(totals.shifEmployer)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-green-600">
                <span>Total SHIF</span>
                <span>{formatCurrency(totals.shifTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* AHL */}
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                AHL
              </CardTitle>
              <CardDescription>Affordable Housing Levy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employee Contributions</span>
                <span className="font-medium">{formatCurrency(totals.ahlEmployee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employer Contributions</span>
                <span className="font-medium">{formatCurrency(totals.ahlEmployer)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-purple-600">
                <span>Total AHL</span>
                <span>{formatCurrency(totals.ahlTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* PAYE */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                PAYE
              </CardTitle>
              <CardDescription>Income Tax</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">PAYE (KRA)</span>
                <span className="font-medium">{formatCurrency(totals.payeTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-orange-600">
                <span>Total</span>
                <span>{formatCurrency(totals.payeTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Totals */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Net Payroll</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totals.totalNetPayroll)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Employer Cost</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(totals.totalEmployerCost)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Government Remittances</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(totals.nssfTotal + totals.shifTotal + totals.ahlTotal + totals.payeTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employees Count</span>
                  <span className="font-semibold">{mockRemittances[0]?.employees.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

function ExpandableEmployeeCard({ employee }: { employee: typeof mockRemittances[0]['employees'][0] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-0">
        {/* Collapsed View - Minimal Details */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="kenya-gradient w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg truncate">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.employee_id}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="font-bold text-primary text-lg">
                {formatCurrency(employee.net_salary)}
              </div>
              <div className="text-xs text-muted-foreground">Net Salary</div>
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
          <div className="border-t bg-muted/20">
            {/* Employee Deductions Section */}
            <div className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-3">Employee Deductions</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Gross Salary</span>
                  <span className="font-semibold text-lg">{formatCurrency(employee.gross_salary)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">PAYE</span>
                  <span className="font-medium">{formatCurrency(employee.paye_after_relief)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">NSSF (Employee)</span>
                  <span className="font-medium">{formatCurrency(employee.nssf_employee)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">SHIF (Employee)</span>
                  <span className="font-medium">{formatCurrency(employee.shif_employee)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">AHL (Employee)</span>
                  <span className="font-medium">{formatCurrency(employee.ahl_employee)}</span>
                </div>
              </div>
            </div>
            
            {/* Employer Contributions Section */}
            <div className="p-4 border-t bg-muted/10">
              <h4 className="font-semibold text-sm text-foreground mb-3">Employer Contributions</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">NSSF (Employer)</span>
                  <span className="font-medium">{formatCurrency(employee.nssf_employer)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">SHIF (Employer)</span>
                  <span className="font-medium">{formatCurrency(employee.shif_employer)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">AHL (Employer)</span>
                  <span className="font-medium">{formatCurrency(employee.ahl_employer)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t pt-3 mt-3">
                  <span className="font-semibold text-sm">Total Employer Cost</span>
                  <span className="font-bold text-lg text-blue-600">{formatCurrency(employee.total_employer_cost)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmployeeRemittanceTable({ employees }: { employees: typeof mockRemittances[0]['employees'] }) {
  return (
    <Card className="overflow-hidden min-w-0">
      <CardHeader className="min-w-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span className="truncate">Employee Breakdown</span>
        </CardTitle>
        <CardDescription className="truncate text-xs">Individual contributions for each employee</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {/* Mobile View - Expandable Cards */}
        <div className="sm:hidden space-y-2">
          {employees.map((employee) => (
            <ExpandableEmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden sm:block rounded-md border min-w-0 overflow-hidden">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"20%"}}>
                  Employee
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  Gross Salary
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  PAYE
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  NSSF (E/E)
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  SHIF (E/E)
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  AHL (E/E)
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground truncate" style={{width:"12%"}}>
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-2 min-w-0" style={{width:"20%"}}>
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="kenya-gradient w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[11px]">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={employee.name}>{employee.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{employee.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-medium truncate" title={formatCurrency(employee.gross_salary)}>{formatCurrency(employee.gross_salary)}</div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-medium truncate" title={formatCurrency(employee.paye_after_relief)}>{formatCurrency(employee.paye_after_relief)}</div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs truncate" title={`${formatCurrency(employee.nssf_employee)} / ${formatCurrency(employee.nssf_employer)}`}>
                      {formatCurrency(employee.nssf_employee)} / {formatCurrency(employee.nssf_employer)}
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs truncate" title={`${formatCurrency(employee.shif_employee)} / ${formatCurrency(employee.shif_employer)}`}>
                      {formatCurrency(employee.shif_employee)} / {formatCurrency(employee.shif_employer)}
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="text-xs truncate" title={`${formatCurrency(employee.ahl_employee)} / ${formatCurrency(employee.ahl_employer)}`}>
                      {formatCurrency(employee.ahl_employee)} / {formatCurrency(employee.ahl_employer)}
                    </div>
                  </td>
                  <td className="p-2 min-w-0" style={{width:"12%"}}>
                    <div className="font-semibold text-primary truncate" title={formatCurrency(employee.net_salary)}>{formatCurrency(employee.net_salary)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RemittancesPage() {
  const [selectedMonth, setSelectedMonth] = useState('2024-12')
  const [isExporting, setIsExporting] = useState(false)

  const currentRemittance = mockRemittances.find(r => r.month === selectedMonth)
  
  const totals: RemittanceTotals = currentRemittance ? {
    nssfEmployee: currentRemittance.employees.reduce((sum, emp) => sum + emp.nssf_employee, 0),
    nssfEmployer: currentRemittance.employees.reduce((sum, emp) => sum + emp.nssf_employer, 0),
    nssfTotal: currentRemittance.employees.reduce((sum, emp) => sum + emp.nssf_employee + emp.nssf_employer, 0),
    shifEmployee: currentRemittance.employees.reduce((sum, emp) => sum + emp.shif_employee, 0),
    shifEmployer: currentRemittance.employees.reduce((sum, emp) => sum + emp.shif_employer, 0),
    shifTotal: currentRemittance.employees.reduce((sum, emp) => sum + emp.shif_employee + emp.shif_employer, 0),
    ahlEmployee: currentRemittance.employees.reduce((sum, emp) => sum + emp.ahl_employee, 0),
    ahlEmployer: currentRemittance.employees.reduce((sum, emp) => sum + emp.ahl_employer, 0),
    ahlTotal: currentRemittance.employees.reduce((sum, emp) => sum + emp.ahl_employee + emp.ahl_employer, 0),
    payeTotal: currentRemittance.employees.reduce((sum, emp) => sum + emp.paye_after_relief, 0),
    totalNetPayroll: currentRemittance.employees.reduce((sum, emp) => sum + emp.net_salary, 0),
    totalEmployerCost: currentRemittance.employees.reduce((sum, emp) => sum + emp.total_employer_cost, 0)
  } : {
    nssfEmployee: 0, nssfEmployer: 0, nssfTotal: 0,
    shifEmployee: 0, shifEmployer: 0, shifTotal: 0,
    ahlEmployee: 0, ahlEmployer: 0, ahlTotal: 0,
    payeTotal: 0,
    totalNetPayroll: 0, totalEmployerCost: 0
  }

  const totalGovernmentRemittances = totals.nssfTotal + totals.shifTotal + totals.ahlTotal + totals.payeTotal
  const totalEmployerRemittances = totals.nssfEmployer + totals.shifEmployer + totals.ahlEmployer // Employer portion only
  const totalEmployeeRemittances = totals.nssfEmployee + totals.shifEmployee + totals.ahlEmployee + totals.payeTotal // Employee portion only

  const handleExportPDF = async () => {
    if (!currentRemittance) return
    setIsExporting(true)
    const data = {
      month: selectedMonth,
      employees: currentRemittance.employees.map((e) => ({
        employee: { name: e.name, employee_id: e.employee_id },
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
        paye_after_relief: e.paye_after_relief,
        total_deductions: 0,
        net_salary: e.net_salary,
        total_employer_cost: e.total_employer_cost,
      })),
      totals,
    }
    generateRemittancePDF(data)
    setIsExporting(false)
  }

  const handleExportExcel = async () => {
    if (!currentRemittance) return
    setIsExporting(true)
    const data = {
      month: selectedMonth,
      employees: currentRemittance.employees.map((e) => ({
        employee: { name: e.name, employee_id: e.employee_id },
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
        paye_after_relief: e.paye_after_relief,
        total_deductions: 0,
        net_salary: e.net_salary,
        total_employer_cost: e.total_employer_cost,
      })),
      totals,
    }
    generateRemittanceExcel(data)
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Prominent Government Remittances Summary */}
        {currentRemittance && (
          <Card className="border-2 border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between min-w-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <span>Total Government Remittances</span>
                  </CardTitle>
                  <CardDescription className="text-[12px]">
                    Amount you owe to the government before paying employees
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end ml-4">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">
                    {formatCurrency(totalGovernmentRemittances)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(selectedMonth + '-09').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Employer Portion</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(totalEmployerRemittances)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    NSSF: {formatCurrency(totals.nssfEmployer)} • SHIF: {formatCurrency(totals.shifEmployer)} • AHL: {formatCurrency(totals.ahlEmployer)}
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Employee Portion (Deducted)</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(totalEmployeeRemittances)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    NSSF: {formatCurrency(totals.nssfEmployee)} • SHIF: {formatCurrency(totals.shifEmployee)} • AHL: {formatCurrency(totals.ahlEmployee)} • PAYE: {formatCurrency(totals.payeTotal)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Download PDF Breakdown'}
                </Button>
                <Button 
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="kenya-gradient text-white hover:opacity-90 flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Download Excel Breakdown'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Month
            </CardTitle>
            <CardDescription>Choose the month for remittance summary</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Remittance Summary */}
        {currentRemittance ? (
          <>
            <RemittanceSummary totals={totals} month={selectedMonth} />
            <EmployeeRemittanceTable employees={currentRemittance.employees} />
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No remittance data found</h3>
              <p className="text-muted-foreground mb-4">
                No payroll data available for the selected month
              </p>
              <Button className="kenya-gradient text-white hover:opacity-90">
                <Calendar className="h-4 w-4 mr-2" />
                Run Payroll
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
