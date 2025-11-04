/**
 * Database Keep-Alive Service
 * 
 * Prevents Supabase database from going to sleep by pinging it every 2 hours
 * via API endpoint. This ensures the database stays active even when idle.
 */

let keepAliveInterval: NodeJS.Timeout | null = null

/**
 * Execute a keep-alive ping via API endpoint
 */
async function executeKeepAlive(): Promise<void> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      console.warn('[DB Keep-Alive] No auth token found, skipping ping')
      return
    }
    
    const response = await fetch('/api/db/ping', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`[DB Keep-Alive] Successfully pinged database: ${data.data?.message || 'OK'}`)
  } catch (error: any) {
    // Log error but don't throw - keep-alive failures shouldn't break the app
    console.warn(`[DB Keep-Alive] Ping failed (non-critical):`, error?.message || error)
  }
}

/**
 * Start the database keep-alive service
 * Runs a ping query every 2 hours (7200000 milliseconds)
 * 
 * @param intervalMs - Interval in milliseconds (default: 2 hours)
 */
export function startDbKeepAlive(intervalMs: number = 2 * 60 * 60 * 1000): void {
  // Clear any existing interval
  stopDbKeepAlive()
  
  // Execute immediately on start
  executeKeepAlive()
  
  // Set up periodic execution
  keepAliveInterval = setInterval(() => {
    executeKeepAlive()
  }, intervalMs)
  
  console.log(`[DB Keep-Alive] Started - will ping database every ${intervalMs / 1000 / 60} minutes`)
}

/**
 * Stop the database keep-alive service
 */
export function stopDbKeepAlive(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
    console.log('[DB Keep-Alive] Stopped')
  }
}

/**
 * Check if keep-alive is currently running
 */
export function isKeepAliveRunning(): boolean {
  return keepAliveInterval !== null
}

