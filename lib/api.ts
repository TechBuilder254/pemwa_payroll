import type { Employee, PayrollSettings } from '@/lib/supabase'

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch('/api/employees')
  if (!res.ok) throw new Error('Failed to fetch employees')
  const json = await res.json()
  return json.data as Employee[]
}

export async function createEmployee(payload: Partial<Employee>): Promise<Employee> {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create employee')
  const json = await res.json()
  return json.data as Employee
}

export async function updateEmployee(id: string, payload: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || 'Failed to update employee')
  }
  const json = await res.json()
  return json.data as Employee
}

export async function fetchEmployee(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`)
  if (!res.ok) throw new Error('Failed to fetch employee')
  const json = await res.json()
  return json.data as Employee
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || 'Failed to delete employee')
  }
}

export async function fetchPayrollSettings(): Promise<PayrollSettings> {
  const res = await fetch('/api/payroll/settings')
  if (!res.ok) throw new Error('Failed to fetch payroll settings')
  const json = await res.json()
  return json.data as PayrollSettings
}

export async function updatePayrollSettings(payload: Partial<PayrollSettings>): Promise<PayrollSettings> {
  const res = await fetch('/api/payroll/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update payroll settings')
  const json = await res.json()
  return json.data as PayrollSettings
}

export interface DashboardStats {
  totalEmployees: number
  monthlyPayroll: number
  totalDeductions: number
  netPayroll: number
  employerCost: number
  recentPayrolls: Array<{
    month: string
    employees: number
    netTotal: number
    status: string
  }>
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats')
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  const json = await res.json()
  return json.data as DashboardStats
}

export interface PayrollRecord {
  employee_id: string
  gross_salary: number
  basic_salary: number
  allowances_total: number
  overtime: number
  bonuses: number
  nssf_employee: number
  nssf_employer: number
  shif_employee: number
  shif_employer: number
  ahl_employee: number
  ahl_employer: number
  helb: number
  voluntary_deductions_total: number
  paye_before_relief: number
  personal_relief: number
  paye_after_relief: number
  total_deductions: number
  net_salary: number
  total_employer_cost: number
}

export interface ProcessPayrollRequest {
  period_month: string
  records: PayrollRecord[]
  notes?: string
}

export interface ProcessPayrollResponse {
  payroll_run_id: string
  period_month: string
  records_inserted: number
  records_updated?: number
  records_created?: number
  records_failed?: number
  records_unchanged?: number
  message?: string
  records?: Array<{
    id: string
    employee_id: string
    month: string
    net_salary: number
  }>
  updated_records?: Array<{
    id: string
    employee_id: string
    month: string
    net_salary: number
  }>
  new_records?: Array<{
    id: string
    employee_id: string
    month: string
    net_salary: number
  }>
  errors?: string[]
}

export async function processPayroll(payload: ProcessPayrollRequest): Promise<ProcessPayrollResponse> {
  try {
    console.log('[processPayroll] Sending request:', {
      url: '/api/payroll/process',
      payload: {
        period_month: payload.period_month,
        record_count: payload.records.length,
        employee_ids: payload.records.map(r => r.employee_id)
      }
    })

    let res
    try {
      res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (fetchError: any) {
      console.error('[processPayroll] Fetch error:', fetchError)
      if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please make sure the API server is running on port 5174.')
      }
      throw new Error(`Network error: ${fetchError.message || 'Failed to connect to server'}`)
    }
    
    console.log('[processPayroll] Response status:', res.status, res.statusText)
    
    if (!res.ok && res.status === 0) {
      throw new Error('Cannot connect to server. The API server may not be running.')
    }
    
    const responseText = await res.text()
    console.log('[processPayroll] Raw response length:', responseText.length)
    console.log('[processPayroll] Raw response:', responseText.substring(0, 500))
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty response from server')
    }
    
    let json
    try {
      json = JSON.parse(responseText)
    } catch (parseError: any) {
      console.error('[processPayroll] Failed to parse JSON:', parseError)
      console.error('[processPayroll] Response text:', responseText)
      throw new Error(`Invalid JSON response from server: ${parseError.message}`)
    }
    
    console.log('[processPayroll] Parsed JSON keys:', Object.keys(json))
    console.log('[processPayroll] Parsed JSON:', json)
    
    if (!res.ok) {
      // Handle error responses with details
      let errorMessage = json.error || 'Failed to process payroll'
      
      // Include details if available (for validation errors, etc.)
      if (json.details && Array.isArray(json.details) && json.details.length > 0) {
        errorMessage += ': ' + json.details.join('; ')
      }
      
      console.error('[processPayroll] API error:', { status: res.status, error: errorMessage, response: json })
      throw new Error(errorMessage)
    }
    
    // Handle both { data: {...} } and direct response structures
    if (json.data) {
      console.log('[processPayroll] Returning data from json.data:', json.data)
      return json.data as ProcessPayrollResponse
    }
    
    // If the response has the fields directly (not wrapped in data), use it
    if (json.records_inserted !== undefined || json.payroll_run_id !== undefined) {
      console.warn('[processPayroll] Response not wrapped in data object, using direct structure:', json)
      return json as ProcessPayrollResponse
    }
    
    // Neither structure found
    console.error('[processPayroll] Unexpected API response structure:', { 
      status: res.status, 
      response: json,
      responseKeys: Object.keys(json || {}),
      hasData: !!json?.data,
      hasRecordsInserted: json?.records_inserted !== undefined,
      hasPayrollRunId: json?.payroll_run_id !== undefined
    })
    throw new Error(`Invalid response format from server. Got keys: ${Object.keys(json || {}).join(', ')}`)
  } catch (error: any) {
    // Re-throw if it's already an Error (with our custom message)
    if (error instanceof Error) {
      console.error('[processPayroll] Error caught and re-throwing:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      })
      throw error
    }
    // Otherwise wrap it
    console.error('[processPayroll] Unexpected non-Error caught:', error)
    throw new Error(error?.message || 'Failed to process payroll')
  }
}

export interface Payslip {
  id: string
  employee_id: string
  employee_name: string
  month: string
  gross_salary: number
  basic_salary: number
  allowances_total: number
  overtime: number
  bonuses: number
  nssf_employee: number
  nssf_employer: number
  shif_employee: number
  shif_employer: number
  ahl_employee: number
  ahl_employer: number
  helb: number
  voluntary_deductions_total: number
  paye_before_relief: number
  personal_relief: number
  paye_after_relief: number
  total_deductions: number
  net_salary: number
  total_employer_cost: number
  created_at: string
}

export async function fetchPayslips(employeeId?: string, month?: string): Promise<Payslip[]> {
  const params = new URLSearchParams()
  if (employeeId) params.append('employee_id', employeeId)
  if (month) params.append('month', month)
  const res = await fetch(`/api/payslips?${params.toString()}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch payslips' }))
    throw new Error(error.error || 'Failed to fetch payslips')
  }
  const json = await res.json()
  return (json.data || []) as Payslip[]
}

