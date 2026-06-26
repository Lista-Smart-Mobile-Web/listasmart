// Store offline-first para listas de compras
// Fonte de verdade local: SQLite. API é usada para sincronização.
import { create } from 'zustand'
import { getLists, getItemsByList, upsertList, upsertItem, toggleItem as dbToggle, deleteItem, enqueueOfflineOp, markListDeleted } from '@services/db'
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
  updateListItemsFromServer: (listId: string, items: any[]) => void
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

    set((s) => ({
      lists: serverLists.map((serverList) => {
        const local = s.lists.find((l) => l.id === serverList.id)
        const localItems = local ? local.items : getItemsByList(serverList.id)
        
        // Merge items individually to keep rich local details while updating check states
        const mergedItems = serverList.items.map((serverItem) => {
          const localItem = localItems.find((it) => it.id === serverItem.id)
          if (localItem) {
            return {
              ...localItem,
              isChecked: serverItem.isChecked,
            }
          }
          return serverItem
        })

        // Preserve pending sync items
        const pendingItems = localItems.filter((it) => it._pendingSync)
        pendingItems.forEach((pi) => {
          if (!mergedItems.find((m) => m.id === pi.id)) {
            mergedItems.push(pi)
          }
        })

        return { ...serverList, items: mergedItems }
      }),
    }))
  },

  updateListItemsFromServer(listId, serverItems) {
    // 1. Mapeia os do servidor pro formato local
    const mappedServer = serverItems.map(si => ({
      id: si.id,
      listId,
      productId: si.productId,
      name: si.name,
      category: si.category || '',
      unit: si.unit || 'un',
      quantity: Number(si.quantity) || 1,
      isChecked: Boolean(si.isChecked),
      avgPrice: si.avgPrice ? Number(si.avgPrice) : undefined,
      cheapestMarket: si.cheapestMarket || undefined,
    }))

    // 2. Get local items from SQLite for this list
    const localItems = getItemsByList(listId)

    // 3. For each server item, upsert it to SQLite
    mappedServer.forEach(item => {
      upsertItem(item as ListItemLocal, false)
    })

    // 4. For any item in SQLite that is not in mappedServer and is not pending sync, delete it
    localItems.forEach(localItem => {
      const existsOnServer = mappedServer.some(si => si.id === localItem.id)
      if (!existsOnServer && !localItem._pendingSync) {
        deleteItem(localItem.id)
      }
    })

    // 5. Update Zustand store in memory
    set((s) => ({
      lists: s.lists.map((l) => {
        if (l.id !== listId) return l
        
        // Mantém os que tem _pendingSync
        const pendingItems = l.items.filter(it => it._pendingSync)

        // Junta (substitui os velhos pelo server, mais os pendentes novos)
        const merged: ListItemLocal[] = [...mappedServer] as ListItemLocal[]
        pendingItems.forEach(pi => {
          if (!merged.find(m => m.id === pi.id)) {
            merged.push(pi)
          }
        })

        return { ...l, items: merged }
      }),
    }))
  },
}))
