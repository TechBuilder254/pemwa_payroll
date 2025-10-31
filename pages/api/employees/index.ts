import type { NextApiRequest, NextApiResponse } from 'next'
import type { Employee } from '@/lib/supabase'
import { query } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await query<Employee>(
        `select id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
                allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
                to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at
           from employees
           order by created_at desc`
      )
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')
      res.status(200).json({ data: rows })
      return
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to fetch employees' })
      return
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body as Partial<Employee>
      // Ensure sequence exists and synced; generate id via nextval
      await query(`create sequence if not exists employee_numeric_id_seq start 1`)
      const { rows } = await query<Employee>(
        `with maxn as (
            select coalesce(max((regexp_match(trim(employee_id), '(?i)^EMP\\s*(\\d+)'))[1]::int), 0) as maxn
              from employees
          ), sync as (
            select case when (select last_value from employee_numeric_id_seq) < (select maxn from maxn)
                        then setval('employee_numeric_id_seq', (select maxn from maxn))
                        else (select last_value from employee_numeric_id_seq) end as _
          )
          insert into employees (name, employee_id, kra_pin, position, basic_salary, allowances, helb_amount, voluntary_deductions)
          values ($1, 'EMP' || lpad(nextval('employee_numeric_id_seq')::text, 3, '0'), $2, $3, $4, $5::jsonb, $6, $7::jsonb)
          returning id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
                    allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
                    to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
                    to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at`,
        [
          body.name ?? 'New Employee',
          body.kra_pin ?? '',
          body.position ?? '',
          body.basic_salary ?? 0,
          JSON.stringify(body.allowances ?? {}),
          body.helb_amount ?? 0,
          JSON.stringify(body.voluntary_deductions ?? {}),
        ]
      )
      res.status(201).json({ data: rows[0] })
      return
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Failed to create employee' })
      return
    }
  }

  res.setHeader('Allow', 'GET, POST')
  res.status(405).json({ error: 'Method Not Allowed' })
}


