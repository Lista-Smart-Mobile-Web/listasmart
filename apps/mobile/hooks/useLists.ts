import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@services/api'
import { useListStore } from '@store/useListStore'
import { useOfflineStore } from '@store/useOfflineStore'
import type { ShoppingListLocal } from '@/types'

// Busca listas do servidor e sincroniza com o store local
export function useLists() {
  const isOnline = useOfflineStore((s) => s.isOnline)
  const { lists, hydrated, updateFromServer } = useListStore()

  const query = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; name: string; is_active: boolean; created_at: string }[]>('/lists')
      const mapped: ShoppingListLocal[] = data.map((l) => ({
        id: l.id,
        name: l.name,
        isActive: l.is_active,
        createdAt: l.created_at,
        items: [],
      }))
      updateFromServer(mapped)
      return mapped
    },
    enabled: isOnline,
    staleTime: 1000 * 60 * 2, // 2 min
  })

  return {
    lists: hydrated ? lists : query.data ?? [],
    isLoading: !hydrated && query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

// Busca detalhe de uma lista com seus itens + preços
export function useListDetail(listId: string) {
  const isOnline = useOfflineStore((s) => s.isOnline)
  const localList = useListStore((s) => s.lists.find((l) => l.id === listId))

  const query = useQuery({
    queryKey: ['list', listId],
    queryFn: () => api.get(`/lists/${listId}/items`).then((r) => r.data),
    enabled: isOnline && Boolean(listId),
    staleTime: 1000 * 60,
  })

  return {
    list: localList,
    serverItems: query.data,
    isLoading: query.isLoading,
  }
}

// Criar lista com fallback offline
export function useCreateList() {
  const queryClient = useQueryClient()
  const isOnline = useOfflineStore((s) => s.isOnline)
  const createList = useListStore((s) => s.createList)

  return useMutation({
    mutationFn: async (name: string) => {
      if (!isOnline) {
        return createList(name, false)
      }
      const { data } = await api.post('/lists', { name })
      createList(name, true)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()
  const isOnline = useOfflineStore((s) => s.isOnline)
  const deleteList = useListStore((s) => s.deleteList)

  return useMutation({
    mutationFn: async (listId: string) => {
      if (isOnline) await api.delete(`/lists/${listId}`)
      deleteList(listId, isOnline)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  })
}
