import type { Employee, PayrollRecord, Allowances, VoluntaryDeductions, PayrollSettings } from './supabase'

export interface PayrollCalculation {
  grossSalary: number
  basicSalary: number
  allowancesTotal: number
  overtime: number
  bonuses: number
  nssfEmployee: number
  nssfEmployer: number
  shifEmployee: number
  shifEmployer: number
  ahlEmployee: number
  ahlEmployer: number
  helb: number
  voluntaryDeductionsTotal: number
  taxableIncome: number
  payeBeforeRelief: number
  personalRelief: number
  payeAfterRelief: number
  totalDeductions: number
  netSalary: number
  totalEmployerCost: number
}

export const calculatePayroll = (
  employee: Employee,
  allowances: Allowances = {},
  voluntaryDeductions: VoluntaryDeductions = {},
  bonuses: number = 0,
  overtime: number = 0,
  settings: PayrollSettings
): PayrollCalculation => {
  // Calculate allowances total
  const allowancesTotal = Object.values(allowances).reduce((sum, amount) => sum + (amount || 0), 0)
  
  // Calculate voluntary deductions total
  const voluntaryDeductionsTotal = Object.values(voluntaryDeductions).reduce((sum, amount) => sum + (amount || 0), 0)
  
  // Calculate gross salary
  const grossSalary = employee.basic_salary + allowancesTotal + bonuses + overtime

  // NSSF calculations (capped at maximum contribution)
  const nssfEmployee = Math.min(grossSalary * settings.nssf_employee_rate, settings.nssf_max_contribution)
  const nssfEmployer = Math.min(grossSalary * settings.nssf_employer_rate, settings.nssf_max_contribution)

  // SHIF (Social Health Insurance Fund) - 2.75% each
  const shifEmployee = grossSalary * settings.shif_employee_rate
  const shifEmployer = grossSalary * settings.shif_employer_rate

  // AHL (Affordable Housing Levy) - 1.5% each
  const ahlEmployee = grossSalary * settings.ahl_employee_rate
  const ahlEmployer = grossSalary * settings.ahl_employer_rate

  // HELB (from employee record)
  const helb = employee.helb_amount || 0

  // Taxable income (gross - employee NSSF - employee SHIF)
  const taxableIncome = grossSalary - nssfEmployee - shifEmployee

  // PAYE calculation using progressive tax brackets
  const payeBeforeRelief = calculatePAYE(taxableIncome, settings)

  // Personal relief (standard 2,400 KES)
  const personalRelief = settings.personal_relief

  // PAYE after relief
  const payeAfterRelief = Math.max(payeBeforeRelief - personalRelief, 0)

  // Total deductions
  const totalDeductions = nssfEmployee + shifEmployee + ahlEmployee + helb + voluntaryDeductionsTotal + payeAfterRelief

  // Net salary
  const netSalary = grossSalary - totalDeductions

  // Total employer cost
  const totalEmployerCost = grossSalary + nssfEmployer + shifEmployer + ahlEmployer

  return {
    grossSalary,
    basicSalary: employee.basic_salary,
    allowancesTotal,
    overtime,
    bonuses,
    nssfEmployee,
    nssfEmployer,
    shifEmployee,
    shifEmployer,
    ahlEmployee,
    ahlEmployer,
    helb,
    voluntaryDeductionsTotal,
    taxableIncome,
    payeBeforeRelief,
    personalRelief,
    payeAfterRelief,
    totalDeductions,
    netSalary,
    totalEmployerCost,
  }
}

const calculatePAYE = (taxableIncome: number, settings: PayrollSettings): number => {
  let paye = 0
  let remainingIncome = taxableIncome

  for (const bracket of settings.paye_brackets) {
    if (remainingIncome <= 0) break

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === null ? remainingIncome : bracket.max - bracket.min + 1
    )

    paye += taxableInBracket * bracket.rate
    remainingIncome -= taxableInBracket
  }

  return paye
}

// Reuse a single Intl.NumberFormat instance for performance
const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCurrency = (amount: number): string => {
  return currencyFormatter.format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export const getMonthName = (month: string | Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(month))
}

// Helper function to get default 2025 Kenyan payroll settings
// Default settings are not hardcoded; all settings are fetched from the database.