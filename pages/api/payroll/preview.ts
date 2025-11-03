import type { NextApiRequest, NextApiResponse } from 'next'
import type { Allowances, VoluntaryDeductions, Employee, PayrollSettings } from '@/lib/supabase'
import { calculatePayroll } from '@/lib/payroll-calculations'
import { query } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // Fetch settings from database if not provided
  let effectiveSettings = settings
  if (!effectiveSettings) {
    try {
      const { rows } = await query(
        `select * from payroll_settings where is_active = true order by effective_from desc limit 1`
      )
      if (!rows || rows.length === 0) {
        res.status(404).json({ error: 'No active payroll settings found. Please configure settings first.' })
        return
      }
      effectiveSettings = rows[0] as PayrollSettings
    } catch (error: any) {
      res.status(500).json({ error: `Failed to load payroll settings: ${error.message}` })
      return
    }
  }

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


