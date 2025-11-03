import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
// Default to provided Supabase project if not in environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    'https://ksuxoaddqqffoueuzmuk.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdXhvYWRkcXFmZm91ZXV6bXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTE4OTMsImV4cCI6MjA3NzU4Nzg5M30.QJ0Z4hqNKiavQ_2SDXwkIhQK47dOqmrDGOpYK-MFesA'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

if (typeof window !== 'undefined') {
  console.log('✅ Supabase client initialized:', supabaseUrl)
}

// Database types
export interface Employee {
  id: string
  name: string
  employee_id: string
  kra_pin: string
  position: string
  basic_salary: number
  allowances: Allowances
  helb_amount: number // HELB loan deduction (if applicable)
  voluntary_deductions: VoluntaryDeductions
  created_at: string
  updated_at: string
}

export interface Allowances {
  housing?: number
  transport?: number
  medical?: number
  communication?: number
  meals?: number
  other?: number
}

export interface VoluntaryDeductions {
  insurance?: number
  pension?: number
  union_fees?: number
  loans?: number
  other?: number
}

export interface PayrollRecord {
  id: string
  employee_id: string
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

export interface P9Record {
  id: string
  employee_id: string
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
  created_at: string
}

// Configurable payroll settings (stored in Supabase) - Updated for 2025 Kenyan requirements
export interface TaxBracketSetting {
  min: number
  max: number | null // null means no upper bound
  rate: number // e.g., 0.10 for 10%
}

export interface PayrollSettings {
  id: string
  personal_relief: number // 2400 KES by policy (configurable)
  nssf_employee_rate: number // e.g., 0.06 (up to 4320 KES)
  nssf_employer_rate: number // e.g., 0.06 (up to 4320 KES)
  nssf_max_contribution: number // 4320 KES maximum
  shif_employee_rate: number // 2.75% of gross salary
  shif_employer_rate: number // 2.75% of gross salary
  ahl_employee_rate: number // 1.5% of gross salary (Affordable Housing Levy)
  ahl_employer_rate: number // 1.5% of gross salary
  paye_brackets: TaxBracketSetting[] // ordered low to high
  effective_from: string // ISO date
  effective_to: string | null
  is_active: boolean
  created_at: string
}

// Fetch the currently active payroll settings
export async function fetchActivePayrollSettings(): Promise<PayrollSettings> {
  const { data, error } = await supabase
    .from('payroll_settings')
    .select('id, personal_relief, nssf_employee_rate, nssf_employer_rate, nssf_max_contribution, shif_employee_rate, shif_employer_rate, ahl_employee_rate, ahl_employer_rate, paye_brackets, effective_from, effective_to, is_active, created_at')
    .eq('is_active', true)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Failed to load payroll settings: ${error.message}`)
  }

  return data as unknown as PayrollSettings
}
