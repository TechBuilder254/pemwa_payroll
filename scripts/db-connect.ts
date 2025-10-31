import 'dotenv/config'
import { Client } from 'pg'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('[db-connect] DATABASE_URL is not set.')
    process.exit(2)
  }
  const client = new Client({ connectionString: databaseUrl })
  try {
    const safe = databaseUrl.replace(/:(.+)@/, '://****:****@')
    console.log('[db-connect] Connecting to:', safe)
    await client.connect()
    const { rows } = await client.query('select version() as version, current_database() as db')
    console.log('[db-connect] Connected OK')
    console.log('[db-connect] Server:', rows[0].version)
    console.log('[db-connect] Database:', rows[0].db)
    process.exitCode = 0
  } catch (e: any) {
    console.error('[db-connect] Error:', e?.message || e)
    process.exitCode = 1
  } finally {
    try { await client.end() } catch {}
  }
}

main()



