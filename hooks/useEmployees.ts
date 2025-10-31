import { useQuery } from '@tanstack/react-query'
import { fetchEmployees } from '@/lib/api'
import type { Employee } from '@/lib/supabase'

export function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 60_000,
  })
}






