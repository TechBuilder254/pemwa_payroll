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
  FileText, 
  Download, 
  Search, 
  Calendar,
  User,
  Building2,
  DollarSign,
  Calculator,
  Eye,
  Filter
} from 'lucide-react'
import { formatCurrency, calculatePayroll } from '@/lib/payroll-calculations'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
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
    <Card className="hover:shadow-md transition-all duration-200 overflow-hidden min-w-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {payslip.employee_name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{payslip.employee_name}</CardTitle>
              <CardDescription className="text-sm">
                {payslip.employee_id} • {new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" className="text-xs">
            {formatCurrency(payslip.net_salary)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Salary</span>
            <span className="font-medium">{formatCurrency(payslip.gross_salary)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Deductions</span>
            <span className="font-medium text-red-600">{formatCurrency(payslip.total_deductions)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PAYE</span>
            <span className="text-xs">{formatCurrency(payslip.paye_after_relief)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NSSF</span>
            <span className="text-xs">{formatCurrency(payslip.nssf_employee)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView(payslip)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onExportPDF(payslip)}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onExportExcel(payslip)}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PayslipTable({ data, onView, onExportPDF, onExportExcel }: { data: PayslipShape[]; onView: (p: PayslipShape) => void, onExportPDF: (p: PayslipShape) => void, onExportExcel: (p: PayslipShape) => void }) {
  return (
    <Card className="hidden sm:block overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Payslips
        </CardTitle>
        <CardDescription>Employee payslips for selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Employee
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Period
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Gross Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Net Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((payslip) => (
                <tr key={payslip.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {payslip.employee_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{payslip.employee_name}</div>
                        <div className="text-sm text-muted-foreground">{payslip.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{formatCurrency(payslip.gross_salary)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-primary">{formatCurrency(payslip.net_salary)}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant="success" className="text-xs">Generated</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onView(payslip)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onExportPDF(payslip)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onExportExcel(payslip)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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

function PayslipViewer({ payslip }: { payslip: typeof mockPayslips[0] }) {
  return (
    <Card className="max-w-4xl mx-auto overflow-hidden min-w-0 w-full">
      <CardHeader className="text-center border-b">
        <div className="kenya-gradient w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <CardTitle className="text-2xl">PEMWA PAYROLL SYSTEM</CardTitle>
        <CardDescription className="text-lg">Monthly Payslip</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="text-left">
            <p className="font-medium">{payslip.employee_name}</p>
            <p className="text-sm text-muted-foreground">{payslip.employee_id}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm text-muted-foreground">Pay Period</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Earnings */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span>{formatCurrency(payslip.basic_salary)}</span>
            </div>
            <div className="flex justify-between">
              <span>Allowances</span>
              <span>{formatCurrency(payslip.allowances_total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime</span>
              <span>{formatCurrency(payslip.overtime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonuses</span>
              <span>{formatCurrency(payslip.bonuses)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Gross Salary</span>
              <span>{formatCurrency(payslip.gross_salary)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Deductions
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>NSSF (Employee)</span>
              <span>{formatCurrency(payslip.nssf_employee)}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIF (Employee)</span>
              <span>{formatCurrency(payslip.shif_employee)}</span>
            </div>
            <div className="flex justify-between">
              <span>AHL (Employee)</span>
              <span>{formatCurrency(payslip.ahl_employee)}</span>
            </div>
            <div className="flex justify-between">
              <span>PAYE</span>
              <span>{formatCurrency(payslip.paye_after_relief)}</span>
            </div>
            {payslip.helb > 0 && (
              <div className="flex justify-between">
                <span>HELB</span>
                <span>{formatCurrency(payslip.helb)}</span>
              </div>
            )}
            {payslip.voluntary_deductions_total > 0 && (
              <div className="flex justify-between">
                <span>Voluntary Deductions</span>
                <span>{formatCurrency(payslip.voluntary_deductions_total)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg text-red-600">
              <span>Total Deductions</span>
              <span>{formatCurrency(payslip.total_deductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Net Salary</h3>
              <p className="text-sm text-muted-foreground">Amount to be paid</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(payslip.net_salary)}
              </div>
            </div>
          </div>
        </div>

        {/* Employer Contributions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Employer Contributions
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>NSSF (Employer)</span>
              <span>{formatCurrency(payslip.nssf_employer)}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIF (Employer)</span>
              <span>{formatCurrency(payslip.shif_employer)}</span>
            </div>
            <div className="flex justify-between">
              <span>AHL (Employer)</span>
              <span>{formatCurrency(payslip.ahl_employer)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Employer Cost</span>
              <span>{formatCurrency(payslip.total_employer_cost)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PayslipsPage() {
  const { shouldExpand } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: settings, isLoading: isSettingsLoading } = usePayrollSettings()
  const [viewingPayslip, setViewingPayslip] = useState<PayslipShape | null>(null)

  const payslips = useMemo<PayslipShape[]>(() => {
    if (!employees || !settings) return []
    const month = selectedMonth || new Date().toISOString().slice(0, 7)
    return employees.map((emp) => {
      const calc = calculatePayroll(
        { id: emp.id, basic_salary: emp.basic_salary, helb_amount: emp.helb_amount } as any,
        emp.allowances as any,
        emp.voluntary_deductions as any,
        0,
        0,
        settings as any
      )
      return {
        id: emp.id,
        employee_id: emp.employee_id,
        employee_name: emp.name,
        month,
        gross_salary: calc.grossSalary,
        basic_salary: emp.basic_salary,
        allowances_total: calc.allowancesTotal,
        overtime: calc.overtime,
        bonuses: calc.bonuses,
        nssf_employee: calc.nssfEmployee,
        nssf_employer: calc.nssfEmployer,
        shif_employee: calc.shifEmployee,
        shif_employer: calc.shifEmployer,
        ahl_employee: calc.ahlEmployee,
        ahl_employer: calc.ahlEmployer,
        helb: calc.helb,
        voluntary_deductions_total: calc.voluntaryDeductionsTotal,
        paye_before_relief: calc.payeBeforeRelief,
        personal_relief: calc.personalRelief,
        paye_after_relief: calc.payeAfterRelief,
        total_deductions: calc.totalDeductions,
        net_salary: calc.netSalary,
        total_employer_cost: calc.totalEmployerCost,
        created_at: new Date().toISOString(),
      }
    })
  }, [employees, settings, selectedMonth])

  const employeeOptions = payslips.map(payslip => ({
    value: payslip.employee_id,
    label: payslip.employee_name
  }))

  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payslip.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = !selectedMonth || payslip.month === selectedMonth
    const matchesEmployee = !selectedEmployee || payslip.employee_id === selectedEmployee
    
    return matchesSearch && matchesMonth && matchesEmployee
  })

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
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Payslips</h1>
            <p className="text-[12px] text-muted-foreground truncate">View employee payslips</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
            <FileText className="h-5 w-5 text-white" />
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
              Payslips
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 truncate",
              shouldExpand ? "text-sm" : "text-base"
            )}>
              View and export employee payslips
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Payslips
            </CardTitle>
            <CardDescription>Search and filter payslips by employee and period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Label>Payroll Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Employee</Label>
                <Combobox
                  options={employeeOptions}
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                  placeholder="Select employee..."
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredPayslips.length} payslips found
              </Badge>
              <Badge variant="outline" className="text-sm">
                Total: {formatCurrency(filteredPayslips.reduce((sum, p) => sum + p.net_salary, 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {filteredPayslips.map((payslip) => (
            <PayslipCard 
              key={payslip.id} 
              payslip={payslip}
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
          ))}
        </div>

        {/* Desktop Table */}
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

        {/* Empty State */}
        {filteredPayslips.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payslips found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedMonth || selectedEmployee 
                  ? 'Try adjusting your search criteria' 
                  : 'No payslips have been generated yet'}
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