export interface RemittanceData {
  month: string
  totals: {
    nssfEmployee: number
    nssfEmployer: number
    nssfTotal: number
    shifEmployee: number
    shifEmployer: number
    shifTotal: number
    ahlEmployee: number
    ahlEmployer: number
    ahlTotal: number
    payeTotal: number
    totalNetPayroll: number
    totalEmployerCost: number
    employeeCount: number
  }
  employees: Array<{
    employee_id: string
    employee_code: string
    employee_name: string
    gross_salary: number
    nssf_employee: number
    nssf_employer: number
    shif_employee: number
    shif_employer: number
    ahl_employee: number
    ahl_employer: number
    paye: number
    net_salary: number
    employer_cost: number
  }>
}

export async function fetchRemittances(month: string): Promise<RemittanceData> {
  const res = await fetch(`/api/remittances?month=${month}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch remittances' }))
    throw new Error(error.error || 'Failed to fetch remittances')
  }
  const json = await res.json()
  // If no data exists, return empty structure
  if (!json.data) {
    return {
      month,
      totals: {
        nssfEmployee: 0,
        nssfEmployer: 0,
        nssfTotal: 0,
        shifEmployee: 0,
        shifEmployer: 0,
        shifTotal: 0,
        ahlEmployee: 0,
        ahlEmployer: 0,
        ahlTotal: 0,
        payeTotal: 0,
        totalNetPayroll: 0,
        totalEmployerCost: 0,
        employeeCount: 0
      },
      employees: []
    }
  }
  return json.data as RemittanceData
}

export interface P9FormData {
  id: string
  employee_id: string
  employee_name: string
  kra_pin: string
  year: number
  gross_salary_total: number
  basic_salary_total: number
  allowances_total: number
  nssf_employee_total: number
  nssf_employer_total: number
  shif_employee_total: number
  shif_employer_total: number
  ahl_employee_total: number
  ahl_employer_total: number
  helb_total: number
  voluntary_deductions_total: number
  paye_total: number
  net_salary_total: number
  total_employer_cost: number
  months_count: number
  status: 'completed' | 'pending'
  monthly_breakdown: Array<{
    month: string
    month_name: string
    gross_salary: number
    net_salary: number
    paye: number
    nssf_employee: number
    nssf_employer: number
    shif_employee: number
    ahl_employee: number
    ahl_employer: number
  }>
}

export async function fetchP9Form(employeeId: string, year: number): Promise<P9FormData> {
  const res = await fetch(`/api/p9?employee_id=${employeeId}&year=${year}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch P9 form' }))
    throw new Error(error.error || 'Failed to fetch P9 form')
  }
  const json = await res.json()
  return json.data as P9FormData
}

