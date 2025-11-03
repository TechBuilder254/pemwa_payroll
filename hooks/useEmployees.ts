import { useQuery } from '@tanstack/react-query'
import { fetchEmployees } from '@/lib/api'
import type { Employee } from '@/lib/supabase'

export function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  })
}






