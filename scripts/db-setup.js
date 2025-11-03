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

async function seedDefaultSettings() {
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  const { rows } = await db.query('SELECT id FROM payroll_settings WHERE is_active = true LIMIT 1');
  if (rows.length === 0) {
    console.log('Seeding default payroll settings...');
    await db.query(`
      INSERT INTO payroll_settings (
        personal_relief,
        nssf_employee_rate,
        nssf_employer_rate,
        nssf_max_contribution,
        shif_employee_rate,
        shif_employer_rate,
        ahl_employee_rate,
        ahl_employer_rate,
        paye_brackets,
        effective_from,
        is_active
      ) VALUES (
        2400,
        0.06,
        0.06,
        4320,
        0.0275,
        0.0275,
        0.015,
        0.015,
        '[
          {"min": 0, "max": 288000, "rate": 0.10},
          {"min": 288001, "max": 388000, "rate": 0.25},
          {"min": 388001, "max": null, "rate": 0.30}
        ]'::jsonb,
        CURRENT_DATE,
        true
      )
    `);
    console.log('Default settings seeded.');
  } else {
    console.log('Settings already exist, skipping seed.');
  }
  await db.end();
}

(async () => {
  try {
    console.log('Checking database...');
    try {
      await ensureDatabase();
    } catch (dbErr) {
      console.log('⚠️  Could not create database automatically (this is OK)');
      console.log('   Please run: sudo -u postgres psql -c \'CREATE DATABASE pemwa_payroll;\'');
    }
    
    console.log('Applying schema...');
    await applySchema();
    
    console.log('Seeding defaults...');
    await seedDefaultSettings();
    
    console.log('✅ Done.');
    process.exit(0);
  } catch (e) {
    console.error('❌ ERROR:', e.message);
    process.exit(1);
  }
})();
