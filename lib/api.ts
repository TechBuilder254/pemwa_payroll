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

export async function fetchPayrollSettings(): Promise<PayrollSettings> {
  const res = await fetch('/api/payroll/settings')
  if (!res.ok) throw new Error('Failed to fetch payroll settings')
  const json = await res.json()
  return json.data as PayrollSettings
}


