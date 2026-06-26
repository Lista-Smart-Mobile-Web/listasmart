import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface NotificationItem {
  id: string
  title: string
  body: string
  timestamp: string // ISO string
  isRead: boolean
  type: 'price_update' | 'badge_earned' | 'promotion' | 'general'
}

interface NotificationState {
  notifications: NotificationItem[]
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  addNotification: (title: string, body: string, type: NotificationItem['type']) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      addNotification: (title, body, type) =>
        set((s) => ({
          notifications: [
            {
              id: Math.random().toString(36).substring(7),
              title,
              body,
              timestamp: new Date().toISOString(),
              isRead: false,
              type,
            },
            ...s.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      clearAll: () =>
        set({ notifications: [] }),
    }),
    {
      name: 'listasmart-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // Add versioning to clear old cached state (which contained emojis)
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Reset old state to empty array
          return { notifications: [], _hasHydrated: false };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
