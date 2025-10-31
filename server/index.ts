import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { query } from '../lib/db'

const app = express()
const PORT = Number(process.env.API_PORT || 5174)

app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))

// Ensure required database schema exists
async function ensureSchema() {
  // Extensions for UUID generation
  await query(`create extension if not exists "uuid-ossp";`)
  await query(`create extension if not exists pgcrypto;`)
  // Employees table
  await query(`
    create table if not exists employees (
      id uuid primary key default uuid_generate_v4(),
      name text not null,
      employee_id text not null unique,
      kra_pin text not null,
      position text not null,
      basic_salary numeric not null default 0,
      allowances jsonb not null default '{}',
      helb_amount numeric not null default 0,
      voluntary_deductions jsonb not null default '{}',
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    );
  `)

  // Sequence for employee_id numbering
  await query(`create sequence if not exists employee_numeric_id_seq start 1;`)

  // Payroll settings table
  await query(`
    create table if not exists payroll_settings (
      id uuid primary key default uuid_generate_v4(),
      personal_relief numeric not null,
      nssf_employee_rate numeric not null,
      nssf_employer_rate numeric not null,
      nssf_max_contribution numeric not null,
      shif_employee_rate numeric not null,
      shif_employer_rate numeric not null,
      ahl_employee_rate numeric not null,
      ahl_employer_rate numeric not null,
      paye_brackets jsonb not null,
      effective_from date not null,
      effective_to date,
      is_active boolean not null default false,
      created_at timestamp with time zone not null default now()
    );
  `)
}

ensureSchema().catch((e) => {
  console.error('[api] Failed to ensure schema:', e)
})

// Employees
app.get('/api/employees', async (req, res) => {
  try {
    const { rows } = await query(
      `select id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
              allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
              to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at
         from employees
         order by created_at desc`
    )
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')
    res.status(200).json({ data: rows })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch employees' })
  }
})

app.post('/api/employees', async (req, res) => {
  try {
    const body = req.body as any
    await query(`create sequence if not exists employee_numeric_id_seq start 1`)
    const { rows } = await query(
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
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to create employee' })
  }
})

// Next Employee ID
app.get('/api/employees/next-id', async (_req, res) => {
  try {
    await query(`create sequence if not exists employee_numeric_id_seq start 1`)
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
    const nextId = (result.rows[0] as any)?.next_id || 'EMP001'
    res.status(200).json({ data: { nextId } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to compute next employee id' })
  }
})

// Payroll settings (Postgres version)
app.get('/api/payroll/settings', async (req, res) => {
  try {
    const { rows } = await query(
      `select * from payroll_settings where is_active = true order by effective_from desc limit 1`
    )
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: 'No active payroll settings found' })
      return
    }
    res.status(200).json({ data: rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to load payroll settings' })
  }
})

app.put('/api/payroll/settings', async (req, res) => {
  try {
    const body = req.body as any
    await query(`update payroll_settings set is_active = false where is_active = true`)
    const insertPayload = [
      body.personal_relief,
      body.nssf_employee_rate,
      body.nssf_employer_rate,
      body.nssf_max_contribution,
      body.shif_employee_rate,
      body.shif_employer_rate,
      body.ahl_employee_rate,
      body.ahl_employer_rate,
      JSON.stringify(body.paye_brackets),
      body.effective_from || new Date().toISOString().split('T')[0],
      body.effective_to ?? null,
      true,
    ]
    const { rows } = await query(
      `insert into payroll_settings (
        personal_relief, nssf_employee_rate, nssf_employer_rate, nssf_max_contribution,
        shif_employee_rate, shif_employer_rate, ahl_employee_rate, ahl_employer_rate,
        paye_brackets, effective_from, effective_to, is_active
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      returning *`,
      insertPayload
    )
    res.status(200).json({ data: rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to update payroll settings' })
  }
})

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`)
})


