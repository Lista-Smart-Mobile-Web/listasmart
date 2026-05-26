import { create } from 'zustand'
import NetInfo from '@react-native-community/netinfo'
import { processSyncQueue } from '@services/sync'

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true'

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
    // Em modo mock, sempre online — NetInfo não é necessário
    // pois o adapter intercepta antes de qualquer chamada de rede real
    if (USE_MOCKS) {
      set({ isOnline: true })
      return () => {}
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable)
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
