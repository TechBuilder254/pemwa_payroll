/**
 * Setup Supabase Database Schema
 * This script helps you run the schema.sql in Supabase
 */

import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// You need to get your database password from Supabase Dashboard
// Go to: Settings → Database → Connection string → URI
// Copy the password from that connection string

async function setupSupabaseDatabase() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2]
  
  if (!dbPassword) {
    console.log('❌ Database password required!')
    console.log('')
    console.log('📋 Get your database password:')
    console.log('1. Go to: https://supabase.com/dashboard/project/ksuxoaddqqffoueuzmuk/settings/database')
    console.log('2. Find "Connection string" section')
    console.log('3. Click on "URI" tab')
    console.log('4. Copy the connection string (looks like: postgresql://postgres:[PASSWORD]@db.ksuxoaddqqffoueuzmuk.supabase.co:5432/postgres)')
    console.log('5. Extract the password from [PASSWORD]')
    console.log('')
    console.log('Then run:')
    console.log('  SUPABASE_DB_PASSWORD=your_password npm run setup:supabase-db')
    console.log('  OR')
    console.log('  tsx scripts/setup-supabase-db.ts your_password')
    process.exit(1)
  }

  // Try connection pooler first (recommended for server apps)
  // Format: postgresql://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres
  // Fallback to direct connection: postgresql://postgres:password@db.project.supabase.co:5432/postgres
  
  const connectionString = `postgresql://postgres:${dbPassword}@db.ksuxoaddqqffoueuzmuk.supabase.co:5432/postgres?sslmode=require`
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔌 Connecting to Supabase database...')
    await client.connect()
    console.log('✅ Connected!')
    
    // Read schema file
    const schemaPath = path.resolve(process.cwd(), 'schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    console.log('📄 Schema file loaded')
    
    // Execute schema
    console.log('🚀 Executing schema...')
    await client.query(schemaSQL)
    
    console.log('✅ Schema executed successfully!')
    console.log('')
    console.log('📋 Verifying tables...')
    
    // Verify tables were created
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('✅ Created tables:')
    tables.forEach((t: any) => {
      console.log(`   - ${t.table_name}`)
    })
    
    // Verify views
    const { rows: views } = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `)
    
    if (views.length > 0) {
      console.log('✅ Created views:')
      views.forEach((v: any) => {
        console.log(`   - ${v.table_name}`)
      })
    }
    
    console.log('')
    console.log('🎉 Database setup complete!')
    console.log('')
    console.log('📝 Next: Update your .env.local file:')
    console.log('   SUPABASE_DB_URL=' + connectionString)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('password authentication')) {
      console.error('   Make sure you provided the correct database password')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

setupSupabaseDatabase()

