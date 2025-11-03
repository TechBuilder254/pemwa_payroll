# Vercel Deployment Guide

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Supabase database configured
3. Environment variables ready

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables

```
SUPABASE_DB_URL=postgresql://postgres.ksuxoaddqqffoueuzmuk:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
VITE_SUPABASE_URL=https://ksuxoaddqqffoueuzmuk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
SESSION_SECRET=your-random-session-secret-change-this
JWT_SECRET=your-random-jwt-secret-change-this
NODE_ENV=production
```

### Optional Variables

```
FRONTEND_URL=https://your-app.vercel.app
API_PORT=5174
```

## Deployment Steps

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect the framework (Vite)

3. **Set Environment Variables**
   - In Vercel project settings, add all required environment variables listed above

4. **Deploy**
   - Vercel will automatically build and deploy
   - Watch the build logs for any issues

## Build Configuration

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## API Routes

All API routes are served via `/api/*` through the Express serverless function in `api/index.ts`.

## Database Connection

The app uses Supabase PostgreSQL via connection pooling. Make sure:
- `SUPABASE_DB_URL` uses the connection pooler (port 6543)
- Database is accessible from Vercel's IP ranges (Supabase allows all by default)

## Post-Deployment

1. **Create Admin User**
   - Use Vercel CLI or connect to your database
   - Run: `npm run create-admin` locally with proper env vars
   - Or use Supabase SQL editor to insert admin user

2. **Verify**
   - Visit your deployed URL
   - Test login functionality
   - Check API endpoints

## Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify `SUPABASE_DB_URL` is correct
- Check Supabase network restrictions (should allow all IPs)
- Test connection using `npm run db:connect` locally

### API Errors
- Check serverless function logs in Vercel dashboard
- Verify CORS settings if frontend can't reach API
- Ensure session/JWT secrets are set

## Monitoring

- View function logs: Vercel Dashboard → Deployments → Click deployment → Functions
- View build logs: Vercel Dashboard → Deployments → Click deployment → Build Logs
- Monitor performance: Vercel Dashboard → Analytics

