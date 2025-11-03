import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats, DashboardStats } from '@/lib/api'

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 60_000, // 1 minute
  })
}
