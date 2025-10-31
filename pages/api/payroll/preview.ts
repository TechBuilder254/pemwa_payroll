import type { NextApiRequest, NextApiResponse } from 'next'
import type { Allowances, VoluntaryDeductions, Employee, PayrollSettings } from '@/lib/supabase'
import { calculatePayroll, getDefaultPayrollSettings } from '@/lib/payroll-calculations'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { employee, allowances, voluntaryDeductions, bonuses, overtime, settings } = req.body as {
    employee: Pick<Employee, 'id' | 'basic_salary' | 'helb_amount'>
    allowances?: Allowances
    voluntaryDeductions?: VoluntaryDeductions
    bonuses?: number
    overtime?: number
    settings?: PayrollSettings
  }

  const effectiveSettings = settings ?? ({ id: 'default', created_at: new Date().toISOString(), ...getDefaultPayrollSettings() } as PayrollSettings)

  const result = calculatePayroll(
    employee as Employee,
    allowances ?? {},
    voluntaryDeductions ?? {},
    bonuses ?? 0,
    overtime ?? 0,
    effectiveSettings
  )

  res.status(200).json({ data: result })
}


