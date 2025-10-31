import { useMemo, useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { formatCurrency, calculatePayroll } from '@/lib/payroll-calculations'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import { generateP9PDF } from '@/lib/exports/pdf'
import { generateP9Excel } from '@/lib/exports/excel'

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
  status: 'completed' | 'pending'
  created_at: string
}

function P9Card({ p9Form, onView }: { p9Form: P9Shape, onView: (p: P9Shape) => void }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {p9Form.employee_name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{p9Form.employee_name}</CardTitle>
              <CardDescription className="text-sm">
                {p9Form.employee_id} • {p9Form.year}
              </CardDescription>
            </div>
          </div>
          <Badge variant={p9Form.status === 'completed' ? 'success' : 'secondary'} className="text-xs">
            {p9Form.status === 'completed' ? 'Completed' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Salary</span>
            <span className="font-medium">{formatCurrency(p9Form.gross_salary_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PAYE</span>
            <span className="font-medium text-red-600">{formatCurrency(p9Form.paye_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NSSF</span>
            <span className="text-xs">{formatCurrency(p9Form.nssf_employee_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SHIF</span>
            <span className="text-xs">{formatCurrency(p9Form.shif_employee_total)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView(p9Form)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function P9Table({ data, onView }: { data: P9Shape[]; onView: (p: P9Shape) => void }) {
  return (
    <Card className="hidden sm:block">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          P9 Forms
        </CardTitle>
        <CardDescription>Annual tax summaries for KRA submission</CardDescription>
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
                  Year
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Gross Salary
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  PAYE
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
              {data.map((p9Form) => (
                <tr key={p9Form.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {p9Form.employee_name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{p9Form.employee_name}</div>
                        <div className="text-sm text-muted-foreground">{p9Form.employee_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{p9Form.year}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{formatCurrency(p9Form.gross_salary_total)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-primary">{formatCurrency(p9Form.paye_total)}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={p9Form.status === 'completed' ? 'success' : 'secondary'} className="text-xs">
                      {p9Form.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onView(p9Form)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
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

function P9Viewer({ p9Form }: { p9Form: P9Shape }) {
  const renderAnnualWithBreakdown = (total: number) => {
    const months = 12
    const monthly = total / months
    return (
      <div className="flex items-baseline gap-2">
        <span>{formatCurrency(total)}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          ({formatCurrency(monthly)} × {months})
        </span>
      </div>
    )
  }
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="kenya-gradient w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <CardTitle className="text-2xl">PEMWA PAYROLL SYSTEM</CardTitle>
        <CardDescription className="text-lg">P9 Form - Annual Tax Summary</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="text-left">
            <p className="font-medium">{p9Form.employee_name}</p>
            <p className="text-sm text-muted-foreground">{p9Form.employee_id}</p>
            <p className="text-sm text-muted-foreground">KRA PIN: {p9Form.kra_pin}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Tax Year {p9Form.year}</p>
            <p className="text-sm text-muted-foreground">Annual Summary</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Employee Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee Name</span>
                <span className="font-medium">{p9Form.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-medium">{p9Form.employee_id}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">KRA PIN</span>
                <span className="font-medium">{p9Form.kra_pin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Year</span>
                <span className="font-medium">{p9Form.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Annual Earnings */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Annual Earnings
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              {renderAnnualWithBreakdown(p9Form.basic_salary_total)}
            </div>
            <div className="flex justify-between">
              <span>Allowances</span>
              {renderAnnualWithBreakdown(p9Form.allowances_total)}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Gross Salary</span>
              {renderAnnualWithBreakdown(p9Form.gross_salary_total)}
            </div>
          </div>
        </div>

        {/* Annual Deductions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Annual Deductions
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>NSSF (Employee)</span>
              {renderAnnualWithBreakdown(p9Form.nssf_employee_total)}
            </div>
            <div className="flex justify-between">
              <span>SHIF (Employee)</span>
              {renderAnnualWithBreakdown(p9Form.shif_employee_total)}
            </div>
            <div className="flex justify-between">
              <span>AHL (Employee)</span>
              {renderAnnualWithBreakdown(p9Form.ahl_employee_total)}
            </div>
            <div className="flex justify-between">
              <span>PAYE</span>
              {renderAnnualWithBreakdown(p9Form.paye_total)}
            </div>
            {p9Form.helb_total > 0 && (
              <div className="flex justify-between">
                <span>HELB</span>
                {renderAnnualWithBreakdown(p9Form.helb_total)}
              </div>
            )}
            {p9Form.voluntary_deductions_total > 0 && (
              <div className="flex justify-between">
                <span>Voluntary Deductions</span>
                {renderAnnualWithBreakdown(p9Form.voluntary_deductions_total)}
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg text-red-600">
              <span>Total Deductions</span>
              <span>{formatCurrency(
                p9Form.nssf_employee_total + 
                p9Form.shif_employee_total + 
                p9Form.ahl_employee_total + 
                p9Form.paye_total + 
                p9Form.helb_total + 
                p9Form.voluntary_deductions_total
              )}</span>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Net Salary</h3>
              <p className="text-sm text-muted-foreground">Total amount paid to employee</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(p9Form.net_salary_total)}
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
              {renderAnnualWithBreakdown(p9Form.nssf_employer_total)}
            </div>
            <div className="flex justify-between">
              <span>SHIF (Employer)</span>
              {renderAnnualWithBreakdown(p9Form.shif_employer_total)}
            </div>
            <div className="flex justify-between">
              <span>AHL (Employer)</span>
              {renderAnnualWithBreakdown(p9Form.ahl_employer_total)}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Employer Cost</span>
              <span>{formatCurrency(p9Form.total_employer_cost)}</span>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">KRA Compliance</h3>
          </div>
          <p className="text-sm text-green-700">
            This P9 form is ready for submission to KRA. All statutory deductions have been calculated 
            according to current tax regulations for {p9Form.year}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function P9Page() {
  const [searchTerm, setSearchTerm] = useState('')
  const currentYear = String(new Date().getFullYear())
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: settings, isLoading: isSettingsLoading } = usePayrollSettings()
  const [viewingP9, setViewingP9] = useState<P9Shape | null>(null)

  const p9Forms = useMemo<P9Shape[]>(() => {
    if (!employees || !settings) return []
    return employees.map((emp) => {
      const calc = calculatePayroll(
        { id: emp.id, basic_salary: emp.basic_salary, helb_amount: emp.helb_amount } as any,
        emp.allowances as any,
        emp.voluntary_deductions as any,
        0,
        0,
        settings as any
      )
      const months = 12
      return {
        id: emp.id,
        employee_id: emp.employee_id,
        employee_name: emp.name,
        kra_pin: emp.kra_pin,
        year: Number(selectedYear),
        gross_salary_total: calc.grossSalary * months,
        basic_salary_total: emp.basic_salary * months,
        allowances_total: (calc.allowancesTotal ?? (calc.grossSalary - emp.basic_salary)) * months,
        nssf_employee_total: calc.nssfEmployee * months,
        nssf_employer_total: calc.nssfEmployer * months,
        shif_employee_total: calc.shifEmployee * months,
        shif_employer_total: calc.shifEmployer * months,
        ahl_employee_total: calc.ahlEmployee * months,
        ahl_employer_total: calc.ahlEmployer * months,
        helb_total: (emp.helb_amount || 0) * months,
        voluntary_deductions_total: (calc.voluntaryDeductionsTotal || 0) * months,
        paye_total: calc.payeAfterRelief * months,
        net_salary_total: calc.netSalary * months,
        total_employer_cost: calc.totalEmployerCost * months,
        status: 'completed',
        created_at: new Date(Number(selectedYear), 11, 31).toISOString(),
      }
    })
  }, [employees, settings, selectedYear])

  const employeeOptions = useMemo(() => {
    if (!employees) return [] as { value: string; label: string }[]
    return employees.map((e) => ({ value: e.employee_id, label: e.name }))
  }, [employees])

  // Years available based on earliest employee created_at (fallback: current year)
  const earliestYear = useMemo(() => {
    if (!employees || employees.length === 0) return Number(currentYear)
    const min = Math.min(
      ...employees
        .map((e) => new Date(e.created_at).getFullYear())
        .filter((y) => Number.isFinite(y))
    )
    return Math.min(new Date().getFullYear(), min) || Number(currentYear)
  }, [employees])

  const yearOptions = useMemo(() => {
    const end = new Date().getFullYear()
    const start = earliestYear
    const years: string[] = []
    for (let y = end; y >= start; y--) years.push(String(y))
    return years
  }, [earliestYear])

  const filteredP9Forms = p9Forms.filter(p9Form => {
    const matchesYear = p9Form.year.toString() === selectedYear
    const matchesEmployee = selectedEmployee
      ? (p9Form.employee_id === selectedEmployee || p9Form.employee_name === selectedEmployee)
      : true
    const matchesSearch = selectedEmployee
      ? true
      : (p9Form.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p9Form.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesYear && matchesEmployee && matchesSearch
  })

  if (viewingP9) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setViewingP9(null)}
              className="flex items-center gap-2"
            >
              ← Back to P9 Forms
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
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
              }}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button className="kenya-gradient text-white hover:opacity-90" onClick={() => {
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
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          <P9Viewer p9Form={viewingP9} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">P9 Forms</h1>
            <p className="text-[12px] text-muted-foreground">Annual tax summaries</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block px-6 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">P9 Forms</h1>
            <p className="text-[12px] text-muted-foreground">Annual tax summaries for KRA submission</p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter P9 Forms
            </CardTitle>
            <CardDescription>Search and filter P9 forms by employee and year</CardDescription>
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
                <Label>Tax Year</Label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
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
                {filteredP9Forms.length} P9 forms found
              </Badge>
              <Badge variant="outline" className="text-sm">
                Total PAYE: {formatCurrency(filteredP9Forms.reduce((sum, p) => sum + p.paye_total, 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {filteredP9Forms.map((p9Form) => (
            <P9Card key={p9Form.id} p9Form={p9Form} onView={(p) => setViewingP9(p)} />
          ))}
        </div>

        {/* Desktop Table */}
        <P9Table data={filteredP9Forms} onView={(p) => setViewingP9(p)} />

        {/* Empty State */}
        {filteredP9Forms.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No P9 forms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedYear !== '2024' || selectedEmployee 
                  ? 'Try adjusting your search criteria' 
                  : 'No P9 forms have been generated yet'}
              </p>
              <Button className="kenya-gradient text-white hover:opacity-90">
                <Calendar className="h-4 w-4 mr-2" />
                Generate P9 Forms
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KRA Compliance Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              KRA Submission Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="space-y-2 text-sm">
              <li>• P9 forms must be submitted to KRA by January 31st of the following year</li>
              <li>• Ensure all employee information matches KRA records</li>
              <li>• Verify PAYE calculations against KRA tax brackets</li>
              <li>• Keep copies of all submitted P9 forms for audit purposes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
