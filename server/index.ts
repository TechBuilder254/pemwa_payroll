import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { createServer } from 'http'
import { query } from '../lib/db'
import { hashPassword, comparePassword, generateToken, authenticate, type AuthRequest } from '../lib/auth'

const app = express()
const DEFAULT_PORT = Number(process.env.API_PORT || 5174)

// Helper function to find an available port
function findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const tryPort = (port: number) => {
      attempts++
      const server = createServer()
      
      server.listen(port, () => {
        server.once('close', () => resolve(port))
        server.close()
      })
      
      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          if (attempts >= maxAttempts) {
            reject(new Error(`Could not find an available port after ${maxAttempts} attempts`))
          } else {
            tryPort(port + 1)
          }
        } else {
          reject(err)
        }
      })
    }
    
    tryPort(startPort)
  })
}

// CORS configuration - works for both local dev and Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VITE_VERCEL_URL ? `https://${process.env.VITE_VERCEL_URL}` : undefined,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) or from allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
// Use express.json instead of body-parser for better compatibility
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}))

// Ensure required database schema exists
// NOTE: Schema is already created in Supabase via migrations
async function ensureSchema() {
  // Just verify the database connection
  console.log('[api] Schema already exists in Supabase database')
}

// Test database connection and ensure schema
async function initializeDatabase() {
  try {
    // Test connection
    await query('SELECT 1 as test')
    console.log('[api] ✅ Database connection successful (Supabase PostgreSQL)')
    
    // Verify schema exists in Supabase
    const { rows } = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log(`[api] ✅ Found ${rows.length} tables in database`)
    
  } catch (e: any) {
    console.error('[api] ❌ Database initialization failed:', e.message)
    console.error('[api] Make sure your database is accessible and SUPABASE_DB_URL or DATABASE_URL is set correctly')
    throw e
  }
}

initializeDatabase().catch((e) => {
  console.error('[api] Failed to initialize database:', e)
})

// ==================== Authentication Routes ====================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    // Check if user already exists
    const existingUser = await query(
      `select id from users where email = $1`,
      [email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'User with this email already exists' })
      return
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { rows } = await query(
      `insert into users (email, password_hash, name, role, is_active)
       values ($1, $2, $3, 'admin', true)
       returning id::text, email, name, role, is_active,
                 to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at`,
      [email.toLowerCase(), passwordHash, name]
    )

    const user = rows[0]

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (e: any) {
    console.error('[api] Register error:', e)
    res.status(500).json({ error: e?.message || 'Failed to register user' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    // Find user
    const { rows } = await query(
      `select id::text, email, password_hash, name, role, is_active
       from users
       where email = $1`,
      [email.toLowerCase()]
    )

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const user = rows[0]

    if (!user.is_active) {
      res.status(403).json({ error: 'Account is disabled' })
      return
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash)

    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    // Update last_login
    await query(
      `update users set last_login = now() where id = $1`,
      [user.id]
    )

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (e: any) {
    console.error('[api] Login error:', e)
    res.status(500).json({ error: e?.message || 'Failed to login' })
  }
})

// Get current user
app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { rows } = await query(
      `select id::text, email, name, role, is_active,
              to_char(last_login, 'YYYY-MM-DD"T"HH24:MI:SSZ') as last_login,
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at
       from users
       where id = $1`,
      [req.user.id]
    )

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const user = rows[0]

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login: user.last_login,
        created_at: user.created_at,
      },
    })
  } catch (e: any) {
    console.error('[api] Get me error:', e)
    res.status(500).json({ error: e?.message || 'Failed to get user' })
  }
})

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ data: { message: 'Logged out successfully' } })
})

