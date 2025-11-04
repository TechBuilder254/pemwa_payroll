import { useQuery } from '@tanstack/react-query'
import { fetchEmployees } from '@/lib/api'
import type { Employee } from '@/lib/supabase'

export function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 0, // Always consider data stale to allow immediate refetching
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
    refetchOnReconnect: true, // Refetch when reconnecting to network
  })
}






