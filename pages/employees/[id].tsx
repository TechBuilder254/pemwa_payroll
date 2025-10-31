import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import { calculatePayroll, formatCurrency } from '@/lib/payroll-calculations'

export default function EmployeeDetails() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  const { data: employees } = useEmployees()
  const { data: settings } = usePayrollSettings()
  const employee = useMemo(() => (employees || []).find(e => e.id === id), [employees, id])

  if (!employee || !settings) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee</CardTitle>
            <CardDescription>{!employee ? 'Not found' : 'Loading settings…'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/employees')}>Back to Employees</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calc = calculatePayroll(
    { id: employee.id, basic_salary: employee.basic_salary, helb_amount: employee.helb_amount } as any,
    employee.allowances as any,
    employee.voluntary_deductions as any,
    0,
    0,
    settings as any
  )

  const allowanceEntries = Object.entries(employee.allowances || {})
  const voluntaryEntries = Object.entries(employee.voluntary_deductions || {})

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{employee.name}</span>
              <Button variant="outline" onClick={() => router.push('/employees')}>Back to Employees</Button>
            </CardTitle>
            <CardDescription>{employee.position} • {employee.employee_id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Basic Salary</div>
                <div className="font-semibold">{formatCurrency(calc.basicSalary)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Gross Salary</div>
                <div className="font-semibold text-blue-600">{formatCurrency(calc.grossSalary)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Deductions</div>
                <div className="font-semibold">{formatCurrency(calc.totalDeductions)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Net Salary</div>
                <div className="font-semibold text-green-600">{formatCurrency(calc.netSalary)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowances</CardTitle>
            <CardDescription>Items added to basic salary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {allowanceEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground">No allowances</div>
            ) : allowanceEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{formatCurrency(Number(value) || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2 mt-1">
              <span>Total Allowances</span>
              <span>{formatCurrency(calc.allowancesTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statutory Deductions</CardTitle>
            <CardDescription>Automatically computed from settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span>NSSF (Employee)</span><span className="font-medium">{formatCurrency(calc.nssfEmployee)}</span></div>
            <div className="flex justify-between text-sm"><span>SHIF (Employee)</span><span className="font-medium">{formatCurrency(calc.shifEmployee)}</span></div>
            <div className="flex justify-between text-sm"><span>AHL (Employee)</span><span className="font-medium">{formatCurrency(calc.ahlEmployee)}</span></div>
            <div className="flex justify-between text-sm"><span>HELB</span><span className="font-medium">{formatCurrency(calc.helb)}</span></div>
            <div className="flex justify-between text-sm"><span>PAYE (before relief)</span><span className="font-medium">{formatCurrency(calc.payeBeforeRelief)}</span></div>
            <div className="flex justify-between text-sm"><span>Personal Relief</span><span className="font-medium">{formatCurrency(calc.personalRelief)}</span></div>
            <div className="flex justify-between text-sm"><span>PAYE (after relief)</span><span className="font-medium">{formatCurrency(calc.payeAfterRelief)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-1"><span>Total Deductions</span><span>{formatCurrency(calc.totalDeductions)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voluntary Deductions</CardTitle>
            <CardDescription>Loans, insurance, pension, etc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {voluntaryEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground">No voluntary deductions</div>
            ) : voluntaryEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium">{formatCurrency(Number(value) || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2 mt-1">
              <span>Total Voluntary Deductions</span>
              <span>{formatCurrency(calc.voluntaryDeductionsTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Take-home</CardTitle>
            <CardDescription>Amount to land in the employee account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(calc.netSalary)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


