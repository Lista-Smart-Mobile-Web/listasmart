import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@services/api'
import type { Product, PriceComparison } from '@/types'

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { q: query } })
      return data
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: ['products', 'barcode', barcode],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products', { params: { barcode } })
      return data[0] ?? null
    },
    enabled: Boolean(barcode),
    staleTime: 1000 * 60 * 10,
  })
}

export function useProductDetail(productId: string | null) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => api.get(`/products/${productId}`).then((r) => r.data),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePriceComparison(listId: string | null, lat?: number, lng?: number) {
  return useQuery<PriceComparison[]>({
    queryKey: ['prices', 'compare', listId, lat, lng],
    queryFn: () =>
      api
        .get('/prices/compare', { params: { list_id: listId, lat, lng, radius: 15 } })
        .then((r) => r.data),
    enabled: Boolean(listId),
    staleTime: 1000 * 60 * 3,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; category: string; unit: string; barcode?: string | null }) => {
      const res = await api.post('/products', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
