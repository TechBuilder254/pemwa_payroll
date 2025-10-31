import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Calculator, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Building2,
  Plus
} from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'
import Link from 'next/link'

// Mock data for demonstration
const mockStats = {
  totalEmployees: 24,
  monthlyPayroll: 1250000,
  totalDeductions: 187500,
  netPayroll: 1062500,
  employerCost: 1350000,
  recentPayrolls: [
    { month: 'December 2024', employees: 24, netTotal: 1062500, status: 'completed' },
    { month: 'November 2024', employees: 23, netTotal: 1025000, status: 'completed' },
    { month: 'October 2024', employees: 22, netTotal: 980000, status: 'completed' },
  ]
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card className="stat-card hover:shadow-lg transition-all duration-200 overflow-hidden min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-w-0">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate flex-1 min-w-0">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="text-lg sm:text-xl font-bold truncate" title={String(value)}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate" title={description}>
          {description}
        </p>
        {trend && (
          <div className="flex items-center mt-2 gap-2 min-w-0">
            <Badge 
              variant={trend.isPositive ? "success" : "destructive"}
              className="text-xs flex-shrink-0"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground truncate">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentPayrollsSkeleton() {
  return (
    <Card className="overflow-hidden min-w-0">
      <CardHeader className="min-w-0">
        <CardTitle className="truncate">Recent Payrolls</CardTitle>
        <CardDescription className="truncate">Latest monthly payroll processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 min-w-0">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-3 w-full max-w-[100px]" />
            </div>
            <Skeleton className="h-6 w-16 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RecentPayrolls() {
  return (
    <Card className="overflow-hidden min-w-0">
      <CardHeader className="min-w-0">
        <CardTitle className="flex items-center gap-2 truncate">
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Recent Payrolls</span>
        </CardTitle>
        <CardDescription className="truncate">Latest monthly payroll processing</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="space-y-4">
          {mockStats.recentPayrolls.map((payroll, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors min-w-0 gap-3">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{payroll.month}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {payroll.employees} employees
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 min-w-0">
                <p className="font-semibold truncate" title={formatCurrency(payroll.netTotal)}>
                  {formatCurrency(payroll.netTotal)}
                </p>
                <Badge variant="success" className="text-xs mt-1">
                  {payroll.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  const actions = [
    { 
      title: 'Run Payroll', 
      description: 'Process monthly payroll', 
      icon: Calculator, 
      href: '/payroll',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Add Employee', 
      description: 'Register new employee', 
      icon: Users, 
      href: '/employees/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'View Payslips', 
      description: 'Generate payslips', 
      icon: FileText, 
      href: '/payslips',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      title: 'Settings', 
      description: 'Configure rates', 
      icon: TrendingUp, 
      href: '/settings',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
  ]

  return (
    <Card className="overflow-hidden min-w-0">
      <CardHeader className="min-w-0">
        <CardTitle className="truncate">Quick Actions</CardTitle>
        <CardDescription className="truncate">Common payroll tasks</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className="group p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-all duration-200 hover:shadow-md min-w-0 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-sm mb-1 truncate" title={action.title}>{action.title}</h3>
                <p className="text-xs text-muted-foreground truncate" title={action.description}>{action.description}</p>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { shouldExpand } = useSidebar()

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        {/* Stats Grid */}
        <div className={cn(
          "grid gap-4 sm:gap-6 min-w-0",
          "grid-cols-1 sm:grid-cols-2",
          shouldExpand ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-4"
        )}>
          <StatCard
            title="Total Employees"
            value={mockStats.totalEmployees}
            description="Active employees"
            icon={Users}
            trend={{ value: 8.3, isPositive: true }}
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(mockStats.monthlyPayroll)}
            description="Gross salary total"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Deductions"
            value={formatCurrency(mockStats.totalDeductions)}
            description="Statutory deductions"
            icon={TrendingUp}
            trend={{ value: 15.2, isPositive: false }}
          />
          <StatCard
            title="Net Payroll"
            value={formatCurrency(mockStats.netPayroll)}
            description="After deductions"
            icon={Calculator}
            trend={{ value: 10.8, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <Suspense fallback={<RecentPayrollsSkeleton />}>
            <RecentPayrolls />
          </Suspense>
          <QuickActions />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
          <Card className="overflow-hidden min-w-0">
            <CardHeader className="min-w-0">
              <CardTitle className="flex items-center gap-2 min-w-0">
                <Building2 className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Employer Costs</span>
              </CardTitle>
              <CardDescription className="truncate">Total monthly employer contributions</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-primary truncate" title={formatCurrency(mockStats.employerCost)}>
                {formatCurrency(mockStats.employerCost)}
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                Includes NSSF, SHIF, and AHL contributions
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden min-w-0">
            <CardHeader className="min-w-0">
              <CardTitle className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Compliance Status</span>
              </CardTitle>
              <CardDescription className="truncate">KRA reporting status</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="success" className="text-sm flex-shrink-0">
                  Up to Date
                </Badge>
                <span className="text-sm text-muted-foreground truncate">
                  All P9 forms generated
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Next P9 due: March 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
