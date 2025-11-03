import { useQuery } from '@tanstack/react-query'
import { fetchP9Form, P9FormData } from '@/lib/api'

export function useP9Form(employeeId?: string, year?: number) {
  return useQuery<P9FormData, Error>({
    queryKey: ['p9', employeeId, year],
    queryFn: () => fetchP9Form(employeeId!, year!),
    enabled: !!employeeId && !!year,
    staleTime: 30_000, // 30 seconds
  })
}

