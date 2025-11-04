# Database Keep-Alive Cron Job Monitoring Guide

## How to Verify the Cron Job is Working

### 1. **Check Vercel Dashboard - Cron Jobs**

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (`pemwa-payroll`)
3. Click on **Cron Jobs** in the left sidebar
4. You should see:
   - **Job Name**: `/api/cron/db-keepalive`
   - **Schedule**: `0 */2 * * *` (Every 2 hours)
   - **Status**: Active
   - **Last Run**: Shows the timestamp of the last execution
   - **Next Run**: Shows when it will run next

### 2. **Check Vercel Logs**

1. Go to Vercel Dashboard → Your Project
2. Click on **Functions** tab
3. Click on **Logs** tab
4. Look for log entries with `[DB Keep-Alive Cron]` prefix
5. You should see entries like:
   ```
   [DB Keep-Alive Cron] ========================================
   [DB Keep-Alive Cron] Starting database keep-alive ping at 2025-01-15T10:00:00.000Z
   [DB Keep-Alive Cron] ✅ Secret verified successfully
   [DB Keep-Alive Cron] Executing query 1/8: Count employees
   [DB Keep-Alive Cron] ✅ Query executed successfully in 45ms
   [DB Keep-Alive Cron] ========================================
   ```

### 3. **Test the Endpoint Manually**

You can test the cron endpoint manually to verify it's working:

**Option A: Using Browser (after setting CRON_SECRET in Vercel)**
```
https://your-app.vercel.app/api/cron/test?secret=YOUR_CRON_SECRET
```

**Option B: Using cURL**
```bash
curl "https://your-app.vercel.app/api/cron/test?secret=YOUR_CRON_SECRET"
```

**Option C: Test the actual keep-alive endpoint**
```bash
curl "https://your-app.vercel.app/api/cron/db-keepalive?secret=YOUR_CRON_SECRET"
```

### 4. **Check Database Activity**

You can verify the database is being pinged by:

1. **Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to **Database** → **Logs** or **Database** → **Activity**
   - You should see periodic queries being executed every 2 hours

2. **Database Connection Logs**:
   - The cron job executes one of 8 different queries each time
   - Queries rotate based on the hour
   - Each query is lightweight (COUNT, SELECT with LIMIT 1, etc.)

### 5. **Expected Log Output**

When the cron job runs successfully, you should see logs like:

```
[DB Keep-Alive Cron] ========================================
[DB Keep-Alive Cron] Starting database keep-alive ping at 2025-01-15T10:00:00.000Z
[DB Keep-Alive Cron] ✅ Secret verified successfully
[DB Keep-Alive Cron] Executing query 1/8: Count employees
[DB Keep-Alive Cron] ✅ Query executed successfully in 45ms
[DB Keep-Alive Cron] Query result: {"count": 5}
[DB Keep-Alive Cron] ========================================
```

### 6. **Troubleshooting**

#### If the cron job is not running:

1. **Check CRON_SECRET is set**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `CRON_SECRET` is set for Production environment

2. **Check vercel.json**:
   - Ensure `crons` array is present in `vercel.json`
   - Verify the path is `/api/cron/db-keepalive`
   - Verify the schedule is `0 */2 * * *`

3. **Check deployment**:
   - Make sure you've deployed the latest code with cron configuration
   - Cron jobs are only active on Production deployments

4. **Check logs for errors**:
   - Look for `[DB Keep-Alive Cron] ❌` errors in logs
   - Common issues:
     - Missing CRON_SECRET
     - Invalid secret
     - Database connection issues

#### If you see "Unauthorized" errors:

- Verify `CRON_SECRET` environment variable is set correctly in Vercel
- Check that the secret matches what you're using in the test request
- Regenerate the secret if needed:
  ```bash
  openssl rand -base64 32
  ```

### 7. **Cron Schedule Explanation**

The schedule `0 */2 * * *` means:
- `0` - At minute 0 (top of the hour)
- `*/2` - Every 2 hours
- `*` - Every day of month
- `*` - Every month
- `*` - Every day of week

So it runs at: 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00

### 8. **Monitoring Best Practices**

- **Set up alerts** (optional): You can configure Vercel to send notifications if cron jobs fail
- **Check logs weekly**: Review logs to ensure the cron job is running consistently
- **Monitor database**: Check that Supabase database stays active and doesn't go to sleep
- **Test after deployment**: Always test the cron endpoint after deploying changes

---

## Quick Verification Checklist

- [ ] `CRON_SECRET` environment variable is set in Vercel
- [ ] `vercel.json` contains the `crons` configuration
- [ ] Latest code is deployed to Vercel
- [ ] Cron job appears in Vercel Dashboard → Cron Jobs
- [ ] Logs show successful execution every 2 hours
- [ ] Test endpoint (`/api/cron/test`) returns success
- [ ] Database stays active (no sleep mode)

---

## Need Help?

If the cron job is not working:
1. Check Vercel logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the endpoint manually with the secret
4. Check that the deployment includes the latest code with cron configuration

