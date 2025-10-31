# Pemwa Payroll System - Complete Documentation

## System Overview
**Frontend-only Kenyan payroll system for Pemwa Agency**
- Single-tenant, multi-user (all users have admin privileges)
- Built on Next.js + Supabase (client-side only)
- Mobile-first responsive design with unique mobile/desktop layouts
- All statutory figures configurable via settings

## Authentication & Access
- **Provider**: Supabase Auth (email + password)
- **Users**: All authenticated users have same privileges (no role separation)
- **Session**: Client-side via supabase-js, persisted in localStorage
- **Pages**: Login (`/login`), Logout (button in navigation)

## Kenyan Payroll Components (2025)

### Mandatory Deductions/Contributions
1. **PAYE (Income Tax)**
   - Progressive tax bands with personal relief of KES 2,400/month
   - Configurable tax brackets in settings

2. **NSSF (National Social Security Fund)**
   - Two-tier system: Employee + Employer contributions
   - Up to KES 4,320 each (configurable rates)

3. **SHIF (Social Health Insurance Fund)**
   - Employee: 2.75% of gross monthly salary
   - Employer: 2.75% of gross monthly salary

4. **Affordable Housing Levy (AHL)**
   - Employee: 1.5% of gross salary
   - Employer: 1.5% of gross salary

5. **HELB (Higher Education Loans Board)**
   - Only if employee has student loan
   - Configurable per employee

### Optional Components
- **Basic Salary**: Agreed monthly wage
- **Allowances**: Housing, transport, meals, communication, etc.
- **Overtime/Bonuses**: Extra pay beyond basic salary
- **Voluntary Deductions**: Loans, union fees, insurance, etc.
- **Tax Reliefs**: Insurance, mortgage, pension contributions

### Employer Responsibilities
- Remit all statutory contributions monthly (by 9th of following month)
- Maintain accurate payroll records
- Generate annual P9 forms for each employee
- Pay WIBA (Work Injury Benefits) and other mandatory contributions

## Database Schema (Supabase)

### Tables
1. **employees**
   - id, org_id, created_by, created_at, updated_at
   - name, employee_id, kra_pin, position
   - basic_salary, allowances (JSON), sha, housing_levy_percent
   - helb_amount, voluntary_deductions (JSON)

2. **payroll_settings**
   - id, org_id, created_by, created_at, effective_from, effective_to, is_active
   - personal_relief, nssf_employee_rate, nssf_employer_rate
   - shif_employee_rate, shif_employer_rate
   - ahl_employee_rate, ahl_employer_rate
   - wiba_rate, paye_brackets (JSON array)

3. **payroll** (monthly records)
   - id, org_id, employee_id, month, created_by, created_at
   - gross_salary, basic_salary, allowances_total, overtime, bonuses
   - nssf_employee, nssf_employer
   - shif_employee, shif_employer
   - ahl_employee, ahl_employer
   - helb, voluntary_deductions_total
   - paye_before_relief, personal_relief, paye_after_relief
   - total_deductions, net_salary
   - wiba, total_employer_cost

4. **p9** (annual summaries)
   - id, org_id, employee_id, year, created_by, created_at
   - gross_salary_total, basic_salary_total, allowances_total
   - nssf_employee_total, nssf_employer_total
   - shif_employee_total, shif_employer_total
   - ahl_employee_total, ahl_employer_total
   - helb_total, voluntary_deductions_total
   - paye_total, net_salary_total, total_employer_cost

## Application Pages & Flows

### 1. Login (`/login`)
- Email + Password authentication
- Redirect to Dashboard on success
- Password reset option

### 2. Dashboard (`/`)
- **KPIs**: Total net pay, employer costs, statutory contributions
- **Charts**: Monthly trends, contribution breakdowns
- **Quick Actions**: Run payroll, Add employee, Settings
- **Recent Activity**: Latest payroll runs

### 3. Settings (`/settings`)
- **PAYE Brackets**: Editable progressive tax bands
- **NSSF Rates**: Employee/Employer contribution rates
- **SHIF Rates**: 2.75% default, configurable
- **AHL Rates**: 1.5% default, configurable
- **Personal Relief**: KES 2,400 default
- **WIBA Rate**: Configurable employer contribution
- **Version Control**: Save new active settings

