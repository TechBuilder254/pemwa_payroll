import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    try {
      const { rows } = await query<any>(
        `select id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
                allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
                to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at
           from employees where id = $1`,
        [id]
      )
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.status(200).json({ data: rows[0] })
      return
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to fetch employee' })
      return
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body as any
      const { rows } = await query<any>(
        `update employees
           set name = $1,
               kra_pin = $2,
               position = $3,
               basic_salary = $4,
               allowances = $5::jsonb,
               helb_amount = $6,
               voluntary_deductions = $7::jsonb,
               updated_at = now()
         where id = $8
         returning id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
                   allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
                   to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
                   to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at`,
        [
          body.name ?? 'Employee',
          body.kra_pin ?? '',
          body.position ?? '',
          body.basic_salary ?? 0,
          JSON.stringify(body.allowances ?? {}),
          body.helb_amount ?? 0,
          JSON.stringify(body.voluntary_deductions ?? {}),
          id,
        ]
      )
      res.status(200).json({ data: rows[0] })
      return
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to update employee' })
      return
    }
  }

  if (req.method === 'DELETE') {
    try {
      await query(`delete from employees where id = $1`, [id])
      res.status(204).end()
      return
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to delete employee' })
      return
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE')
  res.status(405).json({ error: 'Method Not Allowed' })
}


