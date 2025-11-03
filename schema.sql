-- PostgreSQL schema for Pemwa Payroll
-- Compatible with Supabase. Adjust storage/policies separately.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  employee_id text unique not null,
  kra_pin text not null,
  position text not null,
  basic_salary numeric(14,2) not null default 0,
  allowances jsonb not null default '{}',
  helb_amount numeric(14,2) not null default 0,
  voluntary_deductions jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_employees_updated_at on employees;
create trigger trg_employees_updated_at before update on employees
for each row execute function set_updated_at();

create index if not exists idx_employees_name on employees using gin (to_tsvector('english', name));

create table if not exists payroll_settings (
  id uuid primary key default uuid_generate_v4(),
  personal_relief numeric(14,2) not null,
  nssf_employee_rate numeric(6,5) not null,
  nssf_employer_rate numeric(6,5) not null,
  nssf_max_contribution numeric(14,2) not null,
  shif_employee_rate numeric(6,5) not null,
  shif_employer_rate numeric(6,5) not null,
  ahl_employee_rate numeric(6,5) not null,
  ahl_employer_rate numeric(6,5) not null,
  paye_brackets jsonb not null,
  effective_from date not null,
  effective_to date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_settings_active on payroll_settings (is_active, effective_from desc);

create table if not exists payroll_records (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees (id) on delete cascade,
  month date not null,
  gross_salary numeric(14,2) not null,
  basic_salary numeric(14,2) not null,
  allowances_total numeric(14,2) not null,
  overtime numeric(14,2) not null,
  bonuses numeric(14,2) not null,
  nssf_employee numeric(14,2) not null,
  nssf_employer numeric(14,2) not null,
  shif_employee numeric(14,2) not null,
  shif_employer numeric(14,2) not null,
  ahl_employee numeric(14,2) not null,
  ahl_employer numeric(14,2) not null,
  helb numeric(14,2) not null,
  voluntary_deductions_total numeric(14,2) not null,
  paye_before_relief numeric(14,2) not null,
  personal_relief numeric(14,2) not null,
  paye_after_relief numeric(14,2) not null,
  total_deductions numeric(14,2) not null,
  net_salary numeric(14,2) not null,
  total_employer_cost numeric(14,2) not null,
  created_at timestamptz not null default now(),
  unique (employee_id, month)
);

create index if not exists idx_payroll_records_employee_month on payroll_records (employee_id, month desc);

-- Track payroll runs/batches
create table if not exists payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  period_month date not null,
  created_by text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payroll_runs_period on payroll_runs (period_month desc);

-- Optional: view to expose payslip-shaped rows from payroll_records
drop view if exists v_payslips cascade;
create or replace view v_payslips as
select
  pr.id,
  pr.employee_id::text as employee_uuid,
  e.employee_id,
  e.name as employee_name,
  to_char(pr.month, 'YYYY-MM') as month,
  pr.gross_salary,
  pr.basic_salary,
  pr.allowances_total,
  pr.overtime,
  pr.bonuses,
  pr.nssf_employee,
  pr.nssf_employer,
  pr.shif_employee,
  pr.shif_employer,
  pr.ahl_employee,
  pr.ahl_employer,
  pr.helb,
  pr.voluntary_deductions_total,
  pr.paye_before_relief,
  pr.personal_relief,
  pr.paye_after_relief,
  pr.total_deductions,
  pr.net_salary,
  pr.total_employer_cost,
  pr.created_at
from payroll_records pr
join employees e on e.id = pr.employee_id;

create table if not exists p9_records (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees (id) on delete cascade,
  year int not null,
  gross_salary_total numeric(14,2) not null,
  basic_salary_total numeric(14,2) not null,
  allowances_total numeric(14,2) not null,
  nssf_employee_total numeric(14,2) not null,
  nssf_employer_total numeric(14,2) not null,
  shif_employee_total numeric(14,2) not null,
  shif_employer_total numeric(14,2) not null,
  ahl_employee_total numeric(14,2) not null,
  ahl_employer_total numeric(14,2) not null,
  helb_total numeric(14,2) not null,
  voluntary_deductions_total numeric(14,2) not null,
  paye_total numeric(14,2) not null,
  net_salary_total numeric(14,2) not null,
  total_employer_cost numeric(14,2) not null,
  created_at timestamptz not null default now(),
  unique (employee_id, year)
);

-- Helper: activate one settings row and deactivate others
create or replace function activate_payroll_settings(target_id uuid)
returns void language plpgsql as $$
begin
  update payroll_settings set is_active = false where id <> target_id;
  update payroll_settings set is_active = true where id = target_id;
end; $$;

-- Sequence for employee IDs
create sequence if not exists employee_numeric_id_seq start 1;

-- Users table for authentication
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (email);
create index if not exists idx_users_active on users (is_active);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users
for each row execute function set_updated_at();


