import { useQuery } from '@tanstack/react-query'

async function fetchNextEmployeeId(): Promise<string> {
  // Primary: dedicated endpoint (server computes next id)
  try {
    const res = await fetch('/api/employees/next-id', { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (json?.data?.nextId) return json.data.nextId as string
    }
  } catch {}

  // Fallback: derive from current employees client-side
  const listRes = await fetch('/api/employees', { cache: 'no-store' })
  if (!listRes.ok) throw new Error('Failed to list employees')
  const listJson = await listRes.json()
  const ids: string[] = (listJson?.data ?? []).map((e: any) => e.employee_id).filter(Boolean)
  const maxNum = ids.reduce((max: number, id: string) => {
    const n = parseInt(String(id).slice(3), 10)
    return isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const next = maxNum + 1
  return `EMP${String(next).padStart(3, '0')}`
}

export function useNextEmployeeId() {
  return useQuery<string, Error>({
    queryKey: ['employees', 'next-id'],
    queryFn: fetchNextEmployeeId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })
}


