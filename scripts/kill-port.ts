#!/usr/bin/env tsx
/**
 * Utility script to kill processes running on a specific port
 * Usage: tsx scripts/kill-port.ts [port]
 */

import { execSync } from 'child_process'

const port = process.argv[2] || '5174'
const silent = process.argv.includes('--silent') || process.env.SILENT === 'true'

try {
  // Find process using the port (Linux/Mac)
  const command = `lsof -ti:${port}`
  const pid = execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  
  if (pid) {
    if (!silent) console.log(`Killing process ${pid} on port ${port}...`)
    execSync(`kill -9 ${pid}`, { stdio: silent ? 'pipe' : 'inherit' })
    if (!silent) console.log(`✓ Successfully killed process on port ${port}`)
  } else if (!silent) {
    console.log(`No process found on port ${port}`)
  }
} catch (error: any) {
  if (error.status === 1 || error.code === 1) {
    // lsof returns 1 when no process is found - this is OK
    if (!silent) console.log(`No process found on port ${port}`)
    // Don't exit with error for this case
  } else {
    if (!silent) console.error(`Error killing process on port ${port}:`, error.message)
    process.exit(1)
  }
}

