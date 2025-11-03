import { Pool, QueryResult, QueryResultRow } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
// In Vercel, env vars are automatically available, but we still load .env.local for local dev
if (!process.env.VERCEL) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local')
  dotenv.config({ path: envLocalPath })
} else {
  // On Vercel, just ensure dotenv is configured (it won't override existing env vars)
  dotenv.config()
}

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

// Validate connection string
if (!connectionString) {
  const errorMsg = 'Database connection string is required. Set SUPABASE_DB_URL or DATABASE_URL in environment variables'
  console.error('[db] ❌ Missing database connection string!')
  console.error('[db] VERCEL:', process.env.VERCEL ? 'YES' : 'NO')
  console.error('[db] Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('SUPABASE')).join(', ') || 'NONE')
  console.error('[db] Please set SUPABASE_DB_URL or DATABASE_URL')
  throw new Error(errorMsg)
}

// Validate connection string format and password
try {
  const url = new URL(connectionString)
  if (!url.password || url.password.trim() === '') {
    console.error('[db] ❌ Database connection string is missing password!')
    console.error('[db] Connection string format should be: postgresql://postgres:PASSWORD@host:port/database')
    throw new Error('Database connection string must include a password')
  }
} catch (e: any) {
  if (e.message.includes('password')) {
    throw e
  }
  console.warn('[db] ⚠️ Could not validate connection string format:', e.message)
}

export const pool = new Pool({
  connectionString,
  // For serverless (Vercel), reduce max connections to avoid connection exhaustion
  max: process.env.VERCEL ? 2 : 10,
  ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000, // 10 second timeout
  idleTimeoutMillis: 30000,
  allowExitOnIdle: true,
  // For serverless, close idle connections faster
  ...(process.env.VERCEL ? { idleTimeoutMillis: 10000 } : {}),
})

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    const res = await pool.query<T>(text, params)
    return res
  } catch (error: any) {
    console.error('[db] Query error:', error?.message)
    console.error('[db] Query:', text.substring(0, 100))
    console.error('[db] Error code:', error?.code)
    throw error
  }
}
