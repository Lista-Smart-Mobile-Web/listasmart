import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@services/api'
import { useOfflineStore } from '@store/useOfflineStore'
import { enqueueOfflineOp } from '@services/db'
import type { Contribution, RankingEntry, AnalyticsOverview } from '@/types'

interface ContributionPayload {
  type: 'qr_code' | 'manual' | 'confirm'
  productId?: string
  marketId?: string
  price?: number
  qrData?: string
}

export function useSubmitContribution() {
  const queryClient = useQueryClient()
  const isOnline = useOfflineStore((s) => s.isOnline)

  return useMutation({
    mutationFn: async (payload: ContributionPayload) => {
      if (!isOnline) {
        enqueueOfflineOp({
          id: `op_${Date.now()}`,
          type: 'SUBMIT_CONTRIBUTION',
          payload: payload as unknown as Record<string, unknown>,
          createdAt: new Date().toISOString(),
        })
        return null
      }
      const { data } = await api.post<Contribution>('/contributions', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    },
  })
}

export function useContributionHistory() {
  return useQuery<Contribution[]>({
    queryKey: ['contributions'],
    queryFn: () => api.get('/contributions/history').then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function useRanking() {
  return useQuery<RankingEntry[]>({
    queryKey: ['ranking'],
    queryFn: () => api.get('/ranking').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAnalyticsPrices(productId: string | null, period = '30d') {
  return useQuery({
    queryKey: ['analytics', 'prices', productId, period],
    queryFn: () =>
      api.get('/analytics/prices', { params: { product_id: productId, period } }).then((r) => r.data),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 10,
  })
}
