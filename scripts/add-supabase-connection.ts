/**
 * Helper script to add SUPABASE_DB_URL to .env.local
 * Usage: tsx scripts/add-supabase-connection.ts "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"
 */

import fs from 'fs'
import path from 'path'

const connectionString = process.argv[2]

if (!connectionString) {
  console.log('❌ Connection string required!')
  console.log('')
  console.log('Usage:')
  console.log('  tsx scripts/add-supabase-connection.ts "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"')
  console.log('')
  console.log('📋 How to get your Supabase connection string:')
  console.log('1. Go to: https://supabase.com/dashboard/project/ksuxoaddqqffoueuzmuk/settings/database')
  console.log('2. Scroll to "Connection string" section')
  console.log('3. Click on the "URI" tab')
  console.log('4. Copy the connection string (it looks like: postgresql://postgres:[YOUR-PASSWORD]@db.ksuxoaddqqffoueuzmuk.supabase.co:5432/postgres)')
  console.log('5. Replace [YOUR-PASSWORD] with your actual database password')
  console.log('6. Run this script with the full connection string')
  process.exit(1)
}

// Validate connection string format
try {
  const url = new URL(connectionString)
  if (url.protocol !== 'postgresql:') {
    throw new Error('Connection string must use postgresql:// protocol')
  }
  if (!url.password || url.password.trim() === '') {
    throw new Error('Connection string must include a password')
  }
  if (!url.hostname.includes('supabase')) {
    console.warn('⚠️  Warning: Connection string does not appear to be a Supabase URL')
  }
} catch (e: any) {
  if (e.code === 'ERR_INVALID_URL') {
    console.error('❌ Invalid connection string format!')
    console.error('Expected format: postgresql://postgres:PASSWORD@host:port/database')
  } else {
    console.error('❌ Error:', e.message)
  }
  process.exit(1)
}

// Read existing .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// Remove existing SUPABASE_DB_URL or DATABASE_URL if present
const lines = envContent.split(/\r?\n/)
const filteredLines = lines.filter(line => {
  const trimmed = line.trim()
  return !trimmed.startsWith('SUPABASE_DB_URL=') && 
         !trimmed.startsWith('DATABASE_URL=') &&
         !trimmed.match(/^SUPABASE_DB_URL\s*=/) &&
         !trimmed.match(/^DATABASE_URL\s*=/)
})

// Add the new connection string
filteredLines.push('')
filteredLines.push('# Supabase PostgreSQL Direct Connection')
filteredLines.push(`SUPABASE_DB_URL=${connectionString}`)

// Write back to file
fs.writeFileSync(envPath, filteredLines.join('\n') + '\n', 'utf8')

console.log('✅ Added SUPABASE_DB_URL to .env.local')
console.log('')
console.log('🔍 Verifying connection...')
console.log('Run: npm run db:connect')

