import { create } from 'zustand'
import NetInfo from '@react-native-community/netinfo'
import { processSyncQueue } from '@services/sync'


interface OfflineState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
  startWatcher: () => () => void
  syncNow: () => Promise<void>
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,

  startWatcher() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false
      const wasOffline = !get().isOnline
      set({ isOnline: online })
      if (online && wasOffline) {
        get().syncNow()
      }
    })
    return unsubscribe
  },

  async syncNow() {
    if (get().isSyncing || !get().isOnline) return
    set({ isSyncing: true })
    try {
      await processSyncQueue()
      set({ lastSyncAt: new Date().toISOString() })
    } finally {
      set({ isSyncing: false })
    }
  },
}))
