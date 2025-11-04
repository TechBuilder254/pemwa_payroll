import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local
try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    for (const line of envContent.split(/\r?\n/)) {
      const match = line.match(/^(\w+)\s*=\s*(.+)$/)
      if (match) {
        process.env[match[1]] = match[2].trim()
      }
    }
  }
} catch (e) {
  console.error('[db-supabase] Failed to load .env.local:', e)
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ksuxoaddqqffoueuzmuk.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdXhvYWRkcXFmZm91ZXV6bXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxMTg5MywiZXhwIjoyMDc3NTg3ODkzfQ.vKVs76vadQ6QYxYYHL8hUL_FwGdyMniwFMHeq1FIPgk'

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('[db-supabase] ✅ Initialized Supabase admin client')

// Compatibility layer for server/index.ts
export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
}

// Parse and execute SQL queries via Supabase REST API
// This is a simplified adapter - complex queries may need manual conversion
export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    // For now, use Supabase's RPC or direct table access
    // This is a placeholder - we'll convert queries as needed
    
    console.log('[db-supabase] Query:', sql.substring(0, 100))
    
    // Simple SELECT queries - extract table name and columns
    const selectMatch = sql.match(/select\s+(.+?)\s+from\s+(\w+)/i)
    if (selectMatch) {
      const columns = selectMatch[1].trim()
      const table = selectMatch[2].trim()
      
      // Handle simple queries
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
      
      if (error) throw error
      
      return { rows: data as T[], rowCount: data?.length || 0 }
    }
    
    // Handle other query types
    throw new Error('Complex SQL queries not yet supported - use Supabase client directly')
  } catch (error: any) {
    console.error('[db-supabase] Query error:', error.message)
    throw error
  }
}

export const pool = {
  query,
  end: async () => {}
}



