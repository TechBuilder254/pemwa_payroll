import { useQuery } from '@tanstack/react-query'
import { fetchRemittances, RemittanceData } from '@/lib/api'

export function useRemittances(month: string) {
  return useQuery<RemittanceData, Error>({
    queryKey: ['remittances', month],
    queryFn: () => fetchRemittances(month),
    enabled: !!month,
    staleTime: 30_000, // 30 seconds
  })
}

