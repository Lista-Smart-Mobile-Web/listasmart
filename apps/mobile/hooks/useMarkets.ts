import { useQuery } from '@tanstack/react-query'
import api from '@services/api'
import type { Market } from '@/types'

export function useMarkets(city?: string) {
  return useQuery<Market[]>({
    queryKey: ['markets', city],
    queryFn: () =>
      api.get('/markets', { params: city ? { city } : undefined }).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  })
}
