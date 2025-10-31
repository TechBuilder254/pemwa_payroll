const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres'
  const client = new Client({ connectionString: databaseUrl })
  try {
    console.log('[db-check] Connecting to:', databaseUrl.replace(/:(.+)@/, '://****:****@'))
    await client.connect()
    const settings = await client.query(`
      select id::text, is_active,
             to_char(effective_from,'YYYY-MM-DD') as effective_from,
             personal_relief::float8, nssf_employee_rate::float8, nssf_employer_rate::float8,
             nssf_max_contribution::float8, shif_employee_rate::float8, shif_employer_rate::float8,
             ahl_employee_rate::float8, ahl_employer_rate::float8, wiba_rate::float8, paye_brackets
        from payroll_settings order by effective_from desc limit 3
    `)
    const employees = await client.query(`
      select id::text, name, employee_id, position, basic_salary::float8 as basic_salary,
             helb_amount::float8 as helb_amount, allowances, voluntary_deductions,
             to_char(created_at,'YYYY-MM-DD') as created_at
        from employees order by created_at desc limit 10
    `)
    console.log('\n=== payroll_settings (latest 3) ===')
    console.log(settings.rows)
    console.log('\n=== employees (latest 10) ===')
    console.log(employees.rows.map(r => ({ id: r.id, name: r.name, employee_id: r.employee_id, position: r.position, basic_salary: r.basic_salary, helb_amount: r.helb_amount, created_at: r.created_at })))
  } catch (e) {
    console.error('[db-check] Error:', e.message)
    process.exitCode = 1
  } finally {
    try { await client.end() } catch {}
  }
}

main()


