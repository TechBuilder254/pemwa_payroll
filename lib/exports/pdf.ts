import jsPDF from 'jspdf'

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

export const generatePayslipPDF = async (data: PayslipData): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const left = margin
  const right = pageWidth - margin
  const centerX = pageWidth / 2
  let y = margin

  // Color scheme - Professional blue and green
  const primaryColor = [30, 58, 138] // #1e3a8a - Blue
  const accentColor = [132, 204, 22] // #84cc16 - Green
  const lightGray = [245, 245, 245] // #f5f5f5
  const darkGray = [100, 100, 100]
  const borderGray = [220, 220, 220]

  // Helper function to draw rounded rectangle (simulated)
  const drawRoundedBox = (x: number, y: number, width: number, height: number, fill?: number[]) => {
    if (fill) {
      doc.setFillColor(fill[0], fill[1], fill[2])
      doc.rect(x, y, width, height, 'F')
    }
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.3)
    doc.rect(x, y, width, height)
  }

  // Helper function to draw horizontal line
  const drawLine = (yy: number, color: number[] = borderGray, width: number = 0.5) => {
    doc.setDrawColor(color[0], color[1], color[2])
    doc.setLineWidth(width)
    doc.line(left, yy, right, yy)
  }

  // Helper function to add text with styling
  const addText = (text: string, x: number, yy: number, options: {
    align?: 'left' | 'center' | 'right'
    fontSize?: number
    bold?: boolean
    color?: number[]
  } = {}) => {
    if (options.fontSize) doc.setFontSize(options.fontSize)
    if (options.bold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    if (options.color) {
      doc.setTextColor(options.color[0], options.color[1], options.color[2])
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.text(text, x, yy, { align: options.align || 'left' })
    doc.setTextColor(0, 0, 0) // Reset to black
  }

  // Helper function to add section header
  const addSectionHeader = (title: string, yy: number): number => {
    // Background box for header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(left, yy - 5, right - left, 8, 2, 2, 'F')
    addText(title, left + 3, yy, { fontSize: 11, bold: true, color: [255, 255, 255] })
    return yy + 6
  }

  // Helper function to add table row
  const addTableRow = (label: string, amount: number, yy: number, isTotal: boolean = false): number => {
    const rowHeight = 6
    const labelX = left + 3
    const amountX = right - 3
    
    // Alternate row background for better readability
    if (!isTotal) {
      const rowIndex = Math.floor((yy - 60) / rowHeight)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
        doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      }
    } else {
      // Highlight total rows
      doc.setFillColor(240, 248, 255)
      doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      drawLine(yy - 4, darkGray, 0.8)
    }

    // Add label
    addText(label, labelX, yy, { 
      fontSize: isTotal ? 10.5 : 10, 
      bold: isTotal 
    })
    
    // Add amount
    addText(formatCurrency(amount), amountX, yy, { 
      align: 'right', 
      fontSize: isTotal ? 10.5 : 10, 
      bold: isTotal 
    })
    
    return yy + rowHeight
  }

  // Try to load and add company logo
  let logoLoaded = false
  try {
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.src = '/logo/logo1.png'
    
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!logoLoaded) {
          y += 10
          resolve(true)
        }
      }, 2000)

      logoImg.onload = () => {
        try {
          logoLoaded = true
          clearTimeout(timeout)
          // Add logo at top right with better positioning
          const logoSize = 18
          doc.addImage(logoImg, 'PNG', right - logoSize - 5, y, logoSize, logoSize)
          resolve(true)
        } catch (error) {
          console.warn('Could not add logo to PDF:', error)
          clearTimeout(timeout)
          y += 10
          resolve(true)
        }
      }
      logoImg.onerror = () => {
        clearTimeout(timeout)
        y += 10
        resolve(true)
      }
    })
  } catch (error) {
    console.warn('Logo loading error:', error)
    y += 10
  }

  // Professional Header Section with gradient-like effect
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(left, y, right - left, 25, 'F')
  
  // White text on colored background
  y += 8
  addText('PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 20, bold: true, color: [255, 255, 255] })
  y += 7
  addText('PAYROLL SYSTEM', centerX, y, { align: 'center', fontSize: 12, color: [255, 255, 255] })
  y += 6
  addText('MONTHLY PAYSLIP', centerX, y, { align: 'center', fontSize: 14, bold: true, color: [255, 255, 255] })
  y += 12

  // Employee Information Section - Boxed
  const empInfoHeight = data.employee.kra_pin ? 40 : 34
  drawRoundedBox(left, y, right - left, empInfoHeight, lightGray)
  y += 6
  addText('EMPLOYEE INFORMATION', left + 3, y, { fontSize: 11, bold: true, color: primaryColor })
  y += 8
  
  const infoLeft = left + 5
  const infoRight = centerX + 20
  addText(`Name:`, infoLeft, y, { fontSize: 9.5, color: darkGray })
  addText(data.employee.name, infoLeft + 15, y, { fontSize: 10, bold: true })
  addText(`Period:`, infoRight, y, { fontSize: 9.5, color: darkGray })
  addText(formatDate(data.month), infoRight + 15, y, { fontSize: 10, bold: true })
  y += 7
  
  addText(`ID:`, infoLeft, y, { fontSize: 9.5, color: darkGray })
  addText(data.employee.employee_id, infoLeft + 15, y, { fontSize: 10 })
  
  if (data.employee.kra_pin) {
    addText(`KRA PIN:`, infoRight, y, { fontSize: 9.5, color: darkGray })
    addText(data.employee.kra_pin, infoRight + 20, y, { fontSize: 10 })
    y += 7
  } else {
    y += 7
  }
  
  y += 3

  // Earnings Section - Professional table
  y += 5
  y = addSectionHeader('EARNINGS', y)
  drawRoundedBox(left, y - 5, right - left, 50, [255, 255, 255])
  y += 3
  y = addTableRow('Basic Salary', data.basic_salary, y)
  y = addTableRow('Allowances', data.allowances_total, y)
  y = addTableRow('Overtime', data.overtime, y)
  y = addTableRow('Bonuses', data.bonuses, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('Gross Salary', data.gross_salary, y, true)
  y += 5

  // Deductions Section - Professional table
  y += 5
  y = addSectionHeader('DEDUCTIONS', y)
  
  // Calculate height needed for deductions
  let deductionsRows = 4 // NSSF, SHIF, AHL, PAYE
  if (data.helb > 0) deductionsRows++
  if (data.voluntary_deductions_total > 0) deductionsRows++
  const deductionsHeight = deductionsRows * 6 + 12
  
  drawRoundedBox(left, y - 5, right - left, deductionsHeight, [255, 255, 255])
  y += 3
  y = addTableRow('NSSF (Employee)', data.nssf_employee, y)
  y = addTableRow('SHIF (Employee)', data.shif_employee, y)
  y = addTableRow('AHL (Employee)', data.ahl_employee, y)
  y = addTableRow('PAYE', data.paye_after_relief, y)
  
  if (data.helb > 0) {
    y = addTableRow('HELB', data.helb, y)
  }
  
  if (data.voluntary_deductions_total > 0) {
    y = addTableRow('Voluntary Deductions', data.voluntary_deductions_total, y)
  }
  
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('Total Deductions', data.total_deductions, y, true)
  y += 5

  // Net Salary Section - Highlighted box
  y += 5
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.roundedRect(left, y, right - left, 12, 2, 2, 'F')
  y += 7
  addText('NET SALARY', left + 3, y, { fontSize: 12, bold: true, color: [255, 255, 255] })
  addText(formatCurrency(data.net_salary), right - 3, y, { align: 'right', fontSize: 13, bold: true, color: [255, 255, 255] })
  y += 10

  // Employer Contributions Section - Professional table
  y += 5
  y = addSectionHeader('EMPLOYER CONTRIBUTIONS', y)
  drawRoundedBox(left, y - 5, right - left, 30, [255, 255, 255])
  y += 3
  y = addTableRow('NSSF (Employer)', data.nssf_employer, y)
  y = addTableRow('SHIF (Employer)', data.shif_employer, y)
  y = addTableRow('AHL (Employer)', data.ahl_employer, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('Total Employer Cost', data.total_employer_cost, y, true)
  y += 10

  // Professional Footer Section
  const footerY = pageHeight - 12
  if (y < footerY - 8) {
    y = footerY - 8
  }
  
  drawLine(y, borderGray, 0.5)
  y += 5
  
  // Footer with company info
  addText('Generated by PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  y += 4
  addText(new Date().toLocaleDateString('en-KE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  
  // Add page border for professional look
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.5)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

  // Download
  doc.save(`payslip-${data.employee.employee_id}-${data.month}.pdf`)
}

export const generateRemittancePDF = async (data: RemittanceData): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const left = margin
  const right = pageWidth - margin
  const centerX = pageWidth / 2
  let y = margin

  // Color scheme - Professional blue and green
  const primaryColor = [30, 58, 138] // #1e3a8a - Blue
  const accentColor = [132, 204, 22] // #84cc16 - Green
  const lightGray = [245, 245, 245] // #f5f5f5
  const darkGray = [100, 100, 100]
  const borderGray = [220, 220, 220]

  // Helper functions (same as payslip)
  const drawRoundedBox = (x: number, y: number, width: number, height: number, fill?: number[]) => {
    if (fill) {
      doc.setFillColor(fill[0], fill[1], fill[2])
      doc.rect(x, y, width, height, 'F')
    }
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.3)
    doc.rect(x, y, width, height)
  }

  const drawLine = (yy: number, color: number[] = borderGray, width: number = 0.5) => {
    doc.setDrawColor(color[0], color[1], color[2])
    doc.setLineWidth(width)
    doc.line(left, yy, right, yy)
  }

  const addText = (text: string, x: number, yy: number, options: {
    align?: 'left' | 'center' | 'right'
    fontSize?: number
    bold?: boolean
    color?: number[]
  } = {}) => {
    if (options.fontSize) doc.setFontSize(options.fontSize)
    if (options.bold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    if (options.color) {
      doc.setTextColor(options.color[0], options.color[1], options.color[2])
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.text(text, x, yy, { align: options.align || 'left' })
    doc.setTextColor(0, 0, 0)
  }

  const addSectionHeader = (title: string, yy: number): number => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(left, yy - 5, right - left, 8, 2, 2, 'F')
    addText(title, left + 3, yy, { fontSize: 11, bold: true, color: [255, 255, 255] })
    return yy + 6
  }

  const addTableRow = (label: string, amount: number, yy: number, isTotal: boolean = false): number => {
    const rowHeight = 6
    const labelX = left + 3
    const amountX = right - 3
    
    if (!isTotal) {
      const rowIndex = Math.floor((yy - 60) / rowHeight)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
        doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      }
    } else {
      doc.setFillColor(240, 248, 255)
      doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      drawLine(yy - 4, darkGray, 0.8)
    }

    addText(label, labelX, yy, { fontSize: isTotal ? 10.5 : 10, bold: isTotal })
    addText(formatCurrency(amount), amountX, yy, { align: 'right', fontSize: isTotal ? 10.5 : 10, bold: isTotal })
    
    return yy + rowHeight
  }

  // Try to load and add company logo
  let logoLoaded = false
  try {
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.src = '/logo/logo1.png'
    
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!logoLoaded) {
          y += 10
          resolve(true)
        }
      }, 2000)

      logoImg.onload = () => {
        try {
          logoLoaded = true
          clearTimeout(timeout)
          const logoSize = 18
          doc.addImage(logoImg, 'PNG', right - logoSize - 5, y, logoSize, logoSize)
          resolve(true)
        } catch (error) {
          console.warn('Could not add logo to PDF:', error)
          clearTimeout(timeout)
          y += 10
          resolve(true)
        }
      }
      logoImg.onerror = () => {
        clearTimeout(timeout)
        y += 10
        resolve(true)
      }
    })
  } catch (error) {
    console.warn('Logo loading error:', error)
    y += 10
  }

  // Professional Header Section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(left, y, right - left, 25, 'F')
  
  y += 8
  addText('PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 20, bold: true, color: [255, 255, 255] })
  y += 7
  addText('PAYROLL SYSTEM', centerX, y, { align: 'center', fontSize: 12, color: [255, 255, 255] })
  y += 6
  addText('GOVERNMENT REMITTANCE SUMMARY', centerX, y, { align: 'center', fontSize: 14, bold: true, color: [255, 255, 255] })
  y += 12

  // Period Information Section
  drawRoundedBox(left, y, right - left, 18, lightGray)
  y += 6
  addText('REPORTING PERIOD', left + 3, y, { fontSize: 11, bold: true, color: primaryColor })
  y += 8
  addText(`Month:`, left + 5, y, { fontSize: 9.5, color: darkGray })
  addText(formatDate(data.month), left + 20, y, { fontSize: 11, bold: true })
  y += 8

  // NSSF Section
  y += 5
  y = addSectionHeader('NSSF CONTRIBUTIONS', y)
  drawRoundedBox(left, y - 5, right - left, 25, [255, 255, 255])
  y += 3
  y = addTableRow('NSSF (Employee)', data.totals.nssfEmployee, y)
  y = addTableRow('NSSF (Employer)', data.totals.nssfEmployer, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('NSSF Total', data.totals.nssfTotal, y, true)
  y += 5

  // SHIF Section
  y += 5
  y = addSectionHeader('SHIF CONTRIBUTIONS', y)
  drawRoundedBox(left, y - 5, right - left, 25, [255, 255, 255])
  y += 3
  y = addTableRow('SHIF (Employee)', data.totals.shifEmployee, y)
  y = addTableRow('SHIF (Employer)', data.totals.shifEmployer, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('SHIF Total', data.totals.shifTotal, y, true)
  y += 5

  // AHL Section
  y += 5
  y = addSectionHeader('AHL CONTRIBUTIONS', y)
  drawRoundedBox(left, y - 5, right - left, 25, [255, 255, 255])
  y += 3
  y = addTableRow('AHL (Employee)', data.totals.ahlEmployee, y)
  y = addTableRow('AHL (Employer)', data.totals.ahlEmployer, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('AHL Total', data.totals.ahlTotal, y, true)
  y += 5

  // PAYE Section
  y += 5
  y = addSectionHeader('PAYE TAX', y)
  drawRoundedBox(left, y - 5, right - left, 15, [255, 255, 255])
  y += 3
  y = addTableRow('PAYE Total', data.totals.payeTotal, y, true)
  y += 5

  // Summary Section - Highlighted
  y += 5
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.roundedRect(left, y, right - left, 45, 2, 2, 'F')
  y += 8
  
  const totalRemittances = data.totals.nssfTotal + data.totals.shifTotal + data.totals.ahlTotal + data.totals.payeTotal
  
  addText('TOTAL GOVERNMENT REMITTANCES', left + 3, y, { fontSize: 11, bold: true, color: [255, 255, 255] })
  addText(formatCurrency(totalRemittances), right - 3, y, { align: 'right', fontSize: 12, bold: true, color: [255, 255, 255] })
  y += 10
  
  addText('TOTAL NET PAYROLL', left + 3, y, { fontSize: 11, bold: true, color: [255, 255, 255] })
  addText(formatCurrency(data.totals.totalNetPayroll), right - 3, y, { align: 'right', fontSize: 12, bold: true, color: [255, 255, 255] })
  y += 10
  
  addText('TOTAL EMPLOYER COST', left + 3, y, { fontSize: 11, bold: true, color: [255, 255, 255] })
  addText(formatCurrency(data.totals.totalEmployerCost), right - 3, y, { align: 'right', fontSize: 12, bold: true, color: [255, 255, 255] })
  y += 12

  // Footer Section
  const footerY = pageHeight - 12
  if (y < footerY - 8) {
    y = footerY - 8
  }
  
  drawLine(y, borderGray, 0.5)
  y += 5
  
  addText('Generated by PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  y += 4
  addText(new Date().toLocaleDateString('en-KE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  
  // Page border
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.5)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

  doc.save(`remittance-${data.month}.pdf`)
}

export const generateP9PDF = async (data: P9Data): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const left = margin
  const right = pageWidth - margin
  const centerX = pageWidth / 2
  let y = margin

  // Color scheme - Professional blue and green
  const primaryColor = [30, 58, 138] // #1e3a8a - Blue
  const accentColor = [132, 204, 22] // #84cc16 - Green
  const lightGray = [245, 245, 245] // #f5f5f5
  const darkGray = [100, 100, 100]
  const borderGray = [220, 220, 220]

  // Helper functions
  const drawRoundedBox = (x: number, y: number, width: number, height: number, fill?: number[]) => {
    if (fill) {
      doc.setFillColor(fill[0], fill[1], fill[2])
      doc.rect(x, y, width, height, 'F')
    }
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.3)
    doc.rect(x, y, width, height)
  }

  const drawLine = (yy: number, color: number[] = borderGray, width: number = 0.5) => {
    doc.setDrawColor(color[0], color[1], color[2])
    doc.setLineWidth(width)
    doc.line(left, yy, right, yy)
  }

  const addText = (text: string, x: number, yy: number, options: {
    align?: 'left' | 'center' | 'right'
    fontSize?: number
    bold?: boolean
    color?: number[]
  } = {}) => {
    if (options.fontSize) doc.setFontSize(options.fontSize)
    if (options.bold) {
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setFont('helvetica', 'normal')
    }
    if (options.color) {
      doc.setTextColor(options.color[0], options.color[1], options.color[2])
    } else {
      doc.setTextColor(0, 0, 0)
    }
    doc.text(text, x, yy, { align: options.align || 'left' })
    doc.setTextColor(0, 0, 0)
  }

  const addSectionHeader = (title: string, yy: number): number => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(left, yy - 5, right - left, 8, 2, 2, 'F')
    addText(title, left + 3, yy, { fontSize: 11, bold: true, color: [255, 255, 255] })
    return yy + 6
  }

  const addTableRow = (label: string, amount: number, yy: number, isTotal: boolean = false): number => {
    const rowHeight = 6
    const labelX = left + 3
    const amountX = right - 3
    
    if (!isTotal) {
      const rowIndex = Math.floor((yy - 60) / rowHeight)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
        doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      }
    } else {
      doc.setFillColor(240, 248, 255)
      doc.rect(left, yy - 4, right - left, rowHeight, 'F')
      drawLine(yy - 4, darkGray, 0.8)
    }

    addText(label, labelX, yy, { fontSize: isTotal ? 10.5 : 10, bold: isTotal })
    addText(formatCurrency(amount), amountX, yy, { align: 'right', fontSize: isTotal ? 10.5 : 10, bold: isTotal })
    
    return yy + rowHeight
  }

  // Try to load and add company logo
  let logoLoaded = false
  try {
    const logoImg = new Image()
    logoImg.crossOrigin = 'anonymous'
    logoImg.src = '/logo/logo1.png'
    
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!logoLoaded) {
          y += 10
          resolve(true)
        }
      }, 2000)

      logoImg.onload = () => {
        try {
          logoLoaded = true
          clearTimeout(timeout)
          const logoSize = 18
          doc.addImage(logoImg, 'PNG', right - logoSize - 5, y, logoSize, logoSize)
          resolve(true)
        } catch (error) {
          console.warn('Could not add logo to PDF:', error)
          clearTimeout(timeout)
          y += 10
          resolve(true)
        }
      }
      logoImg.onerror = () => {
        clearTimeout(timeout)
        y += 10
        resolve(true)
      }
    })
  } catch (error) {
    console.warn('Logo loading error:', error)
    y += 10
  }

  // Professional Header Section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(left, y, right - left, 25, 'F')
  
  y += 8
  addText('PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 20, bold: true, color: [255, 255, 255] })
  y += 7
  addText('PAYROLL SYSTEM', centerX, y, { align: 'center', fontSize: 12, color: [255, 255, 255] })
  y += 6
  addText('P9 FORM - ANNUAL TAX SUMMARY', centerX, y, { align: 'center', fontSize: 14, bold: true, color: [255, 255, 255] })
  y += 12

  // Employee Information Section - Boxed
  const empInfoHeight = 40
  drawRoundedBox(left, y, right - left, empInfoHeight, lightGray)
  y += 6
  addText('EMPLOYEE INFORMATION', left + 3, y, { fontSize: 11, bold: true, color: primaryColor })
  y += 8
  
  const infoLeft = left + 5
  const infoRight = centerX + 20
  addText(`Name:`, infoLeft, y, { fontSize: 9.5, color: darkGray })
  addText(data.employee.name, infoLeft + 15, y, { fontSize: 10, bold: true })
  addText(`Tax Year:`, infoRight, y, { fontSize: 9.5, color: darkGray })
  addText(data.year.toString(), infoRight + 20, y, { fontSize: 10, bold: true })
  y += 7
  
  addText(`ID:`, infoLeft, y, { fontSize: 9.5, color: darkGray })
  addText(data.employee.employee_id, infoLeft + 15, y, { fontSize: 10 })
  addText(`KRA PIN:`, infoRight, y, { fontSize: 9.5, color: darkGray })
  addText(data.employee.kra_pin, infoRight + 20, y, { fontSize: 10 })
  y += 7
  
  y += 3

  // Annual Earnings Section
  y += 5
  y = addSectionHeader('ANNUAL EARNINGS', y)
  drawRoundedBox(left, y - 5, right - left, 30, [255, 255, 255])
  y += 3
  y = addTableRow('Basic Salary', data.basic_salary_total, y)
  y = addTableRow('Allowances', data.allowances_total, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('Gross Salary', data.gross_salary_total, y, true)
  y += 5

  // Annual Deductions Section
  y += 5
  y = addSectionHeader('ANNUAL DEDUCTIONS', y)
  
  let deductionsRows = 4 // NSSF, SHIF, AHL, PAYE
  if (data.helb_total > 0) deductionsRows++
  if (data.voluntary_deductions_total > 0) deductionsRows++
  const deductionsHeight = deductionsRows * 6 + 12
  
  drawRoundedBox(left, y - 5, right - left, deductionsHeight, [255, 255, 255])
  y += 3
  y = addTableRow('NSSF (Employee)', data.nssf_employee_total, y)
  y = addTableRow('SHIF (Employee)', data.shif_employee_total, y)
  y = addTableRow('AHL (Employee)', data.ahl_employee_total, y)
  y = addTableRow('PAYE', data.paye_total, y)
  
  if (data.helb_total > 0) {
    y = addTableRow('HELB', data.helb_total, y)
  }
  
  if (data.voluntary_deductions_total > 0) {
    y = addTableRow('Voluntary Deductions', data.voluntary_deductions_total, y)
  }
  
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  const totalDeductions = data.nssf_employee_total + data.shif_employee_total + data.ahl_employee_total + data.paye_total + data.helb_total + data.voluntary_deductions_total
  y = addTableRow('Total Deductions', totalDeductions, y, true)
  y += 5

  // Net Salary Section - Highlighted
  y += 5
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.roundedRect(left, y, right - left, 12, 2, 2, 'F')
  y += 7
  addText('NET SALARY', left + 3, y, { fontSize: 12, bold: true, color: [255, 255, 255] })
  addText(formatCurrency(data.net_salary_total), right - 3, y, { align: 'right', fontSize: 13, bold: true, color: [255, 255, 255] })
  y += 10

  // Employer Contributions Section
  y += 5
  y = addSectionHeader('EMPLOYER CONTRIBUTIONS', y)
  drawRoundedBox(left, y - 5, right - left, 30, [255, 255, 255])
  y += 3
  y = addTableRow('NSSF (Employer)', data.nssf_employer_total, y)
  y = addTableRow('SHIF (Employer)', data.shif_employer_total, y)
  y = addTableRow('AHL (Employer)', data.ahl_employer_total, y)
  y += 2
  drawLine(y, darkGray, 0.8)
  y += 4
  y = addTableRow('Total Employer Cost', data.total_employer_cost, y, true)
  y += 10

  // Footer Section
  const footerY = pageHeight - 12
  if (y < footerY - 8) {
    y = footerY - 8
  }
  
  drawLine(y, borderGray, 0.5)
  y += 5
  
  addText('Generated by PEMWA AGENCY LIMITED', centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  y += 4
  addText(new Date().toLocaleDateString('en-KE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), centerX, y, { align: 'center', fontSize: 8, color: darkGray })
  
  // Page border
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.5)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

  doc.save(`p9-${data.employee.employee_id}-${data.year}.pdf`)
}
