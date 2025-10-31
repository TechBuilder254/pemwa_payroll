import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2,
  Calculator,
  TrendingUp,
  Shield,
  Home
} from 'lucide-react'
import { usePayrollSettings } from '@/hooks/usePayrollSettings'
import type { PayrollSettings } from '@/lib/supabase'

// All settings are fetched from the database; no hardcoded defaults

function TaxBracketEditor({ 
  brackets, 
  onChange 
}: { 
  brackets: Array<{ min: number; max: number | null; rate: number }>
  onChange: (brackets: Array<{ min: number; max: number | null; rate: number }>) => void
}) {
  const addBracket = () => {
    const lastBracket = brackets[brackets.length - 1]
    const newMin = lastBracket ? lastBracket.max! + 1 : 0
    onChange([...brackets, { min: newMin, max: null, rate: 0.30 }])
  }

  const updateBracket = (index: number, field: 'min' | 'max' | 'rate', value: number | null) => {
    const updated = brackets.map((bracket, i) => 
      i === index ? { ...bracket, [field]: value } : bracket
    )
    onChange(updated)
  }

  const removeBracket = (index: number) => {
    if (brackets.length > 1) {
      onChange(brackets.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PAYE Tax Brackets</h3>
        <Button size="sm" variant="outline" onClick={addBracket}>
          <Plus className="h-4 w-4 mr-1" />
          Add Bracket
        </Button>
      </div>
      
      <div className="space-y-3">
        {brackets.map((bracket, index) => (
          <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-card/50">
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">Min Amount</Label>
              <Input
                type="number"
                value={bracket.min}
                onChange={(e) => updateBracket(index, 'min', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">Max Amount</Label>
              <Input
                type="number"
                value={bracket.max || ''}
                onChange={(e) => updateBracket(index, 'max', e.target.value ? Number(e.target.value) : null)}
                placeholder="No limit"
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground">Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={bracket.rate * 100}
                onChange={(e) => updateBracket(index, 'rate', Number(e.target.value) / 100)}
                className="mt-1"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeBracket(index)}
              disabled={brackets.length === 1}
              className="mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsForm({ initial }: { initial: PayrollSettings }) {
  const [settings, setSettings] = useState<PayrollSettings>(initial)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const resetToDefaults = () => {}

  return (
    <div className="space-y-6">
      {/* Personal Relief */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Personal Relief
          </CardTitle>
          <CardDescription>Monthly personal relief amount for PAYE calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="personal-relief">Personal Relief (KES)</Label>
            <Input
              id="personal-relief"
              type="number"
              value={settings.personal_relief}
              onChange={(e) => setSettings({ ...settings, personal_relief: Number(e.target.value) })}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Standard amount deducted from PAYE before relief
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NSSF Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            NSSF Contributions
          </CardTitle>
          <CardDescription>National Social Security Fund rates and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nssf-employee">Employee Rate (%)</Label>
              <Input
                id="nssf-employee"
                type="number"
                step="0.01"
                value={settings.nssf_employee_rate * 100}
                onChange={(e) => setSettings({ ...settings, nssf_employee_rate: Number(e.target.value) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nssf-employer">Employer Rate (%)</Label>
              <Input
                id="nssf-employer"
                type="number"
                step="0.01"
                value={settings.nssf_employer_rate * 100}
                onChange={(e) => setSettings({ ...settings, nssf_employer_rate: Number(e.target.value) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nssf-max">Max Contribution (KES)</Label>
              <Input
                id="nssf-max"
                type="number"
                value={settings.nssf_max_contribution}
                onChange={(e) => setSettings({ ...settings, nssf_max_contribution: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SHIF Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SHIF Contributions
          </CardTitle>
          <CardDescription>Social Health Insurance Fund rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shif-employee">Employee Rate (%)</Label>
              <Input
                id="shif-employee"
                type="number"
                step="0.01"
                value={settings.shif_employee_rate * 100}
                onChange={(e) => setSettings({ ...settings, shif_employee_rate: Number(e.target.value) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shif-employer">Employer Rate (%)</Label>
              <Input
                id="shif-employer"
                type="number"
                step="0.01"
                value={settings.shif_employer_rate * 100}
                onChange={(e) => setSettings({ ...settings, shif_employer_rate: Number(e.target.value) / 100 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AHL Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Affordable Housing Levy
          </CardTitle>
          <CardDescription>Housing levy rates for employee and employer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ahl-employee">Employee Rate (%)</Label>
              <Input
                id="ahl-employee"
                type="number"
                step="0.01"
                value={settings.ahl_employee_rate * 100}
                onChange={(e) => setSettings({ ...settings, ahl_employee_rate: Number(e.target.value) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ahl-employer">Employer Rate (%)</Label>
              <Input
                id="ahl-employer"
                type="number"
                step="0.01"
                value={settings.ahl_employer_rate * 100}
                onChange={(e) => setSettings({ ...settings, ahl_employer_rate: Number(e.target.value) / 100 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PAYE Brackets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            PAYE Tax Brackets
          </CardTitle>
          <CardDescription>Progressive tax brackets for income tax calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <TaxBracketEditor
            brackets={settings.paye_brackets}
            onChange={(brackets) => setSettings({ ...settings, paye_brackets: brackets })}
          />
        </CardContent>
      </Card>

      {/* Effective Date */}
      <Card>
        <CardHeader>
          <CardTitle>Effective Date</CardTitle>
          <CardDescription>When these settings will take effect</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="effective-from">Effective From</Label>
            <Input
              id="effective-from"
              type="date"
              value={settings.effective_from}
              onChange={(e) => setSettings({ ...settings, effective_from: e.target.value })}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="kenya-gradient text-white hover:opacity-90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data, isLoading, error } = usePayrollSettings()
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-[12px] text-muted-foreground">Configure payroll rates</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block px-6 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Payroll Settings</h1>
            <p className="text-[12px] text-muted-foreground">Configure statutory rates and tax brackets for 2025</p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Loading settings…</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]" />
            </CardContent>
          </Card>
        )}
        {error && (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        )}
        {data && <SettingsForm initial={data} />}
      </div>
    </div>
  )
}
