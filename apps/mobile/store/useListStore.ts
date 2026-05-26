// Store offline-first para listas de compras
// Fonte de verdade local: SQLite. API é usada para sincronização.
import { create } from 'zustand'
import { getLists, upsertList, upsertItem, toggleItem as dbToggle, deleteItem, enqueueOfflineOp, markListDeleted } from '@services/db'
import type { ShoppingListLocal, ListItemLocal } from '@/types'

interface ListState {
  lists: ShoppingListLocal[]
  hydrated: boolean

  hydrate: () => void
  createList: (name: string, online?: boolean) => ShoppingListLocal
  deleteList: (listId: string, online?: boolean) => void
  addItem: (listId: string, item: Omit<ListItemLocal, 'listId'>, online?: boolean) => void
  toggleItem: (listId: string, itemId: string) => void
  removeItem: (listId: string, itemId: string) => void
  updateFromServer: (lists: ShoppingListLocal[]) => void
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  hydrated: false,

  hydrate() {
    const lists = getLists()
    set({ lists, hydrated: true })
  },

  createList(name, online = false) {
    const newList: ShoppingListLocal = {
      id: `local_${Date.now()}`,
      name,
      isActive: true,
      createdAt: new Date().toISOString(),
      items: [],
      _pendingSync: !online,
    }
    upsertList(newList, !online)
    if (!online) {
      enqueueOfflineOp({
        id: `op_${Date.now()}`,
        type: 'CREATE_LIST',
        payload: { id: newList.id, name },
        createdAt: newList.createdAt,
      })
    }
    set((s) => ({ lists: [newList, ...s.lists] }))
    return newList
  },

  deleteList(listId, online = false) {
    if (!online) {
      markListDeleted(listId)
      enqueueOfflineOp({
        id: `op_${Date.now()}`,
        type: 'DELETE_LIST',
        payload: { id: listId },
        createdAt: new Date().toISOString(),
      })
    }
    set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) }))
  },

  addItem(listId, item, online = false) {
    const newItem: ListItemLocal = { ...item, listId, _pendingSync: !online }
    upsertItem(newItem, !online)
    if (!online) {
      enqueueOfflineOp({
        id: `op_${Date.now()}`,
        type: 'ADD_ITEM',
        payload: { id: newItem.id, listId, productId: item.productId, quantity: item.quantity },
        createdAt: new Date().toISOString(),
      })
    }
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id !== listId ? l : { ...l, items: [...l.items, newItem] }
      ),
    }))
  },

  toggleItem(listId, itemId) {
    dbToggle(itemId)
    enqueueOfflineOp({
      id: `op_${Date.now()}`,
      type: 'TOGGLE_ITEM',
      payload: { listId, itemId },
      createdAt: new Date().toISOString(),
    })
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id !== listId
          ? l
          : {
              ...l,
              items: l.items.map((it) =>
                it.id !== itemId ? it : { ...it, isChecked: !it.isChecked }
              ),
            }
      ),
    }))
  },

  removeItem(listId, itemId) {
    deleteItem(itemId)
    set((s) => ({
      lists: s.lists.map((l) =>
        l.id !== listId ? l : { ...l, items: l.items.filter((it) => it.id !== itemId) }
      ),
    }))
  },

  updateFromServer(serverLists) {
    // Persiste os metadados das listas no SQLite
    serverLists.forEach((l) => upsertList(l))

    // Mescla com o estado local: preserva os items já carregados
    // (a API de lista retorna apenas metadados, não os itens)
    set((s) => ({
      lists: serverLists.map((serverList) => {
        const local = s.lists.find((l) => l.id === serverList.id)
        return local
          ? { ...serverList, items: local.items } // preserva itens locais
          : { ...serverList, items: [] }
      }),
    }))
  },
}))
