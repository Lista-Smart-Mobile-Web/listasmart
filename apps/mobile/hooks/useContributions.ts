import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@services/api'
import { useOfflineStore } from '@store/useOfflineStore'
import { useAuthStore } from '@store/useAuthStore'
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
  const updateUser = useAuthStore((s) => s.updateUser)

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
    onSuccess: async () => {
      if (isOnline) {
        try {
          const { data } = await api.get<{ id: string; name: string; email: string; points: number; level: string }>('/users/me')
          updateUser({
            id: data.id,
            name: data.name,
            email: data.email,
            points: data.points,
            level: data.level,
          })
        } catch {
          // Best-effort sync; keep UX responsive even if /users/me fails.
        }
      }

      queryClient.invalidateQueries({ queryKey: ['contributions'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
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
  return useQuery<{ leaderboard: RankingEntry[], me: RankingEntry | null }>({
    queryKey: ['ranking'],
    queryFn: () => api.get('/ranking').then((r) => {
      const data = r.data
      const mapEntry = (entry: any): RankingEntry => ({
        userId: entry.id,
        position: entry.rank,
        name: entry.name,
        level: entry.level,
        points: entry.points_this_week || 0,
      })
      return {
        leaderboard: (data.leaderboard || []).map(mapEntry),
        me: data.me ? mapEntry(data.me) : null,
      }
    }),
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
