// @ts-nocheck
import { useMemo, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import Link from 'next/link'
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
  Users,
  Building2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/payroll-calculations'
import { useEmployees } from '@/hooks/useEmployees'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

// Data now comes from API hooks; this file no longer holds mock data

// Defer loading of the heavy desktop table for faster first paint
const EmployeesTableDynamic = dynamic(
  () => import('@/components/employees/EmployeeTable'),
  {
    ssr: false,
    loading: () => (
      <Card className="hidden sm:block">
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Loading table…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]" />
        </CardContent>
      </Card>
    )
  }
)

function EmployeeCard({ employee, onView, onEdit, onDelete }: { 
  employee: any
  onView: (e: any) => void
  onEdit: (e: any) => void
  onDelete: (e: any) => void
}) {
  const { shouldExpand } = useSidebar()
  
  const totalAllowances: number = Object.values(employee.allowances as Record<string, number | undefined>).reduce(
    (sum: number, amount: number | undefined) => sum + (amount || 0),
    0
  )
  const grossSalary: number = employee.basic_salary + totalAllowances

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "hover:shadow-lg transition-all duration-200 group overflow-hidden min-w-0 border-2",
        shouldExpand ? "sm:p-3" : "sm:p-4"
      )}>
        <CardHeader className="pb-3 min-w-0 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-start justify-between min-w-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-base">
                  {employee.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className={cn(
                  "transition-all duration-300 truncate text-slate-900 dark:text-foreground",
                  shouldExpand ? "sm:text-base" : "sm:text-lg"
                )} title={employee.name}>{employee.name}</CardTitle>
                <CardDescription className={cn(
                  "transition-all duration-300 truncate",
                  shouldExpand ? "sm:text-xs" : "sm:text-sm"
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

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(employee)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(employee)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}

// (moved EmployeeTable to components/employees/EmployeeTable and dynamically imported above)

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

export default function Employees() {
  const router = useRouter()
  const { shouldExpand } = useSidebar()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: employees, isLoading: isEmployeesLoading, refetch: refetchEmployees } = useEmployees()
  
  // Refetch employees when this page is visited or when route changes
  // This ensures we always have the latest data when navigating to this page
  useEffect(() => {
    if (router.isReady) {
      // Immediately refetch to get the latest data from server
      refetchEmployees()
    }
  }, [router.pathname, router.isReady, refetchEmployees])
  
  // Also listen for query cache updates to force re-render when data changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'employees') {
        // Force component to re-render with latest data
        refetchEmployees()
      }
    })
    return () => unsubscribe()
  }, [queryClient, refetchEmployees])

  const filteredEmployees = useMemo(() => {
    const list = employees ?? []
    return list.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, searchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6"
      )}>
        {/* Mobile Add Button */}
        <div className="sm:hidden flex justify-end">
          <Button 
            className="kenya-gradient text-white hover:opacity-90 shadow-lg"
            onClick={() => router.push('/employees/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
        {/* Search and Stats */}
        <Card className="border-2 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {filteredEmployees.length} employees
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Total: {formatCurrency((employees ?? []).reduce((sum, emp) => {
                    const allowances = Object.values(emp.allowances).reduce((a, b) => a + (b || 0), 0)
                    return sum + emp.basic_salary + allowances
                  }, 0))}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className={cn(
          "sm:hidden space-y-4",
          shouldExpand ? "sm:space-y-3" : "sm:space-y-4"
        )}>
          {isEmployeesLoading ? (
            <EmployeesSkeleton />
          ) : (
            filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee}
                onView={(e) => router.push(`/employees/${e.id}`)}
                onEdit={(e) => router.push(`/employees/${e.id}`)}
                onDelete={async (e) => {
                  if (!confirm(`Delete ${e.name} (${e.employee_id})? This cannot be undone.`)) return
                  try {
                    const res = await fetch(`/api/employees/${e.id}`, { method: 'DELETE' })
                    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
                    toast({ title: 'Employee deleted', description: `${e.name} removed.` })
                    await queryClient.invalidateQueries({ queryKey: ['employees'] })
                    await queryClient.refetchQueries({ queryKey: ['employees'], type: 'active' })
                    await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
                    await queryClient.refetchQueries({ queryKey: ['dashboard-stats'], type: 'active' })
                  } catch (err: any) {
                    toast({ title: 'Delete failed', description: err?.message || 'Could not delete employee', variant: 'destructive' })
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Desktop Table (deferred) */}
        <EmployeesTableDynamic 
          employees={filteredEmployees as any}
          onView={(e: any) => router.push(`/employees/${e.id}`)}
          onEdit={(e: any) => router.push(`/employees/${e.id}`)}
          onDelete={async (e: any) => {
              if (!confirm(`Delete ${e.name} (${e.employee_id})? This cannot be undone.`)) return
              try {
                const res = await fetch(`/api/employees/${e.id}`, { method: 'DELETE' })
                if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
                toast({ title: 'Employee deleted', description: `${e.name} removed.` })
                await queryClient.invalidateQueries({ queryKey: ['employees'] })
                await queryClient.refetchQueries({ queryKey: ['employees'], type: 'active' })
                await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
                await queryClient.refetchQueries({ queryKey: ['dashboard-stats'], type: 'active' })
              } catch (err: any) {
                toast({ title: 'Delete failed', description: err?.message || 'Could not delete employee', variant: 'destructive' })
              }
            }}
          />

        {/* Empty State */}
        {filteredEmployees.length === 0 && !isEmployeesLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first employee'}
              </p>
              <Button 
                className="kenya-gradient text-white hover:opacity-90"
                onClick={() => router.push('/employees/new')}
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
