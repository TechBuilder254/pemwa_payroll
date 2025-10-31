import * as XLSX from 'xlsx'

export interface PayslipData {
  employee: {
    name: string
    employee_id: string
    kra_pin?: string
  }
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
  paye_after_relief: number
  total_deductions: number
  net_salary: number
  total_employer_cost: number
}

export interface RemittanceData {
  month: string
  employees: PayslipData[]
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
  }
}

export interface P9Data {
  employee: {
    name: string
    employee_id: string
    kra_pin: string
  }
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
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}

export const generatePayslipExcel = (data: PayslipData): void => {
  const workbook = XLSX.utils.book_new()
  
  // Payslip data
  const payslipData: Array<(string | number)[]> = [
    ['PEMWA PAYROLL SYSTEM'],
    ['Monthly Payslip'],
    [''],
    ['Employee Information'],
    ['Employee Name', data.employee.name],
    ['Employee ID', data.employee.employee_id],
    ['KRA PIN', data.employee.kra_pin || ''],
    ['Period', formatDate(data.month)],
    [''],
    ['Earnings'],
    ['Basic Salary', data.basic_salary],
    ['Allowances', data.allowances_total],
    ['Overtime', data.overtime],
    ['Bonuses', data.bonuses],
    ['Gross Salary', data.gross_salary],
    [''],
    ['Deductions'],
    ['NSSF (Employee)', data.nssf_employee],
    ['SHIF (Employee)', data.shif_employee],
    ['AHL (Employee)', data.ahl_employee],
    ['PAYE', data.paye_after_relief],
    ['HELB', data.helb],
    ['Voluntary Deductions', data.voluntary_deductions_total],
    ['Total Deductions', data.total_deductions],
    [''],
    ['Net Salary', data.net_salary],
    [''],
    ['Employer Contributions'],
    ['NSSF (Employer)', data.nssf_employer],
    ['SHIF (Employer)', data.shif_employer],
    ['AHL (Employer)', data.ahl_employer],
    ['Total Employer Cost', data.total_employer_cost],
    [''],
    ['Generated on', new Date().toLocaleDateString()]
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(payslipData)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 }
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip')
  
  // Download
  XLSX.writeFile(workbook, `payslip-${data.employee.employee_id}-${data.month}.xlsx`)
}

export const generateRemittanceExcel = (data: RemittanceData): void => {
  const workbook = XLSX.utils.book_new()
  
  // Summary sheet
  const summaryData: Array<(string | number)[]> = [
    ['PEMWA PAYROLL SYSTEM'],
    ['Government Remittance Summary'],
    [`Month: ${formatDate(data.month)}`],
    [''],
    ['Agency Totals'],
    ['NSSF (Employee)', data.totals.nssfEmployee],
    ['NSSF (Employer)', data.totals.nssfEmployer],
    ['NSSF Total', data.totals.nssfTotal],
    [''],
    ['SHIF (Employee)', data.totals.shifEmployee],
    ['SHIF (Employer)', data.totals.shifEmployer],
    ['SHIF Total', data.totals.shifTotal],
    [''],
    ['AHL (Employee)', data.totals.ahlEmployee],
    ['AHL (Employer)', data.totals.ahlEmployer],
    ['AHL Total', data.totals.ahlTotal],
    [''],
    ['PAYE Total', data.totals.payeTotal],
    [''],
    ['Summary'],
    ['Total Government Remittances', 
      data.totals.nssfTotal + 
      data.totals.shifTotal + 
      data.totals.ahlTotal + 
      data.totals.payeTotal
    ],
    ['Total Net Payroll', data.totals.totalNetPayroll],
    ['Total Employer Cost', data.totals.totalEmployerCost],
    [''],
    ['Generated on', new Date().toLocaleDateString()]
  ]
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 20 }
  ]
  
  // Employee breakdown sheet
  const employeeData: Array<(string | number)[]> = [
    ['Employee', 'Gross Salary', 'PAYE', 'NSSF Emp', 'NSSF Er', 'SHIF Emp', 'SHIF Er', 'AHL Emp', 'AHL Er', 'Net Salary']
  ]
  
  data.employees.forEach(emp => {
    employeeData.push([
      emp.employee.name,
      emp.gross_salary,
      emp.paye_after_relief,
      emp.nssf_employee,
      emp.nssf_employer,
      emp.shif_employee,
      emp.shif_employer,
      emp.ahl_employee,
      emp.ahl_employer,
      emp.net_salary
    ])
  })
  
  const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData)
  employeeSheet['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 }
  ]
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee Breakdown')
  
  // Download
  XLSX.writeFile(workbook, `remittance-${data.month}.xlsx`)
}

export const generateP9Excel = (data: P9Data): void => {
  const workbook = XLSX.utils.book_new()
  
  const p9Data: Array<(string | number)[]> = [
    ['PEMWA PAYROLL SYSTEM'],
    ['P9 Form - Annual Tax Summary'],
    [''],
    ['Employee Information'],
    ['Employee Name', data.employee.name],
    ['Employee ID', data.employee.employee_id],
    ['KRA PIN', data.employee.kra_pin],
    ['Tax Year', data.year],
    [''],
    ['Annual Earnings'],
    ['Basic Salary', data.basic_salary_total],
    ['Allowances', data.allowances_total],
    ['Gross Salary', data.gross_salary_total],
    [''],
    ['Annual Deductions'],
    ['NSSF (Employee)', data.nssf_employee_total],
    ['SHIF (Employee)', data.shif_employee_total],
    ['AHL (Employee)', data.ahl_employee_total],
    ['PAYE', data.paye_total],
    ['HELB', data.helb_total],
    ['Voluntary Deductions', data.voluntary_deductions_total],
    ['Total Deductions', 
      data.nssf_employee_total + 
      data.shif_employee_total + 
      data.ahl_employee_total + 
      data.paye_total + 
      data.helb_total + 
      data.voluntary_deductions_total
    ],
    [''],
    ['Net Salary', data.net_salary_total],
    [''],
    ['Employer Contributions'],
    ['NSSF (Employer)', data.nssf_employer_total],
    ['SHIF (Employer)', data.shif_employer_total],
    ['AHL (Employer)', data.ahl_employer_total],
    ['Total Employer Cost', data.total_employer_cost],
    [''],
    ['Generated on', new Date().toLocaleDateString()]
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(p9Data)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 }
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'P9 Form')
  
  // Download
  XLSX.writeFile(workbook, `p9-${data.employee.employee_id}-${data.year}.xlsx`)
}