// Employees - Specific routes must come before dynamic routes
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
    console.log('[api] Creating employee with data:', {
      name: body.name,
      kra_pin: body.kra_pin,
      position: body.position,
      basic_salary: body.basic_salary,
      has_allowances: !!body.allowances,
      has_voluntary_deductions: !!body.voluntary_deductions,
    })

    // Create sequence if it doesn't exist
    try {
      await query(`create sequence if not exists employee_numeric_id_seq start 1`)
    } catch (seqError: any) {
      // Ignore if sequence already exists or similar
      console.log('[api] Sequence creation note:', seqError.message)
    }

    // Get next employee ID by checking existing IDs in database
    let nextEmployeeId: string = ''
    
    try {
      // Get all existing employee IDs that match the pattern EMP### or EMP## or EMP#
      const existingIdsResult = await query<{ employee_id: string }>(
        `select employee_id 
         from employees 
         where employee_id ~* '^EMP\\s*\\d+$'
         order by employee_id desc`
      )
      
      // Extract numeric parts and find the maximum
      let maxNumericId = 0
      if (existingIdsResult.rows.length > 0) {
        for (const row of existingIdsResult.rows) {
          // Extract numeric part from employee_id (e.g., "EMP003" -> 3)
          const match = row.employee_id.match(/(\d+)$/)
          if (match && match[1]) {
            const numericPart = parseInt(match[1], 10)
            if (!isNaN(numericPart) && numericPart > maxNumericId) {
              maxNumericId = numericPart
            }
          }
        }
      }
      
      // Generate next ID: maxNumericId + 1
      let nextNumericId = maxNumericId + 1
      nextEmployeeId = 'EMP' + String(nextNumericId).padStart(3, '0')
      
      // Double-check if this ID already exists (safety check - should not happen)
      const existsCheck = await query<{ count: string }>(
        `select count(*)::text as count from employees where employee_id = $1`,
        [nextEmployeeId]
      )
      
      // If it exists (edge case), increment until we find an available one
      let attempts = 0
      while (existsCheck.rows[0]?.count !== '0' && attempts < 10) {
        console.log(`[api] Employee ID ${nextEmployeeId} already exists, trying next...`)
        nextNumericId++
        nextEmployeeId = 'EMP' + String(nextNumericId).padStart(3, '0')
        
        const recheck = await query<{ count: string }>(
          `select count(*)::text as count from employees where employee_id = $1`,
          [nextEmployeeId]
        )
        
        if (recheck.rows[0]?.count === '0') {
          break
        }
        attempts++
      }
      
      if (attempts >= 10) {
        throw new Error('Failed to find unique employee ID after checking database')
      }
      
      // Sync sequence for future use
      try {
        await query(`select setval('employee_numeric_id_seq', $1, true)`, [nextNumericId])
      } catch (seqError: any) {
        // Ignore if sequence doesn't exist or similar
        console.log('[api] Sequence sync note:', seqError.message)
      }
      
      console.log(`[api] Generated employee ID: ${nextEmployeeId} (from max existing: ${maxNumericId})`)
    } catch (idError: any) {
      console.error('[api] Error generating employee ID:', idError.message)
      // Fallback: generate ID based on count
      const countResult = await query<{ count: string }>(`select count(*)::text as count from employees`)
      const count = parseInt(countResult.rows[0]?.count || '0', 10)
      nextEmployeeId = 'EMP' + String(count + 1).padStart(3, '0')
      console.log(`[api] Using fallback employee ID: ${nextEmployeeId}`)
    }
    
    if (!nextEmployeeId) {
      throw new Error('Failed to generate employee ID')
    }

    // Prepare allowances and deductions as JSON
    const allowances = typeof body.allowances === 'object' 
      ? JSON.stringify(body.allowances || {})
      : (body.allowances || '{}')
    
    const voluntaryDeductions = typeof body.voluntary_deductions === 'object'
      ? JSON.stringify(body.voluntary_deductions || {})
      : (body.voluntary_deductions || '{}')

    // Insert employee
    const { rows } = await query(
      `insert into employees (name, employee_id, kra_pin, position, basic_salary, allowances, helb_amount, voluntary_deductions)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb)
       returning id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
                 allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
                 to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
                 to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at`,
      [
        body.name ?? 'New Employee',
        nextEmployeeId,
        body.kra_pin ?? '',
        body.position ?? '',
        Number(body.basic_salary) || 0,
        allowances,
        Number(body.helb_amount) || 0,
        voluntaryDeductions,
      ]
    )

    if (!rows || rows.length === 0) {
      throw new Error('Failed to create employee - no data returned')
    }

    console.log('[api] ✅ Employee created successfully:', rows[0].employee_id)
    res.status(201).json({ data: rows[0] })
  } catch (e: any) {
    console.error('[api] ❌ Error creating employee:', e)
    console.error('[api] Error stack:', e.stack)
    res.status(500).json({ 
      error: e?.message || 'Failed to create employee',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    })
  }
})

app.get('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await query(
      `select id::text, name, employee_id, kra_pin, position, basic_salary::float8 as basic_salary,
              allowances, helb_amount::float8 as helb_amount, voluntary_deductions,
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at,
              to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as updated_at
         from employees where id = $1`,
      [id]
    )
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(200).json({ data: rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch employee' })
  }
})

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body as any
    const { rows } = await query(
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
    if (!rows || rows.length === 0) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(200).json({ data: rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to update employee' })
  }
})

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    await query(`delete from employees where id = $1`, [id])
    res.status(204).end()
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to delete employee' })
  }
})

