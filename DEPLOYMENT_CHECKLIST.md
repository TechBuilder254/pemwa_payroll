# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Set in Vercel Dashboard)

Required environment variables:
- [ ] `SUPABASE_DB_URL` - PostgreSQL connection string (connection pooler)
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_KEY` - Supabase service role key (if needed)
- [ ] `SESSION_SECRET` - Random secret for sessions (generate: `openssl rand -base64 32`)
- [ ] `JWT_SECRET` - Random secret for JWT tokens (generate: `openssl rand -base64 32`)
- [ ] `NODE_ENV` - Set to `production`

### 2. Database Configuration

- [ ] Supabase database is accessible (no IP restrictions or your Vercel IP is allowlisted)
- [ ] Connection pooler is enabled (port 6543)
- [ ] All tables are created (employees, payroll_settings, payroll_records, p9_records, payroll_runs, users)
- [ ] At least one admin user exists in the database

### 3. Build Verification

- [ ] Run `npm run build` locally - should complete without errors
- [ ] Check `dist/` folder is generated with all assets
- [ ] Verify TypeScript compiles without errors
- [ ] No linting errors that would block deployment

### 4. Code Review

- [ ] All API endpoints are properly exported
- [ ] CORS is configured for production domains
- [ ] Authentication middleware works correctly
- [ ] Database connection pooling is configured
- [ ] Error handling is in place

## 🚀 Deployment Steps

### Step 1: Prepare Repository

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Vite framework
4. **IMPORTANT**: Add all environment variables in Settings → Environment Variables
5. Click "Deploy"

### Step 3: Verify Deployment

After deployment, test these endpoints:

- [ ] `GET /` - Frontend loads
- [ ] `POST /api/auth/login` - Login works
- [ ] `GET /api/auth/me` - Authentication works
- [ ] `GET /api/employees` - Employees list loads
- [ ] `POST /api/employees` - Can create employee
- [ ] `GET /api/payroll/settings` - Settings load
- [ ] `GET /api/dashboard/stats` - Dashboard works
- [ ] `POST /api/payroll/process` - Payroll processing works
- [ ] `GET /api/payslips` - Payslips load
- [ ] `GET /api/remittances` - Remittances load
- [ ] `GET /api/p9` - P9 forms work

## 📋 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/next-id` - Get next employee ID

### Payroll
- `GET /api/payroll/settings` - Get payroll settings
- `PUT /api/payroll/settings` - Update payroll settings
- `POST /api/payroll/process` - Process payroll

### Reports
- `GET /api/payslips` - Get payslips
- `GET /api/remittances` - Get remittances
- `GET /api/p9` - Get P9 forms

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## ⚠️ Important Notes

1. **Session Storage**: On Vercel, sessions are stored per function instance. For production, consider using:
   - JWT tokens (already implemented - primary auth method)
   - Redis for session storage (if needed)
   - Database-backed sessions

2. **Database Connections**: 
   - Use connection pooler (port 6543) for better performance
   - Connection pooling is automatically handled by the pg Pool

3. **CORS**: 
   - Already configured to work with Vercel URLs
   - Update `FRONTEND_URL` if using custom domain

4. **Performance**:
   - Vercel functions have a 30-second timeout (configured)
   - Long-running queries should be optimized
   - Consider pagination for large datasets

## 🔧 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify all dependencies are in package.json
- Check TypeScript compilation errors

### API Returns 500
- Check Vercel function logs
- Verify database connection string
- Check environment variables

### CORS Errors
- Verify FRONTEND_URL matches your Vercel domain
- Check CORS configuration in server/index.ts

### Database Connection Timeout
- Verify SUPABASE_DB_URL uses connection pooler
- Check Supabase network restrictions
- Verify password is correct

## 📝 Post-Deployment

1. Create admin user via database or script
2. Test all features
3. Monitor function logs
4. Set up error tracking (optional)
5. Configure custom domain (optional)

