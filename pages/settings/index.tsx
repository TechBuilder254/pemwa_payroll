import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2,
  Calculator,
  TrendingUp,
  Shield,
  Home,
  CheckCircle,
  Info,
  Calendar,
  Building2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import type { PayrollSettings } from '@/lib/supabase'
import { updatePayrollSettings } from '@/lib/api'
import { motion } from 'framer-motion'

// Enhanced Tax Bracket Editor with better UX
function TaxBracketEditor({ 
  brackets, 
  onChange 
}: { 
  brackets: Array<{ min: number; max: number | null; rate: number }>
  onChange: (brackets: Array<{ min: number; max: number | null; rate: number }>) => void
}) {
  // Commented out - can be uncommented if needed in the future
  // const addBracket = () => {
  //   const lastBracket = brackets[brackets.length - 1]
  //   const newMin = lastBracket ? (lastBracket.max ?? 0) + 1 : 0
  //   onChange([...brackets, { min: newMin, max: null, rate: 0.30 }])
  // }

  const updateBracket = (index: number, field: 'min' | 'max' | 'rate', value: number | null) => {
    const updated = brackets.map((bracket, i) => 
      i === index ? { ...bracket, [field]: value } : bracket
    )
    onChange(updated)
  }

  // Commented out - can be uncommented if needed in the future
  // const removeBracket = (index: number) => {
  //   if (brackets.length > 1) {
  //     onChange(brackets.filter((_, i) => i !== index))
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Progressive Tax Brackets</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure income tax brackets from lowest to highest</p>
        </div>
        {/* Commented out - can be uncommented if needed in the future */}
        {/* <Button size="sm" variant="outline" onClick={addBracket} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bracket
        </Button> */}
      </div>
      
      <div className="space-y-4">
        {brackets.map((bracket, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 border-2 rounded-xl bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all duration-200"
          >
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs font-mono">
                #{index + 1}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>Minimum</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KES</span>
                  <Input
                    type="number"
                    value={bracket.min || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value)
                      updateBracket(index, 'min', val)
                    }}
                    className="pl-12 font-mono"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span>Maximum</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KES</span>
                  <Input
                    type="number"
                    value={bracket.max ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value)
                      updateBracket(index, 'max', val)
                    }}
                    placeholder="No limit"
                    className="pl-12 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tax Rate</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={bracket.rate * 100 || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                      updateBracket(index, 'rate', val)
                    }}
                    className="pr-8 font-mono"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              {/* Commented out - can be uncommented if needed in the future */}
              {/* <div className="flex items-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeBracket(index)}
                  disabled={brackets.length === 1}
                  className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div> */}
            </div>
            {index < brackets.length - 1 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-center">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  <span>Next bracket continues here</span>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Commented out - can be uncommented if needed in the future */}
      {/* {brackets.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No tax brackets configured</p>
          <Button size="sm" variant="outline" onClick={addBracket} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add First Bracket
          </Button>
        </div>
      )} */}
    </div>
  )
}

