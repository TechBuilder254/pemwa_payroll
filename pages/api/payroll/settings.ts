import type { NextApiRequest, NextApiResponse } from 'next'
import type { PayrollSettings } from '@/lib/supabase'
import { fetchActivePayrollSettings, supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await fetchActivePayrollSettings()
      res.status(200).json({ data: settings })
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to load payroll settings' })
    }
    return
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body as Partial<PayrollSettings>

      // Deactivate existing active settings
      await supabase.from('payroll_settings').update({ is_active: false }).eq('is_active', true)

      // Insert new active settings row
      const insertPayload = {
        personal_relief: body.personal_relief,
        nssf_employee_rate: body.nssf_employee_rate,
        nssf_employer_rate: body.nssf_employer_rate,
        nssf_max_contribution: body.nssf_max_contribution,
        shif_employee_rate: body.shif_employee_rate,
        shif_employer_rate: body.shif_employer_rate,
        ahl_employee_rate: body.ahl_employee_rate,
        ahl_employer_rate: body.ahl_employer_rate,
        paye_brackets: body.paye_brackets,
        effective_from: body.effective_from || new Date().toISOString().split('T')[0],
        effective_to: body.effective_to ?? null,
        is_active: true,
      }

      const { data, error } = await supabase
        .from('payroll_settings')
        .insert(insertPayload)
        .select()
        .single()

      if (error) throw new Error(error.message)
      res.status(200).json({ data })
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to update payroll settings' })
    }
    return
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).json({ error: 'Method Not Allowed' })
}


