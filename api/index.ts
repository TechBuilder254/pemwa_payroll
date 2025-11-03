/**
 * Vercel Serverless Function Entry Point
 * This wraps the Express app for Vercel deployment
 */

import app from '../server/index'

// For Vercel, export the Express app directly
// Vercel will automatically handle routing when the app is exported
export default app

