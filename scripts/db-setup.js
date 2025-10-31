const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const env = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL\s*=\s*(.+)$/);
      if (m) { databaseUrl = m[1].trim(); break; }
    }
  } catch {}
}
if (!databaseUrl) {
  console.error('DATABASE_URL not set. Create .env.local first.');
  process.exit(2);
}

const targetDb = new URL(databaseUrl).pathname.replace('/', '') || 'pemwa_payroll';
const adminUrl = new URL(databaseUrl); adminUrl.pathname = '/postgres';

async function ensureDatabase() {
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
  if (rows.length === 0) {
    console.log(`Creating database ${targetDb}...`);
    await admin.query(`CREATE DATABASE ${JSON.stringify(targetDb).slice(1, -1)};`);
  } else {
    console.log('Database exists');
  }
  await admin.end();
}

async function applySchema() {
  const sqlPath = path.resolve(process.cwd(), 'schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.warn('schema.sql not found, skipping.');
    return;
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  console.log('Applying schema.sql ...');
  await db.query(sql);
  await db.end();
  console.log('Schema applied.');
}

(async () => {
  try {
    await ensureDatabase();
    await applySchema();
    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
