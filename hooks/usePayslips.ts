import { useQuery } from '@tanstack/react-query'
import { fetchPayslips, Payslip } from '@/lib/api'

export function usePayslips(employeeId?: string, month?: string) {
  return useQuery<Payslip[], Error>({
    queryKey: ['payslips', employeeId, month],
    queryFn: () => fetchPayslips(employeeId, month),
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    // Always fetch, even if month is not provided (to show all payslips)
    enabled: true,
  })
}

