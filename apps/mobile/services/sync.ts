// Sincronização offline-first
// Lógica: quando conexão volta, processa a fila offline do SQLite e envia para a API
// Conflitos resolvidos por timestamp (mais recente vence) — definido em docs/context.md

import api from './api'
import {
  getOfflineQueue,
  removeOfflineOp,
  incrementRetry,
  markListSynced,
  markItemSynced,
  hardDeleteList,
} from './db'
import { notifyOfflineSynced } from './notifications'

const MAX_RETRIES = 3

export async function processSyncQueue(): Promise<void> {
  const queue = getOfflineQueue()
  if (queue.length === 0) return

  let syncedCount = 0

  for (const op of queue) {
    if (op.retries >= MAX_RETRIES) {
      removeOfflineOp(op.id)
      continue
    }

    try {
      await dispatchOp(op.type, op.payload)
      removeOfflineOp(op.id)
      syncedCount++
    } catch {
      incrementRetry(op.id)
    }
  }

  if (syncedCount > 0) {
    await notifyOfflineSynced(syncedCount)
  }
}

async function dispatchOp(type: string, payload: Record<string, unknown>): Promise<void> {
  switch (type) {
    case 'CREATE_LIST':
      await api.post('/lists', { name: payload.name })
      markListSynced(payload.id as string)
      break

    case 'DELETE_LIST':
      await api.delete(`/lists/${payload.id}`)
      hardDeleteList(payload.id as string)
      break

    case 'ADD_ITEM':
      await api.post(`/lists/${payload.listId}/items`, {
        productId: payload.productId,
        quantity: payload.quantity,
      })
      markItemSynced(payload.id as string)
      break

    case 'REMOVE_ITEM':
      await api.delete(`/lists/${payload.listId}/items/${payload.itemId}`)
      break

    case 'TOGGLE_ITEM':
      await api.patch(`/lists/${payload.listId}/items/${payload.itemId}`, {
        is_checked: payload.isChecked,
      })
      markItemSynced(payload.itemId as string)
      break

    case 'SUBMIT_CONTRIBUTION':
      await api.post('/contributions', payload)
      break

    default:
      break
  }
}