// ==================== Authentication ====================

export interface User {
  id: string
  email: string
  name: string
  role: string
  last_login?: string
  created_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Use relative URLs - works for both local dev (Vite proxy) and production (Vercel)
  const apiUrl = endpoint.startsWith('http') 
    ? endpoint 
    : endpoint.startsWith('/api') 
      ? endpoint 
      : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  
  // For auth endpoints, disable caching to ensure fresh checks
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  }
  
  // Disable cache for auth endpoints
  if (endpoint.includes('/auth/')) {
    fetchOptions.cache = 'no-store'
    if (!headers['Cache-Control']) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      headers['Pragma'] = 'no-cache'
    }
  }
  
  const response = await fetch(apiUrl, fetchOptions)

  return response
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to login' }))
    throw new Error(error.error || 'Failed to login')
  }

  const json = await res.json()
  const data = json.data as AuthResponse

  // Store token in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token)
  }

  return data
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to register' }))
    throw new Error(error.error || 'Failed to register')
  }

  const json = await res.json()
  const response = json.data as AuthResponse

  // Store token in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', response.token)
  }

  return response
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }
}

export async function getCurrentUser(): Promise<User> {
  // Check if token exists first
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    : null
  
  if (!token) {
    // No token means not authenticated
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    throw new Error('Not authenticated')
  }

  const res = await apiFetch('/api/auth/me', {
    // Disable cache to ensure fresh auth check
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  })

  // 304 means cached response - but for auth we need fresh data
  // Treat it as OK but still parse response
  if (res.status === 304) {
    // For 304, try to parse if possible, otherwise treat as error
    // (304 should not have body, so this will likely fail)
    try {
      const json = await res.json()
      return json.data as User
    } catch {
      // 304 with no body - treat as success but return cached user
      // Or better: make a fresh request without cache
      const freshRes = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!freshRes.ok) {
        if (freshRes.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
        }
        const error = await freshRes.json().catch(() => ({ error: 'Failed to get user' }))
        throw new Error(error.error || 'Failed to get user')
      }
      
      const freshJson = await freshRes.json()
      return freshJson.data as User
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    }
    const error = await res.json().catch(() => ({ error: 'Failed to get user' }))
    throw new Error(error.error || 'Failed to get user')
  }

  const json = await res.json()
  return json.data as User
}

