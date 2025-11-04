import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats, DashboardStats } from '@/lib/api'

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  })
}
