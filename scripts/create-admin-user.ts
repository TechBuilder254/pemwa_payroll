/**
 * Script to create an admin user in the database
 * Usage: tsx scripts/create-admin-user.ts [email] [password] [name]
 */

import { query } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function createAdminUser() {
  const email = process.argv[2] || 'admin@pemwa.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Admin User'

  try {
    console.log('Creating admin user...')
    console.log(`Email: ${email}`)
    console.log(`Name: ${name}`)

    // Check if user already exists
    const existing = await query(
      `select id from users where email = $1`,
      [email.toLowerCase()]
    )

    if (existing.rows.length > 0) {
      console.log('⚠️  User with this email already exists!')
      process.exit(1)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { rows } = await query(
      `insert into users (email, password_hash, name, role, is_active)
       values ($1, $2, $3, 'admin', true)
       returning id::text, email, name, role`,
      [email.toLowerCase(), passwordHash, name]
    )

    const user = rows[0]

    console.log('✅ Admin user created successfully!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log('\n💡 You can now login with these credentials.')
  } catch (error: any) {
    console.error('❌ Failed to create admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