// Payroll settings (Postgres version)
app.get('/api/payroll/settings', async (req, res) => {
  try {
    const { rows } = await query(
      `select id::text, personal_relief::float8 as personal_relief, nssf_employee_rate::float8 as nssf_employee_rate, 
              nssf_employer_rate::float8 as nssf_employer_rate, nssf_max_contribution::float8 as nssf_max_contribution,
              shif_employee_rate::float8 as shif_employee_rate, shif_employer_rate::float8 as shif_employer_rate,
              ahl_employee_rate::float8 as ahl_employee_rate, ahl_employer_rate::float8 as ahl_employer_rate,
              paye_brackets, effective_from, effective_to, is_active,
              to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at
       from payroll_settings 
       where is_active = true 
       order by effective_from desc limit 1`
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
      returning id::text, personal_relief::float8 as personal_relief, nssf_employee_rate::float8 as nssf_employee_rate,
                nssf_employer_rate::float8 as nssf_employer_rate, nssf_max_contribution::float8 as nssf_max_contribution,
                shif_employee_rate::float8 as shif_employee_rate, shif_employer_rate::float8 as shif_employer_rate,
                ahl_employee_rate::float8 as ahl_employee_rate, ahl_employer_rate::float8 as ahl_employer_rate,
                paye_brackets, effective_from, effective_to, is_active,
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at`,
      insertPayload
    )
    res.status(200).json({ data: rows[0] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to update payroll settings' })
  }
})

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get total employees
    const { rows: employeesResult } = await query(
      `select count(*)::int as total from employees`
    )
    const totalEmployees = employeesResult[0]?.total || 0

    // Get current month's payroll stats
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    // Get latest payroll month
    const { rows: latestMonthResult } = await query(
      `select to_char(max(month), 'YYYY-MM') as latest_month 
       from payroll_records`
    )
    const latestMonth = latestMonthResult[0]?.latest_month || currentMonth

    // Get stats for latest month
    const { rows: statsResult } = await query(
      `select 
        coalesce(sum(gross_salary), 0)::float8 as monthly_payroll,
        coalesce(sum(total_deductions), 0)::float8 as total_deductions,
        coalesce(sum(net_salary), 0)::float8 as net_payroll,
        coalesce(sum(total_employer_cost), 0)::float8 as employer_cost
       from payroll_records 
       where to_char(month, 'YYYY-MM') = $1`,
      [latestMonth]
    )

    const stats = statsResult[0]

    // Get recent payroll runs
    const { rows: recentPayrollsResult } = await query(
      `select 
        to_char(period_month, 'Month YYYY') as month,
        period_month,
        (select count(*) from payroll_records where to_char(month, 'YYYY-MM') = to_char(pr.period_month, 'YYYY-MM')) as employees,
        coalesce((select sum(net_salary) from payroll_records where to_char(month, 'YYYY-MM') = to_char(pr.period_month, 'YYYY-MM')), 0)::float8 as net_total
       from payroll_runs pr
       order by period_month desc
       limit 3`
    )

    const recentPayrolls = recentPayrollsResult.map((row: any) => ({
      month: row.month.trim(),
      employees: parseInt(row.employees) || 0,
      netTotal: parseFloat(row.net_total) || 0,
      status: 'completed'
    }))

    // Calculate current month stats from employees if no payroll records
    let monthlyPayroll = parseFloat(stats?.monthly_payroll) || 0
    let totalDeductions = parseFloat(stats?.total_deductions) || 0
    let netPayroll = parseFloat(stats?.net_payroll) || 0
    let employerCost = parseFloat(stats?.employer_cost) || 0

    // If no payroll records, calculate from employees and settings
    if (monthlyPayroll === 0 && totalEmployees > 0) {
      // Get active payroll settings
      const { rows: settingsResult } = await query(
        `select personal_relief::float8 as personal_relief, nssf_employee_rate::float8 as nssf_employee_rate, 
                nssf_employer_rate::float8 as nssf_employer_rate, nssf_max_contribution::float8 as nssf_max_contribution,
                shif_employee_rate::float8 as shif_employee_rate, shif_employer_rate::float8 as shif_employer_rate,
                ahl_employee_rate::float8 as ahl_employee_rate, ahl_employer_rate::float8 as ahl_employer_rate,
                paye_brackets
         from payroll_settings 
         where is_active = true 
         order by effective_from desc limit 1`
      )
      
      if (settingsResult && settingsResult.length > 0) {
        const settings = settingsResult[0]
        
        // Get all employees with their data
        const { rows: employeesResult } = await query(
          `select basic_salary::float8 as basic_salary, allowances, helb_amount::float8 as helb_amount, voluntary_deductions
           from employees`
        )
        
        let grossTotal = 0
        let deductionsTotal = 0
        let employerCostTotal = 0
        
        employeesResult.forEach((row: any) => {
          const allowances = row.allowances ? Object.values(row.allowances).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0) : 0
          const voluntaryDeductions = row.voluntary_deductions ? Object.values(row.voluntary_deductions).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0) : 0
          const basicSalary = parseFloat(row.basic_salary || 0)
          const helb = parseFloat(row.helb_amount || 0)
          
          const gross = basicSalary + allowances
          
          // Calculate deductions - ensure values are valid numbers
          const nssfEmployeeRate = parseFloat(settings.nssf_employee_rate) || 0
          const nssfEmployerRate = parseFloat(settings.nssf_employer_rate) || 0
          const nssfMaxContribution = parseFloat(settings.nssf_max_contribution) || 0
          const shifEmployeeRate = parseFloat(settings.shif_employee_rate) || 0
          const ahlEmployeeRate = parseFloat(settings.ahl_employee_rate) || 0
          const ahlEmployerRate = parseFloat(settings.ahl_employer_rate) || 0
          
          const nssfEmployee = Math.min(gross * nssfEmployeeRate, nssfMaxContribution)
          const shifEmployee = gross * shifEmployeeRate
          const ahlEmployee = gross * ahlEmployeeRate
          const taxableIncome = Math.max(0, gross - nssfEmployee - shifEmployee)
          
          // Calculate PAYE using tax brackets (progressive tax calculation)
          let payeAfterRelief = 0
          if (taxableIncome > 0) {
            // Ensure brackets are sorted by min value (ascending)
            const sortedBrackets = [...settings.paye_brackets].sort((a, b) => parseFloat(a.min) - parseFloat(b.min))
            let paye = 0
            let remainingIncome = taxableIncome
            
            for (const bracket of sortedBrackets) {
              if (remainingIncome <= 0) break
              
              const bracketMin = parseFloat(bracket.min) || 0
              const bracketMax = bracket.max === null ? Infinity : parseFloat(bracket.max)
              const bracketRate = parseFloat(bracket.rate) || 0
              
              // Skip if income is below this bracket's minimum
              if (remainingIncome <= bracketMin) break

              // Calculate the amount of income that falls within this bracket
              const bracketStart = Math.max(bracketMin, 0)
              const bracketEnd = bracketMax === null ? remainingIncome : Math.min(bracketMax, remainingIncome)
              
              // Calculate taxable amount in this bracket
              const taxableInBracket = Math.max(0, bracketEnd - bracketStart + (bracketStart === 0 ? 0 : 1))
              const actualTaxable = Math.min(taxableInBracket, remainingIncome)
              
              if (actualTaxable > 0) {
                paye += actualTaxable * bracketRate
                remainingIncome -= actualTaxable
              }
            }
            
            const personalRelief = parseFloat(settings.personal_relief) || 0
            payeAfterRelief = Math.max(0, paye - personalRelief)
          }
          
          const deductions = nssfEmployee + shifEmployee + ahlEmployee + helb + voluntaryDeductions + payeAfterRelief
          
          // Calculate employer costs (NO SHIF for employer)
          const nssfEmployer = Math.min(gross * nssfEmployerRate, nssfMaxContribution)
          const ahlEmployer = gross * ahlEmployerRate
          const shifEmployer = 0 // Employer does NOT pay SHIF (enforced)
          const employerCostItem = gross + nssfEmployer + ahlEmployer + shifEmployer // shifEmployer is 0, but included for clarity
          
          grossTotal += gross
          deductionsTotal += deductions
          employerCostTotal += employerCostItem
        })
        
        monthlyPayroll = grossTotal
        totalDeductions = deductionsTotal
        netPayroll = grossTotal - deductionsTotal
        employerCost = employerCostTotal
      } else {
        // If no settings, just sum gross salary
        const { rows: employeesResult } = await query(
          `select basic_salary::float8 as basic_salary, allowances
           from employees`
        )
        
        let grossTotal = 0
        employeesResult.forEach((row: any) => {
          const allowances = row.allowances ? Object.values(row.allowances).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0) : 0
          grossTotal += parseFloat(row.basic_salary || 0) + allowances
        })
        
        monthlyPayroll = grossTotal
      }
    }

    res.status(200).json({
      data: {
        totalEmployees,
        monthlyPayroll,
        totalDeductions,
        netPayroll,
        employerCost,
        recentPayrolls
      }
    })
  } catch (e: any) {
    console.error('[api/dashboard/stats] Error:', e)
    res.status(500).json({ error: e?.message || 'Failed to fetch dashboard stats' })
  }
})

// Payroll processing endpoint
app.post('/api/payroll/process', async (req, res) => {
  try {
    const body = req.body as any
    const { period_month, records } = body

    if (!period_month || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'Missing required fields: period_month and records array' })
      return
    }

    // Validate period_month format (YYYY-MM-DD or YYYY-MM)
    let periodDateStr: string
    let periodMonthYear: string // YYYY-MM format for queries
    if (period_month.length === 7) {
      // YYYY-MM format - extract year and month
      const [year, month] = period_month.split('-')
      const yearInt = parseInt(year)
      const monthInt = parseInt(month)
      if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        res.status(400).json({ error: 'Invalid period_month format. Use YYYY-MM or YYYY-MM-DD' })
        return
      }
      periodMonthYear = period_month // Store YYYY-MM format
      // Use make_date() in PostgreSQL to avoid timezone issues - will be constructed in SQL
      periodDateStr = `make_date(${yearInt}, ${monthInt}, 1)`
    } else if (period_month.length === 10) {
      // YYYY-MM-DD format - validate and extract year-month
      const [year, month] = period_month.split('-')
      const yearInt = parseInt(year)
      const monthInt = parseInt(month)
      if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        res.status(400).json({ error: 'Invalid period_month format. Use YYYY-MM or YYYY-MM-DD' })
        return
      }
      periodMonthYear = `${year}-${String(monthInt).padStart(2, '0')}`
      periodDateStr = period_month
    } else {
      res.status(400).json({ error: 'Invalid period_month format. Use YYYY-MM or YYYY-MM-DD' })
      return
    }

    // Begin transaction - create payroll run first
    let payrollRunId: string
    
    try {
      // Create payroll run record - use make_date() for YYYY-MM format to avoid timezone issues
      // Use explicit CAST to help PostgreSQL determine parameter types
      const runQuery = period_month.length === 7
        ? `insert into payroll_runs (period_month, notes, created_at)
           values (make_date(CAST($1 AS INTEGER), CAST($2 AS INTEGER), 1), $3, now())
           returning id::text`
        : `insert into payroll_runs (period_month, notes, created_at)
           values ($1::date, $2, now())
           returning id::text`
      
      const runParams = period_month.length === 7
        ? [
            parseInt(period_month.split('-')[0]), // year (must be int)
            parseInt(period_month.split('-')[1]), // month (must be int)
            body.notes || `Payroll run for ${new Date(parseInt(period_month.split('-')[0]), parseInt(period_month.split('-')[1]) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          ]
        : [
            periodDateStr,
            body.notes || `Payroll run for ${new Date(periodDateStr + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          ]
      
      const { rows: runRows } = await query(runQuery, runParams)
      payrollRunId = runRows[0].id
    } catch (runError: any) {
      console.error('[api/payroll/process] Error creating payroll run:', runError)
      res.status(500).json({ error: 'Failed to create payroll run: ' + (runError?.message || 'Unknown error') })
      return
    }

    // Insert payroll records
    const insertedRecords: any[] = []
    const updatedRecords: any[] = []
    const newRecords: any[] = []
    const errors: string[] = []

    for (const record of records) {
      try {
        // Validate required fields
        // Note: gross_salary and net_salary can be 0, so we check for undefined/null explicitly
        if (!record.employee_id || record.gross_salary === undefined || record.gross_salary === null || 
            record.net_salary === undefined || record.net_salary === null) {
          // Get employee name for better error message
          const { rows: empRows } = await query(
            `select name, employee_id from employees where id = $1`,
            [record.employee_id]
          ).catch(() => ({ rows: [] }))
          const empName = empRows.length > 0 ? empRows[0].name : record.employee_id || 'unknown'
          const missingFields = []
          if (!record.employee_id) missingFields.push('employee_id')
          if (record.gross_salary === undefined || record.gross_salary === null) missingFields.push('gross_salary')
          if (record.net_salary === undefined || record.net_salary === null) missingFields.push('net_salary')
          errors.push(`Invalid record for ${empName} (${empRows.length > 0 ? empRows[0].employee_id : record.employee_id || 'unknown'}): missing required fields: ${missingFields.join(', ')}`)
          continue
        }

        // Validate employee exists in database
        const { rows: employeeCheck } = await query(
          `select id from employees where id = $1`,
          [record.employee_id]
        )
        if (employeeCheck.length === 0) {
          errors.push(`Employee with ID ${record.employee_id} does not exist in the database`)
          continue
        }

        // Check for duplicates (same employee + month) - use month comparison to handle timezone issues
        const monthYear = period_month.slice(0, 7) // Extract YYYY-MM from input
        const { rows: existing } = await query(
          `select id from payroll_records 
           where employee_id = $1 
           and to_char(month, 'YYYY-MM') = $2`,
          [record.employee_id, monthYear]
        )

        if (existing.length > 0) {
          // Check if the data has actually changed by fetching existing record
          const { rows: existingRecord } = await query(
            `select 
               gross_salary, basic_salary, allowances_total, overtime, bonuses,
               nssf_employee, nssf_employer, shif_employee, shif_employer,
               ahl_employee, ahl_employer, helb, voluntary_deductions_total,
               paye_before_relief, personal_relief, paye_after_relief,
               total_deductions, net_salary, total_employer_cost
             from payroll_records
             where id = $1`,
            [existing[0].id]
          )

          if (existingRecord.length > 0) {
            const existingData = existingRecord[0]
            // Compare if values are the same (allowing for small floating point differences)
            const valuesChanged = 
              Math.abs((existingData.gross_salary || 0) - (record.gross_salary || 0)) > 0.01 ||
              Math.abs((existingData.basic_salary || 0) - (record.basic_salary || 0)) > 0.01 ||
              Math.abs((existingData.net_salary || 0) - (record.net_salary || 0)) > 0.01 ||
              Math.abs((existingData.paye_after_relief || 0) - (record.paye_after_relief || 0)) > 0.01

            if (!valuesChanged) {
              // No changes detected - skip update and inform user
              const { rows: empRows } = await query(
                `select name, employee_id from employees where id = $1`,
                [record.employee_id]
              ).catch(() => ({ rows: [] }))
              const empName = empRows.length > 0 ? empRows[0].name : record.employee_id
              // This is not an error - just skip updating unchanged records
              continue // Skip this record - no changes needed
            }
          }

          // Update existing record - use make_date() for YYYY-MM format to avoid timezone issues
          // Use explicit CAST to help PostgreSQL determine parameter types
          const updateQuery = period_month.length === 7
            ? `update payroll_records
               set gross_salary = $2,
                   basic_salary = $3,
                   allowances_total = $4,
                   overtime = $5,
                   bonuses = $6,
                   nssf_employee = $7,
                   nssf_employer = $8,
                   shif_employee = $9,
                   shif_employer = $10,
                   ahl_employee = $11,
                   ahl_employer = $12,
                   helb = $13,
                   voluntary_deductions_total = $14,
                   paye_before_relief = $15,
                   personal_relief = $16,
                   paye_after_relief = $17,
                   total_deductions = $18,
                   net_salary = $19,
                   total_employer_cost = $20,
                   month = make_date(CAST($21 AS INTEGER), CAST($22 AS INTEGER), 1)
               where employee_id = $1 
               and to_char(month, 'YYYY-MM') = $23
               returning id::text, employee_id::text, month, net_salary::float8 as net_salary`
            : `update payroll_records
               set gross_salary = $2,
                   basic_salary = $3,
                   allowances_total = $4,
                   overtime = $5,
                   bonuses = $6,
                   nssf_employee = $7,
                   nssf_employer = $8,
                   shif_employee = $9,
                   shif_employer = $10,
                   ahl_employee = $11,
                   ahl_employer = $12,
                   helb = $13,
                   voluntary_deductions_total = $14,
                   paye_before_relief = $15,
                   personal_relief = $16,
                   paye_after_relief = $17,
                   total_deductions = $18,
                   net_salary = $19,
                   total_employer_cost = $20,
                   month = $21::date
               where employee_id = $1 
               and to_char(month, 'YYYY-MM') = $22
               returning id::text, employee_id::text, month, net_salary::float8 as net_salary`
          
          const updateParams = period_month.length === 7
            ? [
                record.employee_id,
                record.gross_salary || 0,
                record.basic_salary || 0,
                record.allowances_total || 0,
                record.overtime || 0,
                record.bonuses || 0,
                record.nssf_employee || 0,
                record.nssf_employer || 0,
                record.shif_employee || 0,
                record.shif_employer || 0,
                record.ahl_employee || 0,
                record.ahl_employer || 0,
                record.helb || 0,
                record.voluntary_deductions_total || 0,
                record.paye_before_relief || 0,
                record.personal_relief || 0,
                record.paye_after_relief || 0,
                record.total_deductions || 0,
                record.net_salary || 0,
                record.total_employer_cost || 0,
                parseInt(period_month.split('-')[0]), // year (must be int)
                parseInt(period_month.split('-')[1]), // month (must be int)
                periodMonthYear // for WHERE clause
              ]
            : [
                record.employee_id,
                record.gross_salary || 0,
                record.basic_salary || 0,
                record.allowances_total || 0,
                record.overtime || 0,
                record.bonuses || 0,
                record.nssf_employee || 0,
                record.nssf_employer || 0,
                record.shif_employee || 0,
                record.shif_employer || 0,
                record.ahl_employee || 0,
                record.ahl_employer || 0,
                record.helb || 0,
                record.voluntary_deductions_total || 0,
                record.paye_before_relief || 0,
                record.personal_relief || 0,
                record.paye_after_relief || 0,
                record.total_deductions || 0,
                record.net_salary || 0,
                record.total_employer_cost || 0,
                periodDateStr, // date value
                periodMonthYear // for WHERE clause
              ]
          
          const { rows } = await query(updateQuery, updateParams)
          if (rows.length > 0) {
            updatedRecords.push(rows[0])
            insertedRecords.push(rows[0])
          }
        } else {
          // Insert new record - use make_date() for YYYY-MM format to avoid timezone issues
          // Use explicit CAST to help PostgreSQL determine parameter types
          const insertQuery = period_month.length === 7
            ? `insert into payroll_records (
                 employee_id, month, gross_salary, basic_salary, allowances_total,
                 overtime, bonuses, nssf_employee, nssf_employer,
                 shif_employee, shif_employer, ahl_employee, ahl_employer,
                 helb, voluntary_deductions_total, paye_before_relief,
                 personal_relief, paye_after_relief, total_deductions,
                 net_salary, total_employer_cost
               ) values ($1, make_date(CAST($2 AS INTEGER), CAST($3 AS INTEGER), 1), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
               returning id::text, employee_id::text, month, net_salary::float8 as net_salary`
            : `insert into payroll_records (
                 employee_id, month, gross_salary, basic_salary, allowances_total,
                 overtime, bonuses, nssf_employee, nssf_employer,
                 shif_employee, shif_employer, ahl_employee, ahl_employer,
                 helb, voluntary_deductions_total, paye_before_relief,
                 personal_relief, paye_after_relief, total_deductions,
                 net_salary, total_employer_cost
               ) values ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
               returning id::text, employee_id::text, month, net_salary::float8 as net_salary`
          
          const insertParams = period_month.length === 7
            ? [
                record.employee_id,
                parseInt(period_month.split('-')[0]), // year (must be int)
                parseInt(period_month.split('-')[1]), // month (must be int)
                record.gross_salary || 0,
                record.basic_salary || 0,
                record.allowances_total || 0,
                record.overtime || 0,
                record.bonuses || 0,
                record.nssf_employee || 0,
                record.nssf_employer || 0,
                record.shif_employee || 0,
                record.shif_employer || 0,
                record.ahl_employee || 0,
                record.ahl_employer || 0,
                record.helb || 0,
                record.voluntary_deductions_total || 0,
                record.paye_before_relief || 0,
                record.personal_relief || 0,
                record.paye_after_relief || 0,
                record.total_deductions || 0,
                record.net_salary || 0,
                record.total_employer_cost || 0
              ]
            : [
                record.employee_id,
                periodDateStr,
                record.gross_salary || 0,
                record.basic_salary || 0,
                record.allowances_total || 0,
                record.overtime || 0,
                record.bonuses || 0,
                record.nssf_employee || 0,
                record.nssf_employer || 0,
                record.shif_employee || 0,
                record.shif_employer || 0,
                record.ahl_employee || 0,
                record.ahl_employer || 0,
                record.helb || 0,
                record.voluntary_deductions_total || 0,
                record.paye_before_relief || 0,
                record.personal_relief || 0,
                record.paye_after_relief || 0,
                record.total_deductions || 0,
                record.net_salary || 0,
                record.total_employer_cost || 0
              ]
          
          const { rows } = await query(insertQuery, insertParams)
          if (rows.length > 0) {
            newRecords.push(rows[0])
            insertedRecords.push(rows[0])
          }
        }
      } catch (recordError: any) {
        console.error('[api/payroll/process] Error processing record:', recordError)
        // Get employee name for better error message
        const { rows: empRows } = await query(
          `select name, employee_id from employees where id = $1`,
          [record.employee_id]
        ).catch(() => ({ rows: [] }))
        const empName = empRows.length > 0 ? empRows[0].name : record.employee_id
        errors.push(`Failed to process record for ${empName} (${empRows.length > 0 ? empRows[0].employee_id : 'ID: ' + record.employee_id}): ${recordError?.message || 'Unknown error'}`)
      }
    }

    // Count how many records were skipped (unchanged)
    const unchangedCount = records.length - insertedRecords.length - errors.length

    if (errors.length > 0 && insertedRecords.length === 0) {
      // All records failed - provide helpful error message
      let errorMessage = 'All records failed to process.'
      if (errors.length > 0) {
        errorMessage += ' Details: ' + errors.slice(0, 3).join('; ')
        if (errors.length > 3) {
          errorMessage += ` ... and ${errors.length - 3} more error(s).`
        }
      }
      res.status(500).json({ 
        error: errorMessage, 
        details: errors,
        records_processed: insertedRecords.length,
        records_failed: errors.length,
        records_unchanged: unchangedCount
      })
      return
    }

    // Check if all records were skipped (no changes)
    if (insertedRecords.length === 0 && unchangedCount > 0 && errors.length === 0) {
      res.status(200).json({
        data: {
          payroll_run_id: payrollRunId,
          period_month: periodDateStr,
          records_inserted: 0,
          records_updated: 0,
          records_created: 0,
          records_failed: 0,
          records_unchanged: unchangedCount,
          message: `All ${unchangedCount} record(s) already exist and have not been modified. No changes were saved.`,
          records: [],
          updated_records: [],
          new_records: []
        }
      })
      return
    }

    res.status(200).json({
      data: {
        payroll_run_id: payrollRunId,
        period_month: periodDateStr,
        records_inserted: insertedRecords.length,
        records_updated: updatedRecords.length,
        records_created: newRecords.length,
        records_failed: errors.length,
        records: insertedRecords,
        updated_records: updatedRecords,
        new_records: newRecords,
        errors: errors.length > 0 ? errors : undefined
      }
    })
  } catch (e: any) {
    console.error('[api/payroll/process] Error:', e)
    res.status(500).json({ error: e?.message || 'Failed to process payroll' })
  }
})

// Payslips endpoint - fetch saved payslips from database
app.get('/api/payslips', async (req, res) => {
  try {
    const { employee_id, month } = req.query

    let sqlQuery = `
      select 
        v.id::text,
        v.employee_id as employee_code,
        v.employee_uuid::text as employee_id,
        v.employee_name,
        v.month,
        v.gross_salary::float8 as gross_salary,
        v.basic_salary::float8 as basic_salary,
        v.allowances_total::float8 as allowances_total,
        v.overtime::float8 as overtime,
        v.bonuses::float8 as bonuses,
        v.nssf_employee::float8 as nssf_employee,
        v.nssf_employer::float8 as nssf_employer,
        v.shif_employee::float8 as shif_employee,
        v.shif_employer::float8 as shif_employer,
        v.ahl_employee::float8 as ahl_employee,
        v.ahl_employer::float8 as ahl_employer,
        v.helb::float8 as helb,
        v.voluntary_deductions_total::float8 as voluntary_deductions_total,
        v.paye_before_relief::float8 as paye_before_relief,
        v.personal_relief::float8 as personal_relief,
        v.paye_after_relief::float8 as paye_after_relief,
        v.total_deductions::float8 as total_deductions,
        v.net_salary::float8 as net_salary,
        v.total_employer_cost::float8 as total_employer_cost,
        to_char(v.created_at, 'YYYY-MM-DD"T"HH24:MI:SSZ') as created_at
      from v_payslips v
      where 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (employee_id) {
      // Check if it's a UUID (36 chars with hyphens) or employee code
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employee_id as string)
      if (isUUID) {
        sqlQuery += ` and v.employee_uuid = $${paramIndex}`
      } else {
        sqlQuery += ` and v.employee_id = $${paramIndex}`
      }
      params.push(employee_id)
      paramIndex++
    }

    if (month) {
      // v.month is already formatted as 'YYYY-MM' text in the view
      // So we can compare it directly without to_char
      sqlQuery += ` and v.month = $${paramIndex}`
      params.push(month)
      paramIndex++
    }

    sqlQuery += ` order by v.month desc, v.employee_name asc`

    const { rows } = await query(sqlQuery, params)
    res.status(200).json({ data: rows })
  } catch (e: any) {
    console.error('[api/payslips] Error:', e)
    res.status(500).json({ error: e?.message || 'Failed to fetch payslips' })
  }
})

// Remittances endpoint - aggregate remittance data from payroll_records
app.get('/api/remittances', async (req, res) => {
  try {
    const { month } = req.query

    if (!month || typeof month !== 'string') {
      res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' })
      return
    }

    // Get totals and per-employee breakdown for the month
    const { rows: totalsRows } = await query(
      `select 
        coalesce(sum(nssf_employee), 0)::float8 as nssf_employee_total,
        coalesce(sum(nssf_employer), 0)::float8 as nssf_employer_total,
        coalesce(sum(shif_employee), 0)::float8 as shif_employee_total,
        coalesce(sum(shif_employer), 0)::float8 as shif_employer_total,
        coalesce(sum(ahl_employee), 0)::float8 as ahl_employee_total,
        coalesce(sum(ahl_employer), 0)::float8 as ahl_employer_total,
        coalesce(sum(paye_after_relief), 0)::float8 as paye_total,
        coalesce(sum(net_salary), 0)::float8 as total_net_payroll,
        coalesce(sum(total_employer_cost), 0)::float8 as total_employer_cost,
        count(*)::int as employee_count
       from payroll_records
       where to_char(month, 'YYYY-MM') = $1`,
      [month]
    )

    const totals = totalsRows[0]

    // Get per-employee breakdown
    const { rows: employeesRows } = await query(
      `select 
        e.id::text as employee_id,
        e.employee_id as employee_code,
        e.name as employee_name,
        pr.gross_salary::float8 as gross_salary,
        pr.nssf_employee::float8 as nssf_employee,
        pr.nssf_employer::float8 as nssf_employer,
        pr.shif_employee::float8 as shif_employee,
        pr.shif_employer::float8 as shif_employer,
        pr.ahl_employee::float8 as ahl_employee,
        pr.ahl_employer::float8 as ahl_employer,
        pr.paye_after_relief::float8 as paye,
        pr.net_salary::float8 as net_salary,
        pr.total_employer_cost::float8 as employer_cost
       from payroll_records pr
       join employees e on e.id = pr.employee_id
       where to_char(pr.month, 'YYYY-MM') = $1
       order by e.name asc`,
      [month]
    )

    res.status(200).json({
      data: {
        month,
        totals: {
          nssfEmployee: parseFloat(totals.nssf_employee_total) || 0,
          nssfEmployer: parseFloat(totals.nssf_employer_total) || 0,
          nssfTotal: (parseFloat(totals.nssf_employee_total) || 0) + (parseFloat(totals.nssf_employer_total) || 0),
          shifEmployee: parseFloat(totals.shif_employee_total) || 0,
          shifEmployer: parseFloat(totals.shif_employer_total) || 0,
          shifTotal: (parseFloat(totals.shif_employee_total) || 0) + (parseFloat(totals.shif_employer_total) || 0),
          ahlEmployee: parseFloat(totals.ahl_employee_total) || 0,
          ahlEmployer: parseFloat(totals.ahl_employer_total) || 0,
          ahlTotal: (parseFloat(totals.ahl_employee_total) || 0) + (parseFloat(totals.ahl_employer_total) || 0),
          payeTotal: parseFloat(totals.paye_total) || 0,
          totalNetPayroll: parseFloat(totals.total_net_payroll) || 0,
          totalEmployerCost: parseFloat(totals.total_employer_cost) || 0,
          employeeCount: parseInt(totals.employee_count) || 0
        },
        employees: employeesRows.map((row: any) => ({
          employee_id: row.employee_id,
          employee_code: row.employee_code,
          employee_name: row.employee_name,
          gross_salary: parseFloat(row.gross_salary) || 0,
          nssf_employee: parseFloat(row.nssf_employee) || 0,
          nssf_employer: parseFloat(row.nssf_employer) || 0,
          shif_employee: parseFloat(row.shif_employee) || 0,
          shif_employer: parseFloat(row.shif_employer) || 0,
          ahl_employee: parseFloat(row.ahl_employee) || 0,
          ahl_employer: parseFloat(row.ahl_employer) || 0,
          paye: parseFloat(row.paye) || 0,
          net_salary: parseFloat(row.net_salary) || 0,
          employer_cost: parseFloat(row.employer_cost) || 0
        }))
      }
    })
  } catch (e: any) {
    console.error('[api/remittances] Error:', e)
    res.status(500).json({ error: e?.message || 'Failed to fetch remittances' })
  }
})

// P9 Forms endpoint - aggregate annual data from payroll_records
app.get('/api/p9', async (req, res) => {
  try {
    const { employee_id, year } = req.query

    if (!employee_id || !year) {
      res.status(400).json({ error: 'Both employee_id and year parameters are required' })
      return
    }

    const yearInt = parseInt(year as string)
    if (isNaN(yearInt)) {
      res.status(400).json({ error: 'Invalid year format' })
      return
    }

    // Get employee info - handle both UUID and employee_code
    // Check if employee_id is a UUID format (36 chars with hyphens) or employee code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employee_id as string)
    
    const employeeQuery = isUUID
      ? `select id::text, employee_id, name, kra_pin
         from employees
         where id = $1`
      : `select id::text, employee_id, name, kra_pin
         from employees
         where employee_id = $1`
    
    const { rows: employeeRows } = await query(employeeQuery, [employee_id])

    if (!employeeRows || employeeRows.length === 0) {
      res.status(404).json({ error: 'Employee not found' })
      return
    }

    const employee = employeeRows[0]

    // Aggregate annual totals from payroll_records
    const { rows: totalsRows } = await query(
      `select 
        coalesce(sum(gross_salary), 0)::float8 as gross_salary_total,
        coalesce(sum(basic_salary), 0)::float8 as basic_salary_total,
        coalesce(sum(allowances_total), 0)::float8 as allowances_total,
        coalesce(sum(nssf_employee), 0)::float8 as nssf_employee_total,
        coalesce(sum(nssf_employer), 0)::float8 as nssf_employer_total,
        coalesce(sum(shif_employee), 0)::float8 as shif_employee_total,
        coalesce(sum(shif_employer), 0)::float8 as shif_employer_total,
        coalesce(sum(ahl_employee), 0)::float8 as ahl_employee_total,
        coalesce(sum(ahl_employer), 0)::float8 as ahl_employer_total,
        coalesce(sum(helb), 0)::float8 as helb_total,
        coalesce(sum(voluntary_deductions_total), 0)::float8 as voluntary_deductions_total,
        coalesce(sum(paye_after_relief), 0)::float8 as paye_total,
        coalesce(sum(net_salary), 0)::float8 as net_salary_total,
        coalesce(sum(total_employer_cost), 0)::float8 as total_employer_cost,
        count(*)::int as months_count
       from payroll_records
       where employee_id = $1
         and extract(year from month) = $2`,
      [employee_id, yearInt]
    )

    const totals = totalsRows[0]

    // Get monthly breakdown
    const { rows: monthlyRows } = await query(
      `select 
        to_char(month, 'YYYY-MM') as month,
        to_char(month, 'Month YYYY') as month_name,
        gross_salary::float8 as gross_salary,
        net_salary::float8 as net_salary,
        paye_after_relief::float8 as paye,
        nssf_employee::float8 as nssf_employee,
        nssf_employer::float8 as nssf_employer,
        shif_employee::float8 as shif_employee,
        ahl_employee::float8 as ahl_employee,
        ahl_employer::float8 as ahl_employer
       from payroll_records
       where employee_id = $1
         and extract(year from month) = $2
       order by month asc`,
      [employee_id, yearInt]
    )

    res.status(200).json({
      data: {
        id: employee.id,
        employee_id: employee.employee_id,
        employee_name: employee.name,
        kra_pin: employee.kra_pin,
        year: yearInt,
        gross_salary_total: parseFloat(totals.gross_salary_total) || 0,
        basic_salary_total: parseFloat(totals.basic_salary_total) || 0,
        allowances_total: parseFloat(totals.allowances_total) || 0,
        nssf_employee_total: parseFloat(totals.nssf_employee_total) || 0,
        nssf_employer_total: parseFloat(totals.nssf_employer_total) || 0,
        shif_employee_total: parseFloat(totals.shif_employee_total) || 0,
        shif_employer_total: parseFloat(totals.shif_employer_total) || 0,
        ahl_employee_total: parseFloat(totals.ahl_employee_total) || 0,
        ahl_employer_total: parseFloat(totals.ahl_employer_total) || 0,
        helb_total: parseFloat(totals.helb_total) || 0,
        voluntary_deductions_total: parseFloat(totals.voluntary_deductions_total) || 0,
        paye_total: parseFloat(totals.paye_total) || 0,
        net_salary_total: parseFloat(totals.net_salary_total) || 0,
        total_employer_cost: parseFloat(totals.total_employer_cost) || 0,
        months_count: parseInt(totals.months_count) || 0,
        status: parseInt(totals.months_count) > 0 ? 'completed' : 'pending',
        monthly_breakdown: monthlyRows.map((row: any) => ({
          month: row.month,
          month_name: row.month_name.trim(),
          gross_salary: parseFloat(row.gross_salary) || 0,
          net_salary: parseFloat(row.net_salary) || 0,
          paye: parseFloat(row.paye) || 0,
          nssf_employee: parseFloat(row.nssf_employee) || 0,
          nssf_employer: parseFloat(row.nssf_employer) || 0,
          shif_employee: parseFloat(row.shif_employee) || 0,
          ahl_employee: parseFloat(row.ahl_employee) || 0,
          ahl_employer: parseFloat(row.ahl_employer) || 0
        }))
      }
    })
  } catch (e: any) {
    console.error('[api/p9] Error:', e)
    res.status(500).json({ error: e?.message || 'Failed to fetch P9 data' })
  }
})

// Export app for Vercel serverless function
export default app

// Start server with port conflict handling (only in development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  async function startServer() {
    try {
      const port = await findAvailablePort(DEFAULT_PORT)
      
      // Store the port in an environment variable for Vite to pick up
      if (port !== DEFAULT_PORT) {
        process.env.API_PORT = port.toString()
        console.log(`[api] Port ${DEFAULT_PORT} was in use, using port ${port} instead`)
        console.log(`[api] Set API_PORT=${port} if you need to configure the frontend proxy`)
      }
      
      app.listen(port, () => {
        console.log(`[api] ✓ Server listening on http://localhost:${port}`)
      }).on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`[api] ✗ Port ${port} is already in use.`)
          console.error(`[api] Run: tsx scripts/kill-port.ts ${port}`)
          console.error(`[api] Or: lsof -ti:${port} | xargs kill -9`)
          process.exit(1)
        } else {
          console.error('[api] Server error:', err)
          process.exit(1)
        }
      })
    } catch (error) {
      console.error('[api] Failed to start server:', error)
      if (error instanceof Error) {
        console.error('[api] Error details:', error.message)
      }
      process.exit(1)
    }
  }

  startServer()
}


