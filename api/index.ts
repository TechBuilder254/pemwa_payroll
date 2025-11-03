/**
 * Vercel Serverless Function Entry Point
 * Import server app from local file (same directory) to avoid module resolution issues
 */

// Import from local file in api directory - Vercel will compile this correctly
import app from './server-app.js'

// Export the Express app for Vercel
export default app
