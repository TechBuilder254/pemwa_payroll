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
  // Ensure rates are valid numbers, default to 0 if invalid
  const nssfEmployeeRate = typeof settings.nssf_employee_rate === 'number' ? settings.nssf_employee_rate : 0
  const nssfEmployerRate = typeof settings.nssf_employer_rate === 'number' ? settings.nssf_employer_rate : 0
  const nssfMaxContribution = typeof settings.nssf_max_contribution === 'number' ? settings.nssf_max_contribution : 0
  
  const nssfEmployee = Math.min(grossSalary * nssfEmployeeRate, nssfMaxContribution)
  const nssfEmployer = Math.min(grossSalary * nssfEmployerRate, nssfMaxContribution)

  // SHIF (Social Health Insurance Fund) - employee only (employer does NOT pay)
  // Always set employer rate to 0 regardless of settings value
  const shifEmployeeRate = typeof settings.shif_employee_rate === 'number' ? settings.shif_employee_rate : 0
  const shifEmployee = grossSalary * shifEmployeeRate
  const shifEmployer = 0 // Employer does NOT pay SHIF (enforced, not from settings)

  // AHL (Affordable Housing Levy) - 1.5% each (employee AND employer both pay, totaling 3%)
  const ahlEmployeeRate = typeof settings.ahl_employee_rate === 'number' ? settings.ahl_employee_rate : 0
  const ahlEmployerRate = typeof settings.ahl_employer_rate === 'number' ? settings.ahl_employer_rate : 0
  const ahlEmployee = grossSalary * ahlEmployeeRate
  const ahlEmployer = grossSalary * ahlEmployerRate

  // HELB (from employee record)
  const helb = employee.helb_amount || 0

  // Taxable income (gross - employee NSSF - employee SHIF)
  const taxableIncome = Math.max(0, grossSalary - nssfEmployee - shifEmployee)

  // PAYE calculation using progressive tax brackets
  const payeBeforeRelief = calculatePAYE(taxableIncome, settings)

  // Personal relief
  const personalRelief = typeof settings.personal_relief === 'number' ? settings.personal_relief : 0

  // PAYE after relief (cannot be negative)
  const payeAfterRelief = Math.max(0, payeBeforeRelief - personalRelief)

  // Total deductions
  const totalDeductions = nssfEmployee + shifEmployee + ahlEmployee + helb + voluntaryDeductionsTotal + payeAfterRelief

  // Net salary
  const netSalary = grossSalary - totalDeductions

  // Total employer cost (NSSF + AHL, but NOT SHIF)
  const totalEmployerCost = grossSalary + nssfEmployer + ahlEmployer

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
  if (taxableIncome <= 0) return 0
  
  // Ensure brackets are sorted by min value (ascending)
  const sortedBrackets = [...settings.paye_brackets].sort((a, b) => a.min - b.min)
  
  let paye = 0
  let remainingIncome = taxableIncome

  for (const bracket of sortedBrackets) {
    if (remainingIncome <= 0) break
    
    const bracketMin = bracket.min || 0
    const bracketMax = bracket.max === null ? Infinity : bracket.max
    
    // Skip if income is below this bracket's minimum
    if (remainingIncome <= bracketMin) break

    // Calculate the amount of income that falls within this bracket
    const bracketStart = Math.max(bracketMin, 0)
    const bracketEnd = bracketMax === null ? remainingIncome : Math.min(bracketMax, remainingIncome)
    
    // Calculate taxable amount in this bracket
    const taxableInBracket = Math.max(0, bracketEnd - bracketStart + (bracketStart === 0 ? 0 : 1))
    const actualTaxable = Math.min(taxableInBracket, remainingIncome)
    
    if (actualTaxable > 0) {
      paye += actualTaxable * (bracket.rate || 0)
      remainingIncome -= actualTaxable
    }
  }

  return Math.max(0, paye)
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