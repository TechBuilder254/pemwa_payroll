import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useNextEmployeeId } from '@/hooks/useNextEmployeeId'
import { useSidebar } from '@/contexts/sidebar-context'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useEmployees } from '@/hooks/useEmployees'
import { fetchEmployees } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Save, 
  ArrowLeft,
  Plus,
  Minus,
  Building2,
  DollarSign,
  Calculator,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/payroll-calculations'

interface EmployeeFormData {
  // Personal Information
  name: string
  kra_pin: string
  position: string
  department: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  date_of_employment: string
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern'
  
  // Bank Details
  bank_name: string
  bank_account_number: string
  bank_branch: string
  
  // Salary Information
  basic_salary: number
  allowances: {
    housing: number
    transport: number
    medical: number
    communication: number
    meals: number
    fuel: number
    entertainment: number
  }
  
  // Deductions
  helb_amount: number
  voluntary_deductions: {
    insurance: number
    pension: number
    union_fees: number
    loans: number
    saccos: number
    welfare: number
  }
  
  // Emergency Contact
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
}

const initialFormData: EmployeeFormData = {
  // Personal Information
  name: '',
  kra_pin: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  address: '',
  date_of_birth: '',
  date_of_employment: '',
  employment_type: 'full-time',
  
  // Bank Details
  bank_name: '',
  bank_account_number: '',
  bank_branch: '',
  
  // Salary Information
  basic_salary: 0,
  allowances: {
    housing: 0,
    transport: 0,
    medical: 0,
    communication: 0,
    meals: 0,
    fuel: 0,
    entertainment: 0
  },
  
  // Deductions
  helb_amount: 0,
  voluntary_deductions: {
    insurance: 0,
    pension: 0,
    union_fees: 0,
    loans: 0,
    saccos: 0,
    welfare: 0
  },
  
  // Emergency Contact
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: ''
}

function AllowanceField({ 
  label, 
  value, 
  onChange, 
  placeholder = "0" 
}: { 
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  )
}

