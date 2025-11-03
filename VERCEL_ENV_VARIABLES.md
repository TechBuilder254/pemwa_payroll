# Vercel Environment Variables

Copy and paste these into your Vercel project settings → Environment Variables.

## Required Environment Variables

### Database Connection
```
SUPABASE_DB_URL=postgresql://postgres.ksuxoaddqqffoueuzmuk:Aleqo.4080@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Supabase Configuration (if using Supabase client)
```
VITE_SUPABASE_URL=https://ksuxoaddqqffoueuzmuk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Security Secrets (Generate new random secrets!)
```
SESSION_SECRET=generate-random-secret-here
JWT_SECRET=generate-random-secret-here
JWT_EXPIRES_IN=7d
```

### Environment
```
NODE_ENV=production
```

---

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable above:
   - Click **Add New**
   - Paste the **Variable Name** (left side)
   - Paste the **Value** (right side)
   - Select **Environment**: Production, Preview, and Development (or just Production)
   - Click **Save**

---

## Generate Random Secrets

For `SESSION_SECRET` and `JWT_SECRET`, generate random strings:

**Option 1: Using OpenSSL (Terminal)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit: https://randomkeygen.com/ and use a "CodeIgniter Encryption Keys" or similar

---

## Important Notes:

⚠️ **Never commit secrets to Git!** These should only be in Vercel's environment variables.

⚠️ Replace `your-anon-key-here` with your actual Supabase anon key from Supabase dashboard.

⚠️ Generate new random secrets for `SESSION_SECRET` and `JWT_SECRET` - don't use the examples above.

⚠️ The database password (`Aleqo.4080`) is in the connection string - keep this secure!

---

## Copy-Paste Format (One per line):

```
SUPABASE_DB_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SESSION_SECRET
JWT_SECRET
JWT_EXPIRES_IN
NODE_ENV
```