### 4. Employee Management (`/employees`)
- **List View**: Search, filter, add new employee
- **Employee Form**: Personal info, salary, allowances, deductions
- **Mobile**: Card layout, Desktop: Table layout

### 5. Payroll Processing (`/payroll`)
- **Month Selection**: Choose payroll month
- **Employee Selection**: Single or batch processing
- **Input**: Bonuses, overtime per employee
- **Calculation**: Real-time preview of all deductions
- **Review**: Summary table before saving
- **Save**: Store monthly payroll records

### 6. Payslips (`/payslips`)
- **Search**: By employee and month
- **View**: Detailed breakdown (employee + employer sections)
- **Export**: PDF generation (client-side)
- **Mobile**: Optimized payslip layout

### 7. P9 Forms (`/p9`)
- **Selection**: Employee + Year
- **Aggregation**: Sum monthly data for annual totals
- **Export**: PDF/Excel for KRA submission
- **Validation**: Ensure completeness

## Calculation Logic

### Gross Salary Calculation
```
gross_salary = basic_salary + allowances_total + overtime + bonuses
```

### Statutory Deductions
```
nssf_employee = min(gross_salary * nssf_rate, 4320)
nssf_employer = min(gross_salary * nssf_rate, 4320)
shif_employee = gross_salary * 0.0275
shif_employer = gross_salary * 0.0275
ahl_employee = gross_salary * 0.015
ahl_employer = gross_salary * 0.015
```

### Taxable Income & PAYE
```
taxable_income = gross_salary - nssf_employee - shif_employee
paye_before_relief = apply_progressive_brackets(taxable_income)
paye_after_relief = max(paye_before_relief - personal_relief, 0)
```

### Net Salary & Employer Cost
```
total_deductions = nssf_employee + shif_employee + ahl_employee + 
                   helb + voluntary_deductions + paye_after_relief
net_salary = gross_salary - total_deductions
total_employer_cost = gross_salary + nssf_employer + shif_employer + 
                       ahl_employer + wiba
```

## Mobile vs Desktop Design

### Mobile-First Approach
- **Navigation**: Top hamburger menu with slide-out drawer
- **Forms**: Single-column, larger touch targets
- **Tables**: Card-based layouts with key-value pairs
- **Actions**: Bottom sheet for critical actions (Run Payroll)
- **Payslips**: Optimized single-column layout

### Desktop Enhancements
- **Navigation**: Left sidebar with expanded menu
- **Forms**: Two-column layouts, side panels
- **Tables**: Full data tables with sorting/filtering
- **Dashboard**: Multi-column grid with charts
- **Payslips**: Two-column layout (employee + employer sections)

## Implementation Milestones

1. **Database Setup**: Supabase tables + RLS policies
2. **Authentication**: Login/logout flow
3. **Settings Management**: Configurable rates and brackets
4. **Employee CRUD**: Complete employee management
5. **Payroll Calculations**: All 2025 statutory components
6. **Payslip Generation**: View and PDF export
7. **P9 Forms**: Annual aggregation and export
8. **Dashboard**: Analytics and reporting
9. **Mobile Optimization**: Responsive design refinement
10. **Testing**: Component and integration tests

## Technical Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Database**: Supabase (client-side only)
- **UI Components**: shadcn/ui, Radix primitives
- **Forms**: react-hook-form + zod validation
- **State**: React Query for caching
- **Exports**: jsPDF, SheetJS for client-side generation
- **Deployment**: Vercel

## Security & Compliance
- **Authentication**: Supabase Auth with RLS
- **Data Protection**: Client-side encryption for sensitive data
- **Audit Trail**: All changes logged with user and timestamp
- **KRA Compliance**: Accurate P9 generation for tax reporting
- **Statutory Compliance**: All mandatory deductions included

This system will handle the complete Kenyan payroll process for 2025, ensuring compliance with all statutory requirements while providing a modern, mobile-first user experience.
