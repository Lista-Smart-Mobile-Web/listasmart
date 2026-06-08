import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useOfflineStore } from '@store/useOfflineStore'
import { useListStore } from '@store/useListStore'
import { initDB } from '@services/db'
import { seedMockDB } from '@services/mock'
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@services/notifications'
import { Colors } from '@constants/index'

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
    mutations: { retry: 1 },
  },
})

function AppBootstrap() {
  const { startWatcher } = useOfflineStore()
  const hydrate = useListStore((s) => s.hydrate)

  useEffect(() => {
    initDB()
    if (USE_MOCKS) seedMockDB()
    hydrate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubscribe = startWatcher()
    return unsubscribe
  }, [startWatcher])

  useEffect(() => {
    registerForPushNotifications()
    const sub1 = addNotificationReceivedListener(() => {})
    const sub2 = addNotificationResponseListener(() => {})
    return () => { sub1.remove(); sub2.remove() }
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <AppBootstrap />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
