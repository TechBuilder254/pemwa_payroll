import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/db'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure numeric sequence exists
    await query(`create sequence if not exists employee_numeric_id_seq start 1`)

    // Compute next without advancing sequence: use max in table vs current seq
    const result = await query<{ next_id: string }>(
      `with maxn as (
          select coalesce(max((regexp_match(trim(employee_id), '(?i)^EMP\\s*(\\d+)'))[1]::int), 0) as maxn
            from employees
        ),
        lastv as (
          select coalesce((select last_value from employee_numeric_id_seq), 0) as v
        )
        select 'EMP' || lpad((greatest((select v from lastv), (select maxn from maxn)) + 1)::text, 3, '0') as next_id`
    )
    const nextId = result.rows[0]?.next_id || 'EMP001'
    res.status(200).json({ data: { nextId } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to compute next employee id' })
  }
}


