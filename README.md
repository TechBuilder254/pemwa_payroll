# Pemwa Payroll System

Property management and payroll system for Pemwa Agency.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

The database is configured to use Supabase. Ensure your `.env.local` file contains:
- `SUPABASE_DB_URL` - PostgreSQL connection string
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### 3. Run Development Server

```bash
npm run dev
```

The `.env.local` file should already exist with the database URL.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:setup` - Create database and tables
- `npm run db:connect` - Test database connection
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Documentation

- [PAYROLL_SYSTEM_DOCUMENTATION.md](./PAYROLL_SYSTEM_DOCUMENTATION.md) - System documentation

## Tech Stack

- **Frontend**: React, Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL
- **UI**: Radix UI, shadcn/ui, Framer Motion
- **Database**: PostgreSQL with pg_trgm extension

## License

Private - Pemwa Agency