function EmployeeForm() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: nextEmployeeId } = useNextEmployeeId()
  const { data: employees } = useEmployees()
  const employeeId = router.query.id as string | undefined
  const isEditMode = !!employeeId
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({})

  // Load employee data when editing
  useEffect(() => {
    if (isEditMode && employeeId && employees && router.isReady) {
      const employee = employees.find((e: any) => e.id === employeeId)
      if (employee) {
        setFormData({
          name: employee.name || '',
          kra_pin: employee.kra_pin || '',
          position: employee.position || '',
          department: (employee as any).department || '',
          email: (employee as any).email || '',
          phone: (employee as any).phone || '',
          address: (employee as any).address || '',
          date_of_birth: (employee as any).date_of_birth || '',
          date_of_employment: (employee as any).date_of_employment || '',
          employment_type: (employee as any).employment_type || 'full-time',
          bank_name: (employee as any).bank_name || '',
          bank_account_number: (employee as any).bank_account_number || '',
          bank_branch: (employee as any).bank_branch || '',
          basic_salary: employee.basic_salary || 0,
          allowances: {
            housing: (employee.allowances as any)?.housing || 0,
            transport: (employee.allowances as any)?.transport || 0,
            medical: (employee.allowances as any)?.medical || 0,
            communication: (employee.allowances as any)?.communication || 0,
            meals: (employee.allowances as any)?.meals || 0,
            fuel: (employee.allowances as any)?.fuel || 0,
            entertainment: (employee.allowances as any)?.entertainment || 0,
          },
          helb_amount: employee.helb_amount || 0,
          voluntary_deductions: {
            insurance: (employee.voluntary_deductions as any)?.insurance || 0,
            pension: (employee.voluntary_deductions as any)?.pension || 0,
            union_fees: (employee.voluntary_deductions as any)?.union_fees || 0,
            loans: (employee.voluntary_deductions as any)?.loans || 0,
            saccos: (employee.voluntary_deductions as any)?.saccos || 0,
            welfare: (employee.voluntary_deductions as any)?.welfare || 0,
          },
          emergency_contact_name: (employee as any).emergency_contact_name || '',
          emergency_contact_phone: (employee as any).emergency_contact_phone || '',
          emergency_contact_relationship: (employee as any).emergency_contact_relationship || '',
        })
        setIsLoading(false)
      } else {
        toast({
          title: 'Employee not found',
          description: 'The employee you are trying to edit does not exist.',
          variant: 'destructive',
        })
        router.push('/employees')
      }
    } else if (!isEditMode) {
      setIsLoading(false)
    }
  }, [isEditMode, employeeId, employees, router.isReady, router, toast])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {}
    
    // Essential fields only
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.kra_pin.trim()) newErrors.kra_pin = 'KRA PIN is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (formData.basic_salary <= 0) newErrors.basic_salary = 'Basic salary must be greater than 0'
    
    setErrors(newErrors)
    
    // Show toast if there are validation errors
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0] as keyof EmployeeFormData
      const errorMessage = newErrors[firstErrorField] || 'Please fill in all required fields'
      
      toast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'destructive',
      })
      
      // Scroll to first error and focus it
      setTimeout(() => {
        const element = document.getElementById(firstErrorField as string)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(element as HTMLInputElement).focus()
        }
      }, 100)
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsSaving(true)
    try {
      // Use the employeeId from state (already determined above)
      const url = isEditMode && employeeId ? `/api/employees/${employeeId}` : '/api/employees'
      const method = isEditMode && employeeId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          kra_pin: formData.kra_pin,
          position: formData.position,
          basic_salary: formData.basic_salary,
          allowances: formData.allowances,
          helb_amount: formData.helb_amount,
          voluntary_deductions: formData.voluntary_deductions,
          department: formData.department,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          date_of_employment: formData.date_of_employment,
          employment_type: formData.employment_type,
          bank_name: formData.bank_name,
          bank_account_number: formData.bank_account_number,
          bank_branch: formData.bank_branch,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relationship: formData.emergency_contact_relationship,
        }),
      })
      
      const responseData = await res.json()
      
      if (!res.ok) {
        throw new Error(responseData?.error || 'Failed to save employee')
      }
      
      const savedEmployee = responseData.data
      
      console.log('[Employee Save] Saved employee data:', savedEmployee)
      console.log('[Employee Save] Employee ID:', savedEmployee?.id)
      console.log('[Employee Save] Basic Salary:', savedEmployee?.basic_salary)
      
      // Immediately update the query cache with the saved employee data (instant UI update)
      // This MUST happen before any navigation or refetch to ensure UI updates immediately
      queryClient.setQueryData(['employees'], (oldEmployees: any[] | undefined) => {
        if (!oldEmployees) {
          console.log('[Employee Save] No old employees, returning new array')
          return [savedEmployee]
        }
        
        // Check if employee already exists (for updates) - try multiple ID matching strategies
        let existingIndex = oldEmployees.findIndex((e: any) => e.id === savedEmployee.id)
        
        // If not found by ID, try matching by employee_id
        if (existingIndex === -1 && savedEmployee.employee_id) {
          existingIndex = oldEmployees.findIndex((e: any) => e.employee_id === savedEmployee.employee_id)
        }
        
        console.log('[Employee Save] Existing index:', existingIndex, 'Employee ID:', savedEmployee.id, 'Employee ID (string):', savedEmployee.employee_id)
        console.log('[Employee Save] Old employees IDs:', oldEmployees.map((e: any) => ({ id: e.id, employee_id: e.employee_id })))
        
        if (existingIndex >= 0) {
          // Update existing employee - replace with complete saved data
          const updated = [...oldEmployees]
          updated[existingIndex] = { ...savedEmployee } // Create new object to ensure React detects change
          console.log('[Employee Save] Updated employee in cache:', updated[existingIndex])
          console.log('[Employee Save] Updated basic_salary:', updated[existingIndex].basic_salary)
          return updated
        }
        // Add new employee
        console.log('[Employee Save] Adding new employee to cache')
        return [...oldEmployees, savedEmployee]
      })
      
      // Verify the cache update worked and force React Query to notify subscribers
      const verifyCache = queryClient.getQueryData(['employees']) as any[] | undefined
      if (verifyCache) {
        const foundEmployee = verifyCache.find((e: any) => e.id === savedEmployee.id || e.employee_id === savedEmployee.employee_id)
        console.log('[Employee Save] Cache verification - Found employee:', foundEmployee?.id, 'Salary:', foundEmployee?.basic_salary)
        
        // Force React Query to notify all subscribers of the cache change
        // This ensures components using useEmployees() see the update immediately
        queryClient.setQueryData(['employees'], verifyCache)
      }
      
      // Also update dashboard stats cache immediately if we have the data
      const updatedEmployees = queryClient.getQueryData(['employees']) as any[] | undefined
      if (updatedEmployees) {
        const totalEmployees = updatedEmployees.length
        let monthlyPayroll = 0
        updatedEmployees.forEach((emp: any) => {
          const allowances = Object.values(emp.allowances || {}).reduce((sum: number, val: any) => sum + (val || 0), 0)
          monthlyPayroll += (emp.basic_salary || 0) + allowances
        })
        queryClient.setQueryData(['dashboard-stats'], (oldStats: any) => ({
          ...oldStats,
          totalEmployees,
          monthlyPayroll,
        }))
      }
      
      // Immediately update cache with saved employee data for instant UI update
      queryClient.setQueryData(['employees'], (oldEmployees: any[] | undefined) => {
        if (!oldEmployees) return [savedEmployee]
        const existingIndex = oldEmployees.findIndex((e: any) => e.id === savedEmployee.id || e.employee_id === savedEmployee.employee_id)
        if (existingIndex >= 0) {
          const updated = [...oldEmployees]
          updated[existingIndex] = { ...savedEmployee }
          return updated
        }
        return [...oldEmployees, savedEmployee]
      })
      
      toast({
        title: 'Success!',
        description: 'Employee has been saved successfully.',
        className: 'bg-green-600 text-white border-green-700',
      })
      
      // Invalidate and refetch to ensure all components get fresh data from server
      // This ensures data consistency across all pages
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.refetchQueries({ queryKey: ['employees'], type: 'active' }).catch(() => {})
      
      // Also update dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }).catch(() => {})
      queryClient.refetchQueries({ queryKey: ['dashboard-stats'], type: 'active' }).catch(() => {})
      
      // Navigate immediately - cache is already updated above for instant display
      // The refetch will happen in background to ensure data consistency
      // Use a small delay to ensure cache update is processed
      setTimeout(() => {
        router.replace('/employees')
      }, 50)
    } catch (error: any) {
      console.error('Error saving employee:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save employee. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const totalAllowances = Object.values(formData.allowances).reduce((sum, amount) => sum + amount, 0)
  const totalVoluntaryDeductions = Object.values(formData.voluntary_deductions).reduce((sum, amount) => sum + amount, 0)
  const grossSalary = formData.basic_salary + totalAllowances

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full overflow-x-hidden">
        <div className={cn("w-full min-w-0 space-y-6 transition-all duration-300 p-4 sm:p-6")}>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading employee data...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Personal Information */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Personal Information</span>
          </CardTitle>
          <CardDescription className="truncate">Basic employee details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={nextEmployeeId || 'Generating…'}
                readOnly
                placeholder="EMP001"
              />
              <p className="text-xs text-muted-foreground">Auto-generated, sequential and uneditable.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kra_pin">KRA PIN *</Label>
              <Input
                id="kra_pin"
                value={formData.kra_pin}
                onChange={(e) => setFormData({ ...formData, kra_pin: e.target.value })}
                placeholder="A123456789K"
                className={errors.kra_pin ? 'border-red-500' : ''}
              />
              {errors.kra_pin && <p className="text-sm text-red-500">{errors.kra_pin}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Software Developer"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>
          </div>
          
          <Separator />
          <div className="text-sm font-medium">Basic Salary (Required)</div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary (KES) *</Label>
              <Input
                id="basic_salary"
                type="number"
                value={formData.basic_salary || ''}
                onChange={(e) => setFormData({ ...formData, basic_salary: Number(e.target.value) || 0 })}
                placeholder="50000"
                className={errors.basic_salary ? 'border-red-500' : ''}
              />
              {errors.basic_salary && <p className="text-sm text-red-500">{errors.basic_salary}</p>}
            </div>
          </div>

          <Separator />
          <div className="text-sm font-medium text-muted-foreground">Optional Information (Can be added later)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="IT Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <select
                id="employment_type"
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="employee@company.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_employment">Date of Employment</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date_of_employment"
                  type="date"
                  value={formData.date_of_employment}
                  onChange={(e) => setFormData({ ...formData, date_of_employment: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details - Optional */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <CreditCard className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Bank Details (Optional)</span>
          </CardTitle>
          <CardDescription className="truncate">Banking information for salary payments (can be added later)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Equity Bank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_branch">Bank Branch</Label>
              <Input
                id="bank_branch"
                value={formData.bank_branch}
                onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                placeholder="Westlands Branch"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account_number">Account Number</Label>
            <Input
              id="bank_account_number"
              value={formData.bank_account_number}
              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
              placeholder="1234567890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Allowances */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <Building2 className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Allowances</span>
          </CardTitle>
          <CardDescription className="truncate">Monthly allowances and benefits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AllowanceField
              label="Housing Allowance"
              value={formData.allowances.housing}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, housing: value }
              })}
            />
            <AllowanceField
              label="Transport Allowance"
              value={formData.allowances.transport}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, transport: value }
              })}
            />
            <AllowanceField
              label="Medical Allowance"
              value={formData.allowances.medical}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, medical: value }
              })}
            />
            <AllowanceField
              label="Communication Allowance"
              value={formData.allowances.communication}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, communication: value }
              })}
            />
            <AllowanceField
              label="Meals Allowance"
              value={formData.allowances.meals}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, meals: value }
              })}
            />
            <AllowanceField
              label="Fuel Allowance"
              value={formData.allowances.fuel}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, fuel: value }
              })}
            />
            <AllowanceField
              label="Entertainment Allowance"
              value={formData.allowances.entertainment}
              onChange={(value) => setFormData({
                ...formData,
                allowances: { ...formData.allowances, entertainment: value }
              })}
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Allowances</span>
            <span className="font-semibold text-primary">{formatCurrency(totalAllowances)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <Calculator className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Deductions</span>
          </CardTitle>
          <CardDescription className="truncate">HELB and voluntary deductions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="helb_amount">HELB Amount (KES)</Label>
            <Input
              id="helb_amount"
              type="number"
              value={formData.helb_amount || ''}
              onChange={(e) => setFormData({ ...formData, helb_amount: Number(e.target.value) || 0 })}
              placeholder="5000"
            />
            <p className="text-sm text-muted-foreground">
              Enter 0 if employee has no HELB loan
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Voluntary Deductions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AllowanceField
                label="Insurance"
                value={formData.voluntary_deductions.insurance}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, insurance: value }
                })}
              />
              <AllowanceField
                label="Pension Contribution"
                value={formData.voluntary_deductions.pension}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, pension: value }
                })}
              />
              <AllowanceField
                label="Union Fees"
                value={formData.voluntary_deductions.union_fees}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, union_fees: value }
                })}
              />
              <AllowanceField
                label="Loans"
                value={formData.voluntary_deductions.loans}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, loans: value }
                })}
              />
              <AllowanceField
                label="SACCO Contributions"
                value={formData.voluntary_deductions.saccos}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, saccos: value }
                })}
              />
              <AllowanceField
                label="Welfare Fund"
                value={formData.voluntary_deductions.welfare}
                onChange={(value) => setFormData({
                  ...formData,
                  voluntary_deductions: { ...formData.voluntary_deductions, welfare: value }
                })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Voluntary Deductions</span>
            <span className="font-semibold text-red-600">{formatCurrency(totalVoluntaryDeductions)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact - Optional */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Emergency Contact (Optional)</span>
          </CardTitle>
          <CardDescription className="truncate">Emergency contact information (can be added later)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="+254 700 000 000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              value={formData.emergency_contact_relationship}
              onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
              placeholder="Spouse, Parent, Sibling, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="overflow-hidden min-w-0">
        <CardHeader className="min-w-0">
          <CardTitle className="flex items-center gap-2 truncate">
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Salary Summary</span>
          </CardTitle>
          <CardDescription className="truncate">Preview of calculated amounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 min-w-0">
          <div className="flex justify-between min-w-0">
            <span className="text-muted-foreground truncate">Basic Salary</span>
            <span className="font-medium truncate ml-2" title={formatCurrency(formData.basic_salary)}>{formatCurrency(formData.basic_salary)}</span>
          </div>
          <div className="flex justify-between min-w-0">
            <span className="text-muted-foreground truncate">Total Allowances</span>
            <span className="font-medium truncate ml-2" title={formatCurrency(totalAllowances)}>{formatCurrency(totalAllowances)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg min-w-0">
            <span className="truncate">Gross Salary</span>
            <span className="text-primary truncate ml-2" title={formatCurrency(grossSalary)}>{formatCurrency(grossSalary)}</span>
          </div>
          <div className="flex justify-between min-w-0">
            <span className="text-muted-foreground truncate">HELB</span>
            <span className="text-sm truncate ml-2" title={formatCurrency(formData.helb_amount)}>{formatCurrency(formData.helb_amount)}</span>
          </div>
          <div className="flex justify-between min-w-0">
            <span className="text-muted-foreground truncate">Voluntary Deductions</span>
            <span className="text-sm truncate ml-2" title={formatCurrency(totalVoluntaryDeductions)}>{formatCurrency(totalVoluntaryDeductions)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg min-w-0">
            <span className="truncate">Estimated Net Salary</span>
            <span className="text-green-600 truncate ml-2" title={formatCurrency(grossSalary - formData.helb_amount - totalVoluntaryDeductions)}>{formatCurrency(grossSalary - formData.helb_amount - totalVoluntaryDeductions)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            * Final net salary will be calculated after statutory deductions (PAYE, NSSF, SHIF, AHL)
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={() => router.push('/employees')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="kenya-gradient text-white hover:opacity-90 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Employee'}
        </Button>
      </div>
    </div>
  )
}

export default function AddEmployeePage() {
  const router = useRouter()
  const { shouldExpand } = useSidebar()

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="sm:hidden px-4 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold truncate">Add Employee</h1>
                <p className="text-[12px] text-muted-foreground truncate">Register new team member</p>
          </div>
          <div className="kenya-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block px-4 sm:px-6 py-6 border-b bg-card/50">
        <div className="flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-bold transition-all duration-300",
                  shouldExpand ? "text-xl" : "text-xl"
            )}>
              Add New Employee
            </h1>
            <p className={cn(
              "text-muted-foreground transition-all duration-300 truncate",
              shouldExpand ? "text-sm" : "text-base"
            )}>
              Register a new team member and configure their payroll details
            </p>
          </div>
          <div className="kenya-gradient w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "w-full min-w-0 transition-all duration-300",
        "p-4 sm:p-6",
        shouldExpand ? "sm:px-4" : "sm:px-6"
      )}>
        <EmployeeForm />
      </div>
    </div>
  )
}
