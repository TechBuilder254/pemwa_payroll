const fs = require('fs');
let url = process.env.DATABASE_URL;
if (!url) {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL\s*=\s*(.+)$/);
      if (m) { url = m[1].trim(); break; }
    }
  } catch {}
}
if (!url) { console.error('No DATABASE_URL set'); process.exit(2); }
const { Pool } = require('pg');
const targetDb = new URL(url).pathname.replace('/', '') || 'pemwa_payroll';
const admin = new URL(url); admin.pathname = '/postgres';
(async () => {
  try {
    const pool = new Pool({ connectionString: admin.toString() });
    const { rows } = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    console.log(rows.length ? 'EXISTS' : 'MISSING');
    await pool.end();
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
