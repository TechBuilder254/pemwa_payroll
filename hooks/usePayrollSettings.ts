import { useQuery } from '@tanstack/react-query'
import { fetchPayrollSettings } from '@/lib/api'
import type { PayrollSettings } from '@/lib/supabase'

export function usePayrollSettings() {
  return useQuery<PayrollSettings, Error>({
    queryKey: ['payroll-settings'],
    queryFn: fetchPayrollSettings,
    staleTime: 60_000,
  })
}






