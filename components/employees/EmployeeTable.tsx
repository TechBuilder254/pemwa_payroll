import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'

export interface EmployeeLite {
  id: string
  name: string
  employee_id: string
  position: string
  basic_salary: number
  allowances: Record<string, number | undefined>
  helb_amount: number
  voluntary_deductions: Record<string, number | undefined>
}

export function EmployeeTable({ employees, onView, onEdit, onDelete }: { employees: EmployeeLite[]; onView: (e: EmployeeLite) => void, onEdit: (e: EmployeeLite) => void, onDelete: (e: EmployeeLite) => void }) {
  const { shouldExpand } = useSidebar()

  return (
    <Card className={cn(
      'hidden sm:block transition-all duration-300 overflow-hidden min-w-0',
      shouldExpand ? 'sm:p-4' : 'sm:p-6'
    )}>
      <CardHeader className="min-w-0">
        <CardTitle className="flex items-center gap-2 truncate">
          <Users className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">All Employees</span>
        </CardTitle>
        <CardDescription className="truncate">Manage your team members</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full min-w-0">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">#</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Position</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Basic Salary</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Gross Salary</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => {
                const totalAllowances = Object.values(employee.allowances).reduce((sum: number, amount: any) => sum + (amount || 0), 0)
                const grossSalary = employee.basic_salary + totalAllowances

                return (
                  <tr key={employee.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground w-6 inline-block">{index + 1}</span>
                    </td>
                    <td className="p-4 min-w-0">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="kenya-gradient w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {employee.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate" title={employee.name}>
                            {employee.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">{employee.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 min-w-0">
                      <div className="text-sm truncate" title={employee.position}>
                        {employee.position}
                      </div>
                    </td>
                    <td className="p-4 min-w-0">
                      <div className="font-medium truncate" title={formatCurrency(employee.basic_salary)}>
                        {formatCurrency(employee.basic_salary)}
                      </div>
                    </td>
                    <td className="p-4 min-w-0">
                      <div className="font-semibold text-primary truncate" title={formatCurrency(grossSalary)}>
                        {formatCurrency(grossSalary)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onView(employee)} aria-label="View employee">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(employee)} aria-label="Edit employee">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(employee)} aria-label="Delete employee">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default EmployeeTable


