const routes = [
  '/',
  '/employees',
  '/employees/new',
  '/payroll',
  '/payslips',
  '/remittances',
  '/p9',
  '/settings',
]

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return
    } catch (_) {}
    await delay(1000)
  }
  throw new Error('Dev server did not become ready in time')
}

async function warmup() {
  const base = process.env.NEXT_DEV_URL || 'http://localhost:3000'
  try {
    await waitForServer(base)
  } catch (e) {
    console.error(String(e))
    process.exit(1)
  }
  for (const route of routes) {
    const url = base + route
    try {
      const res = await fetch(url, { cache: 'no-store' })
      console.log(`Warmed ${route} -> ${res.status}`)
    } catch (e) {
      console.warn(`Warmup failed for ${route}: ${e}`)
    }
    // tiny pause to avoid hammering
    await delay(150)
  }
}

warmup().then(() => process.exit(0))



