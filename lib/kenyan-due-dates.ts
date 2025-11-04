/**
 * Kenyan Government Remittance Due Dates
 * 
 * Based on KRA requirements:
 * - Monthly PAYE, NSSF, SHIF, AHL: Due by 9th of following month
 * - Annual P9/P10 Returns: Due by last day of February following tax year
 */

export interface DueDateInfo {
  dueDate: Date
  dueDateFormatted: string
  daysRemaining: number
  isOverdue: boolean
  isDueSoon: boolean // Within 7 days
}

/**
 * Calculate the due date for monthly remittances (PAYE, NSSF, SHIF, AHL)
 * Due date is the 9th of the following month
 * 
 * @param month - Month string in format "YYYY-MM" (e.g., "2025-01")
 * @returns Due date information
 */
export function getMonthlyRemittanceDueDate(month: string): DueDateInfo {
  // Parse the month string (YYYY-MM)
  const [year, monthNum] = month.split('-').map(Number)
  
  // Get the next month (remittance is due in the following month)
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1
  const nextYear = monthNum === 12 ? year + 1 : year
  
  // Due date is the 9th of the next month
  const dueDate = new Date(nextYear, nextMonth - 1, 9) // Month is 0-indexed in Date
  
  // Format the date
  const dueDateFormatted = dueDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  // Calculate days remaining
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysRemaining < 0
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 7
  
  return {
    dueDate,
    dueDateFormatted,
    daysRemaining,
    isOverdue,
    isDueSoon
  }
}

/**
 * Calculate the due date for annual P9/P10 tax returns
 * Due date is the last day of February following the tax year
 * 
 * @param taxYear - Tax year (e.g., 2024)
 * @returns Due date information
 */
export function getAnnualTaxReturnDueDate(taxYear: number): DueDateInfo {
  // Due date is February 28/29 of the following year
  const dueYear = taxYear + 1
  // Check if it's a leap year for February 29
  const isLeapYear = (dueYear % 4 === 0 && dueYear % 100 !== 0) || (dueYear % 400 === 0)
  const lastDay = isLeapYear ? 29 : 28
  
  const dueDate = new Date(dueYear, 1, lastDay) // February is month 1 (0-indexed)
  
  // Format the date
  const dueDateFormatted = dueDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  // Calculate days remaining
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysRemaining < 0
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 30 // 30 days warning for annual returns
  
  return {
    dueDate,
    dueDateFormatted,
    daysRemaining,
    isOverdue,
    isDueSoon
  }
}

/**
 * Get a friendly message about the due date status
 */
export function getDueDateMessage(dueDateInfo: DueDateInfo, type: 'monthly' | 'annual'): string {
  if (dueDateInfo.isOverdue) {
    return `Overdue by ${Math.abs(dueDateInfo.daysRemaining)} day${Math.abs(dueDateInfo.daysRemaining) !== 1 ? 's' : ''}`
  }
  
  if (dueDateInfo.isDueSoon) {
    if (type === 'monthly') {
      return `Due in ${dueDateInfo.daysRemaining} day${dueDateInfo.daysRemaining !== 1 ? 's' : ''}`
    } else {
      return `Due in ${dueDateInfo.daysRemaining} day${dueDateInfo.daysRemaining !== 1 ? 's' : ''}`
    }
  }
  
  return `Due in ${dueDateInfo.daysRemaining} day${dueDateInfo.daysRemaining !== 1 ? 's' : ''}`
}

/**
 * Get all remittance types that need to be paid
 */
export function getRemittanceTypes(): Array<{ name: string; description: string; dueDate: string }> {
  return [
    {
      name: 'PAYE',
      description: 'Pay As You Earn Tax',
      dueDate: '9th of following month'
    },
    {
      name: 'NSSF',
      description: 'National Social Security Fund',
      dueDate: '9th of following month'
    },
    {
      name: 'SHIF',
      description: 'Social Health Insurance Fund (formerly NHIF)',
      dueDate: '9th of following month'
    },
    {
      name: 'AHL',
      description: 'Affordable Housing Levy',
      dueDate: '9th of following month'
    }
  ]
}

