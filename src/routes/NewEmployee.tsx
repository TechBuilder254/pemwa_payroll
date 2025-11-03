import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useNextEmployeeId } from '@/hooks/useNextEmployeeId'
import { useSidebar } from '@/contexts/sidebar-context'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Save, ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, Building2, Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'
import { createEmployee } from '@/lib/api'

interface EmployeeFormData { name: string; kra_pin: string; position: string; department: string; email: string; phone: string; address: string; date_of_birth: string; date_of_employment: string; employment_type: 'full-time' | 'part-time' | 'contract' | 'intern'; bank_name: string; bank_account_number: string; bank_branch: string; basic_salary: number; allowances: { housing: number; transport: number; medical: number; communication: number; meals: number; fuel: number; entertainment: number; }; helb_amount: number; voluntary_deductions: { insurance: number; pension: number; union_fees: number; loans: number; saccos: number; welfare: number; }; emergency_contact_name: string; emergency_contact_phone: string; emergency_contact_relationship: string; }

const initialFormData: EmployeeFormData = { name: '', kra_pin: '', position: '', department: '', email: '', phone: '', address: '', date_of_birth: '', date_of_employment: '', employment_type: 'full-time', bank_name: '', bank_account_number: '', bank_branch: '', basic_salary: 0, allowances: { housing: 0, transport: 0, medical: 0, communication: 0, meals: 0, fuel: 0, entertainment: 0 }, helb_amount: 0, voluntary_deductions: { insurance: 0, pension: 0, union_fees: 0, loans: 0, saccos: 0, welfare: 0 }, emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '' }

function AllowanceField({ label, value, onChange, placeholder = '0' }: { label: string; value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <Input type="number" value={value || ''} onChange={(e) => onChange(Number(e.target.value) || 0)} placeholder={placeholder} className="text-sm" />
    </div>
  )
}

function EmployeeForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: nextEmployeeId } = useNextEmployeeId()
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.kra_pin.trim()) newErrors.kra_pin = 'KRA PIN is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (formData.basic_salary <= 0) newErrors.basic_salary = 'Basic salary must be greater than 0'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      const first = Object.keys(newErrors)[0] as keyof EmployeeFormData
      const msg = newErrors[first] || 'Please fill in all required fields'
      toast({ title: 'Validation Error', description: msg, variant: 'destructive' })
      setTimeout(() => {
        const el = document.getElementById(first as string)
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); (el as HTMLInputElement).focus() }
      }, 100)
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      await createEmployee({
        name: formData.name,
        kra_pin: formData.kra_pin,
        position: formData.position,
        basic_salary: formData.basic_salary,
        allowances: formData.allowances as any,
        helb_amount: formData.helb_amount,
        voluntary_deductions: formData.voluntary_deductions as any,
        // optional fields can be saved in dedicated tables/JSON if schema supports
      } as any)
      
      // Invalidate and refetch employees query immediately
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      await queryClient.refetchQueries({ queryKey: ['employees'], type: 'active' })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      await queryClient.refetchQueries({ queryKey: ['dashboard-stats'], type: 'active' })
      
      toast({ title: 'Success!', description: 'Employee has been saved successfully.', className: 'bg-green-600 text-white border-green-700' })
      setTimeout(() => navigate('/employees'), 500)
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save employee. Please try again.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const totalAllowances = Object.values(formData.allowances).reduce((s, a) => s + a, 0)
  const totalVoluntaryDeductions = Object.values(formData.voluntary_deductions).reduce((s, a) => s + a, 0)
  const grossSalary = formData.basic_salary + totalAllowances

  return (
    <div className="space-y-6 w-full min-w-0">
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate"><User className="h-5 w-5 flex-shrink-0" /><span className="truncate">Personal Information</span></CardTitle>
          <CardDescription className="truncate">Basic employee details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input id="employee_id" value={nextEmployeeId || 'Generating…'} readOnly placeholder="EMP001" />
              <p className="text-xs text-muted-foreground">Auto-generated, sequential and uneditable.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kra_pin">KRA PIN *</Label>
              <Input id="kra_pin" value={formData.kra_pin} onChange={(e) => setFormData({ ...formData, kra_pin: e.target.value })} placeholder="A123456789K" className={errors.kra_pin ? 'border-red-500' : ''} />
              {errors.kra_pin && <p className="text-sm text-red-500">{errors.kra_pin}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Software Developer" className={errors.position ? 'border-red-500' : ''} />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>
          </div>
          <Separator />
          <div className="text-sm font-medium">Basic Salary (Required)</div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary (KES) *</Label>
              <Input id="basic_salary" type="number" value={formData.basic_salary || ''} onChange={(e) => setFormData({ ...formData, basic_salary: Number(e.target.value) || 0 })} placeholder="50000" className={errors.basic_salary ? 'border-red-500' : ''} />
              {errors.basic_salary && <p className="text-sm text-red-500">{errors.basic_salary}</p>}
            </div>
          </div>
          <Separator />
          <div className="text-sm font-medium text-muted-foreground">Optional Information (Can be added later)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="IT Department" /></div>
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <select id="employment_type" value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="email">Email Address</Label><div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="employee@company.com" className="pl-10" /></div></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+254 700 000 000" className="pl-10" /></div></div>
          </div>
          <div className="space-y-2"><Label htmlFor="address">Address</Label><div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter full address" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" /></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="date_of_birth">Date of Birth</Label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="pl-10" /></div></div>
            <div className="space-y-2"><Label htmlFor="date_of_employment">Date of Employment</Label><div className="relative"><Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="date_of_employment" type="date" value={formData.date_of_employment} onChange={(e) => setFormData({ ...formData, date_of_employment: e.target.value })} className="pl-10" /></div></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0"><CardTitle className="flex items-center gap-2 truncate"><CreditCard className="h-5 w-5 flex-shrink-0" /><span className="truncate">Bank Details (Optional)</span></CardTitle><CardDescription className="truncate">Banking information for salary payments (can be added later)</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="bank_name">Bank Name</Label><Input id="bank_name" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="Equity Bank" /></div>
            <div className="space-y-2"><Label htmlFor="bank_branch">Bank Branch</Label><Input id="bank_branch" value={formData.bank_branch} onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })} placeholder="Westlands Branch" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="bank_account_number">Account Number</Label><Input id="bank_account_number" value={formData.bank_account_number} onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })} placeholder="1234567890" /></div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0"><CardTitle className="flex items-center gap-2 truncate"><Building2 className="h-5 w-5 flex-shrink-0" /><span className="truncate">Allowances</span></CardTitle><CardDescription className="truncate">Monthly allowances and benefits</CardDescription></CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['Housing Allowance','housing'], ['Transport Allowance','transport'], ['Medical Allowance','medical'], ['Communication Allowance','communication'], ['Meals Allowance','meals'], ['Fuel Allowance','fuel'], ['Entertainment Allowance','entertainment'],
            ].map(([label, key]) => (
              <AllowanceField key={key} label={label as string} value={(formData.allowances as any)[key as string]} onChange={(v) => setFormData({ ...formData, allowances: { ...formData.allowances, [key as string]: v } })} />
            ))}
          </div>
          <Separator />
          <div className="flex justify-between items-center"><span className="font-medium">Total Allowances</span><span className="font-semibold text-primary">{formatCurrency(totalAllowances)}</span></div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0"><CardTitle className="flex items-center gap-2 truncate"><Calculator className="h-5 w-5 flex-shrink-0" /><span className="truncate">Deductions</span></CardTitle><CardDescription className="truncate">HELB and voluntary deductions</CardDescription></CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="space-y-2"><Label htmlFor="helb_amount">HELB Amount (KES)</Label><Input id="helb_amount" type="number" value={formData.helb_amount || ''} onChange={(e) => setFormData({ ...formData, helb_amount: Number(e.target.value) || 0 })} placeholder="5000" /><p className="text-sm text-muted-foreground">Enter 0 if employee has no HELB loan</p></div>
          <Separator />
          <div>
            <h4 className="font-medium mb-3">Voluntary Deductions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Insurance','insurance'], ['Pension Contribution','pension'], ['Union Fees','union_fees'], ['Loans','loans'], ['SACCO Contributions','saccos'], ['Welfare Fund','welfare']
              ].map(([label, key]) => (
                <AllowanceField key={key} label={label as string} value={(formData.voluntary_deductions as any)[key as string]} onChange={(v) => setFormData({ ...formData, voluntary_deductions: { ...formData.voluntary_deductions, [key as string]: v } })} />
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center"><span className="font-medium">Total Voluntary Deductions</span><span className="font-semibold text-red-600">{formatCurrency(totalVoluntaryDeductions)}</span></div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0"><CardTitle className="flex items-center gap-2 truncate"><User className="h-5 w-5 flex-shrink-0" /><span className="truncate">Emergency Contact (Optional)</span></CardTitle><CardDescription className="truncate">Emergency contact information (can be added later)</CardDescription></CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="emergency_contact_name">Contact Name</Label><Input id="emergency_contact_name" value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} placeholder="Jane Doe" /></div>
            <div className="space-y-2"><Label htmlFor="emergency_contact_phone">Contact Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} placeholder="+254 700 000 000" className="pl-10" /></div></div>
          </div>
          <div className="space-y-2"><Label htmlFor="emergency_contact_relationship">Relationship</Label><Input id="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })} placeholder="Spouse, Parent, Sibling, etc." /></div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" onClick={() => navigate('/employees')} className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving} className="kenya-gradient text-white hover:opacity-90 flex items-center gap-2"><Save className="h-4 w-4" />{isSaving ? 'Saving...' : 'Save Employee'}</Button>
      </div>
    </div>
  )
}

const NewEmployee: React.FC = () => {
  const { shouldExpand } = useSidebar()
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">Add Employee</h1>
            <p className="text-[12px] text-muted-foreground truncate">Register new team member</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"><User className="h-5 w-5 text-white" /></div>
        </div>
      </div>
      <div className="hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className={cn('font-bold transition-all duration-300', shouldExpand ? 'text-xl' : 'text-xl')}>Add New Employee</h1>
            <p className={cn('text-muted-foreground transition-all duration-300 truncate', shouldExpand ? 'text-sm' : 'text-base')}>Register a new team member and configure their payroll details</p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4"><User className="h-6 w-6 text-white" /></div>
        </div>
      </div>
      <div className={cn('w-full min-w-0 transition-all duration-300','p-4 sm:p-6', shouldExpand ? 'sm:px-4' : 'sm:px-6')}>
        <EmployeeForm />
      </div>
    </div>
  )
}

export default NewEmployee



