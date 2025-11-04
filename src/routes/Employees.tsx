import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Eye,
  Building2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { formatCurrency, calculatePayroll } from '@/lib/payroll-calculations'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { deleteEmployee } from '@/lib/api'
import type { Employee } from '@/lib/supabase'
import EmployeeTable from '@/components/employees/EmployeeTable'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function EmployeeCard({ 
  employee, 
  settings, 
  onEdit, 
  onDelete 
}: { 
  employee: any
  settings: any
  onEdit: (employee: any) => void
  onDelete: (employee: any) => void
}) {
  const { shouldExpand } = useSidebar()
  const [showCalculations, setShowCalculations] = useState(false)

  const totalAllowances: number = Object.values(employee.allowances as Record<string, number | undefined>).reduce(
    (sum: number, amount: number | undefined) => sum + (amount || 0),
    0
  )
  const totalVoluntaryDeductions: number = Object.values(employee.voluntary_deductions as Record<string, number | undefined>).reduce(
    (sum: number, amount: number | undefined) => sum + (amount || 0),
    0
  )
  const grossSalary: number = employee.basic_salary + totalAllowances

  const calculation = calculatePayroll(
    {
      id: employee.id,
      basic_salary: employee.basic_salary,
      helb_amount: employee.helb_amount,
    } as any,
    employee.allowances as any,
    employee.voluntary_deductions as any,
    0,
    0,
    settings as any
  )

  return (
    <Card className={cn(
      'hover:shadow-md transition-all duration-200 group overflow-hidden min-w-0',
      shouldExpand ? 'sm:p-3' : 'sm:p-4'
    )}>
      <CardHeader className="pb-3 min-w-0">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="kenya-gradient w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {employee.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className={cn(
                'transition-all duration-300 truncate',
                shouldExpand ? 'sm:text-base' : 'sm:text-lg'
              )} title={employee.name}>{employee.name}</CardTitle>
              <CardDescription className={cn(
                'transition-all duration-300 truncate',
                shouldExpand ? 'sm:text-xs' : 'sm:text-sm'
              )} title={`${employee.position} • ${employee.employee_id}`}>
                {employee.position} • {employee.employee_id}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 min-w-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center min-w-0">
            <span className="text-sm text-muted-foreground truncate">Basic Salary</span>
            <span className="font-medium truncate ml-2" title={formatCurrency(employee.basic_salary)}>{formatCurrency(employee.basic_salary)}</span>
          </div>
          <div className="flex justify-between items-center min-w-0">
            <span className="text-sm text-muted-foreground truncate">Allowances</span>
            <span className="font-medium truncate ml-2" title={formatCurrency(totalAllowances)}>{formatCurrency(totalAllowances)}</span>
          </div>
          <div className="flex justify-between items-center min-w-0">
            <span className="text-sm text-muted-foreground truncate">Gross Salary</span>
            <span className="font-semibold text-primary truncate ml-2" title={formatCurrency(grossSalary)}>{formatCurrency(grossSalary)}</span>
          </div>

          <div className="flex justify-between items-center min-w-0 pt-1 border-t">
            <span className="text-sm font-medium truncate">Net Salary</span>
            <span className="font-bold text-green-600 truncate ml-2" title={formatCurrency(calculation.netSalary)}>{formatCurrency(calculation.netSalary)}</span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2 text-xs"
            onClick={() => setShowCalculations(!showCalculations)}
          >
            <Calculator className="h-3.5 w-3.5 mr-1" />
            {showCalculations ? 'Hide' : 'Show'} Calculations
            {showCalculations ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
          </Button>

          {showCalculations && (
            <div className="pt-3 mt-3 border-t space-y-2 bg-muted/30 rounded-lg p-3">
              <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                Payroll Breakdown
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground">Statutory Deductions:</div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>NSSF (Employee)</span>
                  <span className="font-medium">{formatCurrency(calculation.nssfEmployee)}</span>
                </div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>SHIF (Employee)</span>
                  <span className="font-medium">{formatCurrency(calculation.shifEmployee)}</span>
                </div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>AHL (Employee)</span>
                  <span className="font-medium">{formatCurrency(calculation.ahlEmployee)}</span>
                </div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>PAYE</span>
                  <span className="font-medium">{formatCurrency(calculation.payeAfterRelief)}</span>
                </div>
                {calculation.helb > 0 && (
                  <div className="flex justify-between text-[11px] pl-2">
                    <span>HELB</span>
                    <span className="font-medium">{formatCurrency(calculation.helb)}</span>
                  </div>
                )}
                {calculation.voluntaryDeductionsTotal > 0 && (
                  <div className="flex justify-between text-[11px] pl-2">
                    <span>Voluntary Deductions</span>
                    <span className="font-medium">{formatCurrency(calculation.voluntaryDeductionsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-semibold pt-1 border-t mt-1">
                  <span>Total Deductions</span>
                  <span className="text-red-600">{formatCurrency(calculation.totalDeductions)}</span>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t mt-2">
                <div className="text-[11px] font-medium text-muted-foreground">Employer Contributions:</div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>NSSF (Employer)</span>
                  <span className="font-medium">{formatCurrency(calculation.nssfEmployer)}</span>
                </div>
                <div className="flex justify-between text-[11px] pl-2 italic text-muted-foreground">
                  <span>SHIF (Employer)</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex justify-between text-[11px] pl-2">
                  <span>AHL (Employer)</span>
                  <span className="font-medium">{formatCurrency(calculation.ahlEmployer)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold pt-1 border-t mt-1">
                  <span>Total Employer Cost</span>
                  <span className="text-blue-600">{formatCurrency(calculation.totalEmployerCost)}</span>
                </div>
              </div>
            </div>
          )}

          {(employee.helb_amount > 0 || totalVoluntaryDeductions > 0) && (
            <div className="pt-2 border-t">
              {employee.helb_amount > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">HELB</span>
                  <span className="text-xs">{formatCurrency(employee.helb_amount)}</span>
                </div>
              )}
              {totalVoluntaryDeductions > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Voluntary Deductions</span>
                  <span className="text-xs">{formatCurrency(totalVoluntaryDeductions)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onEdit(employee)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={() => onDelete(employee)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmployeesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const Employees: React.FC = () => {
  const navigate = useNavigate()
  const { shouldExpand } = useSidebar()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: employees, isLoading: isEmployeesLoading } = useEmployees()
  const { data: settings, isLoading: isSettingsLoading } = usePayrollSettings()

  const isLoading = isEmployeesLoading || isSettingsLoading

  const filteredEmployees = useMemo(() => {
    const list = employees ?? []
    return list.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, searchTerm])

  const handleDeleteClick = (employee: any) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    
    setIsDeleting(true)
    const employeeIdToDelete = String(employeeToDelete.id) // Ensure string comparison
    const employeeName = employeeToDelete.name
    
    // Optimistically remove from cache immediately for instant UI update
    queryClient.setQueryData<Employee[]>(['employees'], (oldData) => {
      if (!oldData) return oldData
      const filtered = oldData.filter(emp => String(emp.id) !== employeeIdToDelete)
      console.log('[delete] Optimistic update - removed employee:', employeeIdToDelete, 'from', oldData.length, 'to', filtered.length)
      return filtered
    })
    
    // Close dialog immediately for better UX
    setDeleteDialogOpen(false)
    const employeeToDeleteBackup = employeeToDelete
    setEmployeeToDelete(null)
    
    try {
      // Perform the actual deletion
      await deleteEmployee(employeeIdToDelete)
      
      // Show success toast immediately
      toast({ 
        title: 'Employee deleted', 
        description: `${employeeName} has been removed successfully.`,
        className: 'bg-green-600 text-white border-green-700'
      })
      
      // Don't invalidate immediately - keep the optimistic update visible
      // Only refetch after a delay to sync with server, ensuring server has processed deletion
      setTimeout(() => {
        // Update cache with fresh data from server
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        
        // Refetch to sync with server
        queryClient.refetchQueries({ 
          queryKey: ['employees'],
          type: 'active',
        }).catch(() => {
          // Silently fail if component unmounted or query inactive
        })
        queryClient.refetchQueries({ 
          queryKey: ['dashboard-stats'],
          type: 'active',
        }).catch(() => {
          // Silently fail if component unmounted or query inactive
        })
      }, 1500)
      
    } catch (err: any) {
      // Rollback on error - restore the employee to the list
      queryClient.setQueryData<Employee[]>(['employees'], (oldData) => {
        if (!oldData) return oldData
        // Check if employee is already in the list
        const exists = oldData.some(emp => String(emp.id) === employeeIdToDelete)
        if (!exists && employeeToDeleteBackup) {
          return [...oldData, employeeToDeleteBackup]
        }
        return oldData
      })
      
      // Invalidate to force refetch of correct data
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      await queryClient.refetchQueries({ queryKey: ['employees'] })
      
      toast({ 
        title: 'Delete failed', 
        description: err?.message || 'Could not delete employee. Please try again.', 
        variant: 'destructive' 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <div className={cn(
        'w-full min-w-0 space-y-6 transition-all duration-300',
        'p-4 sm:p-6',
        shouldExpand ? 'sm:px-4' : 'sm:px-6'
      )}>
        <div className="flex items-center justify-between min-w-0 mb-2 sm:mb-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold truncate">Employees</h2>
            <p className="text-[12px] text-muted-foreground truncate">Manage your team</p>
          </div>
          <Button 
            className="kenya-gradient text-white hover:opacity-90 flex-shrink-0 ml-4"
            size="sm"
            onClick={() => navigate('/employees/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              {filteredEmployees.length} employees
            </Badge>
            <Badge variant="outline" className="text-sm">
              Total: {formatCurrency((employees ?? []).reduce((sum, emp) => {
                const allowances = Object.values(emp.allowances).reduce((a, b) => a + (b || 0), 0)
                return sum + emp.basic_salary + allowances
              }, 0))}
            </Badge>
          </div>
        </div>

        <div className={cn(
          'sm:hidden space-y-4',
          shouldExpand ? 'sm:space-y-3' : 'sm:space-y-4'
        )}>
          {isLoading ? (
            <EmployeesSkeleton />
          ) : (
            filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                settings={settings}
                onEdit={(e) => navigate(`/employees/${e.id}`)}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </div>

        {settings && (
          <EmployeeTable 
            employees={filteredEmployees as any}
            onView={(e: any) => navigate(`/employees/${e.id}`)}
            onEdit={(e: any) => navigate(`/employees/${e.id}`)}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <AlertDialogTitle className="text-xl font-semibold">
                    Delete Employee?
                  </AlertDialogTitle>
                </div>
              </div>
              <AlertDialogDescription className="text-base pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">{employeeToDelete?.name}</span> ({employeeToDelete?.employee_id})?
                <br />
                <span className="text-sm text-destructive font-medium mt-2 block">
                  This action cannot be undone.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-row sm:justify-end gap-2 mt-4">
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {filteredEmployees.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
              </p>
              <Button 
                className="kenya-gradient text-white hover:opacity-90"
                onClick={() => navigate('/employees/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Employees



