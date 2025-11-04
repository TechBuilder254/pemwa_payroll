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
  Plus,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/payroll-calculations'
import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useDashboardStats'

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  index
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; isPositive: boolean }
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.1, duration: 0.3 }}
    >
      <Card className="border-2 hover:shadow-lg transition-all duration-200 overflow-hidden min-w-0 hover:border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 min-w-0 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-muted-foreground truncate flex-1 min-w-0">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 ml-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 min-w-0">
          <div className="text-2xl sm:text-3xl font-bold truncate text-slate-900 dark:text-foreground" title={String(value)}>
            {value}
          </div>
          <p className="text-xs text-slate-600 dark:text-muted-foreground mt-2 truncate" title={description}>
            {description}
          </p>
          {trend && (
            <div className="flex items-center mt-3 gap-2 min-w-0">
              <Badge 
                variant={trend.isPositive ? "success" : "destructive"}
                className="text-xs flex-shrink-0"
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </Badge>
              <span className="text-xs text-slate-600 dark:text-muted-foreground truncate">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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

function RecentPayrolls({ recentPayrolls }: { recentPayrolls: Array<{ month: string; employees: number; netTotal: number; status: string }> }) {
  if (!recentPayrolls || recentPayrolls.length === 0) {
    return (
      <Card className="overflow-hidden min-w-0 border-2">
        <CardHeader className="min-w-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
          <CardTitle className="flex items-center gap-2 truncate">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
            </div>
            <span className="truncate">Recent Payrolls</span>
          </CardTitle>
          <CardDescription className="truncate">Latest monthly payroll processing</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 pt-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No payroll runs yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden min-w-0 border-2">
      <CardHeader className="min-w-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
        <CardTitle className="flex items-center gap-2 truncate">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
          </div>
          <span className="truncate">Recent Payrolls</span>
        </CardTitle>
        <CardDescription className="truncate">Latest monthly payroll processing</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 pt-4">
        <div className="space-y-3">
          {recentPayrolls.map((payroll, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-card/80 hover:border-primary/30 transition-all min-w-0 gap-3"
            >
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate text-slate-900 dark:text-foreground">{payroll.month}</p>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground truncate">
                    {payroll.employees} employees
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 min-w-0">
                <p className="font-bold truncate text-slate-900 dark:text-foreground" title={formatCurrency(payroll.netTotal)}>
                  {formatCurrency(payroll.netTotal)}
                </p>
                <Badge variant="success" className="text-xs mt-2 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {payroll.status}
                </Badge>
              </div>
            </motion.div>
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
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10'
    },
    { 
      title: 'Add Employee', 
      description: 'Register new employee', 
      icon: Users, 
      href: '/employees/new',
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-500/10'
    },
    { 
      title: 'View Payslips', 
      description: 'Generate payslips', 
      icon: FileText, 
      href: '/payslips',
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10'
    },
    { 
      title: 'Settings', 
      description: 'Configure rates', 
      icon: TrendingUp, 
      href: '/settings',
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-500/10'
    },
  ]

  return (
    <Card className="overflow-hidden min-w-0 border-2">
      <CardHeader className="min-w-0 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 truncate">
          <div className="p-2 rounded-lg bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="truncate">Quick Actions</span>
        </CardTitle>
        <CardDescription className="truncate">Common payroll tasks</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  to={action.href}
                  className="group p-4 rounded-xl border-2 border-border/50 bg-card hover:bg-card/80 transition-all duration-200 hover:shadow-lg hover:border-primary/30 min-w-0 overflow-hidden flex flex-col"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform flex-shrink-0 shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate text-slate-900 dark:text-foreground" title={action.title}>{action.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-muted-foreground truncate" title={action.description}>{action.description}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { shouldExpand } = useSidebar()
  const { data: stats, isLoading } = useDashboardStats()

  // Calculate stats with fallback to 0 if no data
  const totalEmployees = stats?.totalEmployees || 0
  const monthlyPayroll = stats?.monthlyPayroll || 0
  const totalDeductions = stats?.totalDeductions || 0
  const netPayroll = stats?.netPayroll || 0
  const employerCost = stats?.employerCost || 0
  const recentPayrolls = stats?.recentPayrolls || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
        {/* Loading Content */}
        <div className={cn(
          "w-full min-w-0 space-y-6 transition-all duration-300",
          "p-4 sm:p-6"
        )}>
          <div className={cn(
            "grid gap-4 sm:gap-6 min-w-0",
            "grid-cols-1 sm:grid-cols-2",
            shouldExpand ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-4"
          )}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="pt-4">
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <RecentPayrollsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      
      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6"
      )}>
        {/* Stats Grid */}
        <div className={cn(
          "grid gap-4 sm:gap-6 min-w-0",
          "grid-cols-1 sm:grid-cols-2",
          shouldExpand ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-4"
        )}>
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            description="Active employees"
            icon={Users}
            index={0}
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(monthlyPayroll)}
            description="Gross salary total"
            icon={DollarSign}
            index={1}
          />
          <StatCard
            title="Total Deductions"
            value={formatCurrency(totalDeductions)}
            description="Statutory deductions"
            icon={TrendingUp}
            index={2}
          />
          <StatCard
            title="Net Payroll"
            value={formatCurrency(netPayroll)}
            description="After deductions"
            icon={Calculator}
            index={3}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <RecentPayrolls recentPayrolls={recentPayrolls} />
          <QuickActions />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Card className="overflow-hidden min-w-0 border-2">
              <CardHeader className="min-w-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b">
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>
                  <span className="truncate">Employer Costs</span>
                </CardTitle>
                <CardDescription className="truncate">Total monthly employer contributions</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 pt-4">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 truncate" title={formatCurrency(employerCost)}>
                  {formatCurrency(employerCost)}
                </div>
                <p className="text-sm text-slate-600 dark:text-muted-foreground mt-3 line-clamp-2">
                  Includes NSSF and AHL contributions (SHIF not applicable)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Card className="overflow-hidden min-w-0 border-2 border-green-300/50">
              <CardHeader className="min-w-0 bg-gradient-to-r from-green-500/10 to-green-600/5 border-b">
                <CardTitle className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>
                  <span className="truncate">Compliance Status</span>
                </CardTitle>
                <CardDescription className="truncate">KRA reporting status</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 pt-4">
                <div className="flex items-center gap-2 min-w-0 mb-3">
                  <Badge variant="success" className="text-sm flex-shrink-0 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Up to Date
                  </Badge>
                  <span className="text-sm text-slate-600 dark:text-muted-foreground truncate">
                    All P9 forms generated
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-muted-foreground">
                  Next P9 due: March 2025
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