// Modern Setting Card Component
function SettingCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  badge,
  className 
}: { 
  title: string
  description: string
  icon: any
  children: React.ReactNode
  badge?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2", className)}>
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 kenya-gradient">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {title}
                  {badge}
                </CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SettingsForm({ initial }: { initial: PayrollSettings }) {
  const [settings, setSettings] = useState<PayrollSettings>(initial)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Sync local state with fetched data when it changes
  useEffect(() => {
    if (initial) {
      setSettings(initial)
    }
  }, [initial])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings and get updated data from server
      const updatedSettings = await updatePayrollSettings({
        personal_relief: settings.personal_relief,
        nssf_employee_rate: settings.nssf_employee_rate,
        nssf_employer_rate: settings.nssf_employer_rate,
        nssf_max_contribution: settings.nssf_max_contribution,
        shif_employee_rate: settings.shif_employee_rate,
        shif_employer_rate: settings.shif_employer_rate,
        ahl_employee_rate: settings.ahl_employee_rate,
        ahl_employer_rate: settings.ahl_employer_rate,
        paye_brackets: settings.paye_brackets,
        effective_from: settings.effective_from,
        effective_to: settings.effective_to,
      })
      
      // Update query cache immediately with the saved data (ensures UI reflects changes instantly)
      queryClient.setQueryData(['payroll-settings'], updatedSettings)
      
      // Update local state with saved data immediately (reflects what's in database)
      setSettings(updatedSettings)
      
      // Invalidate and refetch queries to ensure all components see the update
      await queryClient.invalidateQueries({ queryKey: ['payroll-settings'] })
      await queryClient.refetchQueries({ queryKey: ['payroll-settings'], type: 'active' })
      // Also invalidate dashboard as settings affect calculations
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      await queryClient.refetchQueries({ queryKey: ['dashboard-stats'], type: 'active' })
      
      toast({
        title: "Settings saved successfully!",
        description: "Your payroll settings have been updated and are now active.",
        className: "bg-green-50 border-green-200 text-green-900",
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: "Failed to save settings",
        description: "Please try again or check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SHIF Employee</p>
                <p className="text-2xl font-bold text-red-600">
                  {(settings.shif_employee_rate * 100).toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AHL Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((settings.ahl_employee_rate + settings.ahl_employer_rate) * 100).toFixed(2)}%
                </p>
              </div>
              <Home className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NSSF Max</p>
                <p className="text-lg font-bold text-blue-600">
                  KES {settings.nssf_max_contribution.toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personal Relief</p>
                <p className="text-lg font-bold text-green-600">
                  KES {settings.personal_relief.toLocaleString()}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Relief */}
      <SettingCard
        title="Personal Relief"
        description="Monthly tax relief amount deducted from PAYE calculation"
        icon={Shield}
        badge={<Badge variant="secondary" className="ml-2">Standard</Badge>}
      >
        <div className="space-y-4">
          <div className="max-w-md">
            <Label htmlFor="personal-relief" className="text-base font-semibold mb-2 block">
              Amount (KES)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">KES</span>
              <Input
                id="personal-relief"
                type="number"
                value={settings.personal_relief || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value)
                  setSettings({ ...settings, personal_relief: val })
                }}
                className="pl-16 text-lg font-semibold h-12"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Standard monthly relief amount for all employees
            </p>
          </div>
        </div>
      </SettingCard>

      {/* NSSF Settings */}
      <SettingCard
        title="NSSF Contributions"
        description="National Social Security Fund rates and contribution limits"
        icon={Calculator}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nssf-employee" className="text-base font-semibold flex items-center gap-2">
                Employee Rate
                <Badge variant="outline" className="text-xs">Employee</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="nssf-employee"
                  type="number"
                  step="0.01"
                  value={settings.nssf_employee_rate * 100 || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                    setSettings({ ...settings, nssf_employee_rate: val })
                  }}
                  className="pr-8 text-lg font-semibold h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Percentage of gross salary</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nssf-employer" className="text-base font-semibold flex items-center gap-2">
                Employer Rate
                <Badge variant="outline" className="text-xs">Employer</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="nssf-employer"
                  type="number"
                  step="0.01"
                  value={settings.nssf_employer_rate * 100 || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                    setSettings({ ...settings, nssf_employer_rate: val })
                  }}
                  className="pr-8 text-lg font-semibold h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Percentage of gross salary</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nssf-max" className="text-base font-semibold">Maximum Contribution</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">KES</span>
                <Input
                  id="nssf-max"
                  type="number"
                  value={settings.nssf_max_contribution}
                  onChange={(e) => setSettings({ ...settings, nssf_max_contribution: Number(e.target.value) })}
                  className="pl-16 text-lg font-semibold h-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">Capped contribution limit</p>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* SHIF Settings */}
      <SettingCard
        title="SHIF Contributions"
        description="Social Health Insurance Fund - Employee contribution only"
        icon={TrendingUp}
        badge={
          <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
            Employee Only
          </Badge>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shif-employee" className="text-base font-semibold flex items-center gap-2">
                Employee Rate
                <Badge variant="outline" className="text-xs bg-red-50">Required</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="shif-employee"
                  type="number"
                  step="0.01"
                  value={settings.shif_employee_rate * 100 || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                    setSettings({ ...settings, shif_employee_rate: val })
                  }}
                  className="pr-8 text-lg font-semibold h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground">2.75% of gross salary (standard rate)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shif-employer" className="text-base font-semibold flex items-center gap-2">
                Employer Rate
                <Badge variant="outline" className="text-xs bg-muted">Not Applicable</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="shif-employer"
                  type="number"
                  step="0.01"
                  value={(settings.shif_employer_rate * 100).toFixed(2)}
                  onChange={(e) => setSettings({ ...settings, shif_employer_rate: Number(e.target.value) / 100 })}
                  className="pr-8 text-lg font-semibold h-12 bg-muted/50"
                  disabled
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-900">
                  Employer does <strong>NOT</strong> contribute to SHIF
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* AHL Settings */}
      <SettingCard
        title="Affordable Housing Levy"
        description="Housing levy contributions - Both employee and employer contribute 1.5% each"
        icon={Home}
        badge={
          <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
            Both Pay
          </Badge>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ahl-employee" className="text-base font-semibold flex items-center gap-2">
                Employee Rate
                <Badge variant="outline" className="text-xs">1.5%</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="ahl-employee"
                  type="number"
                  step="0.01"
                  value={settings.ahl_employee_rate * 100 || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                    setSettings({ ...settings, ahl_employee_rate: val })
                  }}
                  className="pr-8 text-lg font-semibold h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Employee contribution</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ahl-employer" className="text-base font-semibold flex items-center gap-2">
                Employer Rate
                <Badge variant="outline" className="text-xs">1.5%</Badge>
              </Label>
              <div className="relative">
                <Input
                  id="ahl-employer"
                  type="number"
                  step="0.01"
                  value={settings.ahl_employer_rate * 100 || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value) / 100
                    setSettings({ ...settings, ahl_employer_rate: val })
                  }}
                  className="pr-8 text-lg font-semibold h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Employer contribution</p>
            </div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900">Total AHL: 3.0%</p>
                <p className="text-xs text-purple-700 mt-1">
                  Combined employee (1.5%) + employer (1.5%) contributions
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* PAYE Brackets */}
      <SettingCard
        title="PAYE Tax Brackets"
        description="Progressive income tax brackets for PAYE calculation (ordered from lowest to highest)"
        icon={Calculator}
      >
        <TaxBracketEditor
          brackets={settings.paye_brackets}
          onChange={(brackets) => setSettings({ ...settings, paye_brackets: brackets })}
        />
      </SettingCard>

      {/* Effective Date */}
      <SettingCard
        title="Effective Period"
        description="When these settings will become active and expire"
        icon={Calendar}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="effective-from" className="text-base font-semibold">Effective From</Label>
            <Input
              id="effective-from"
              type="date"
              value={settings.effective_from}
              onChange={(e) => setSettings({ ...settings, effective_from: e.target.value })}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">When these settings take effect</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="effective-to" className="text-base font-semibold">Effective To (Optional)</Label>
            <Input
              id="effective-to"
              type="date"
              value={settings.effective_to || ''}
              onChange={(e) => setSettings({ ...settings, effective_to: e.target.value || null })}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">When these settings expire (leave empty for indefinite)</p>
          </div>
        </div>
      </SettingCard>

      {/* Actions */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Changes will apply to all future payroll calculations</span>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="lg"
                className="kenya-gradient text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Save className="h-5 w-5" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const { shouldExpand } = useSidebar()
  const { data, isLoading, error } = usePayrollSettings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Settings</h1>
            <p className="text-[12px] text-muted-foreground truncate">Configure payroll rates</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 shadow-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={cn(
        "hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/80 backdrop-blur-sm transition-all duration-300",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold transition-all duration-300",
              shouldExpand ? "text-xl" : "text-2xl"
            )}>
              Payroll Settings
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 mt-1",
              shouldExpand ? "text-xs" : "text-sm"
            )}>
              Configure statutory rates, tax brackets, and contribution limits for payroll calculations
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 space-y-6 transition-all duration-300",
        "p-4 sm:p-6",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="h-12 w-12 mx-auto text-primary/50" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Loading settings...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Settings
              </CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        )}
        {data && <SettingsForm initial={data} />}
      </div>
    </div>
  )
}
