import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '@store/useAuthStore'
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
  const { token, user, _hasHydrated } = useAuthStore((s) => ({
    token: s.token,
    user: s.user,
    _hasHydrated: s._hasHydrated,
  }))
  const { startWatcher } = useOfflineStore()
  const hydrate = useListStore((s) => s.hydrate)

  // Inicializa SQLite, semeia dados mock (se ativo) e hidrata o store — nessa ordem
  useEffect(() => {
    initDB()
    if (USE_MOCKS) seedMockDB()
    hydrate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Monitor de conectividade
  useEffect(() => {
    const unsubscribe = startWatcher()
    return unsubscribe
  }, [startWatcher])

  // Notificações push
  useEffect(() => {
    registerForPushNotifications()
    const sub1 = addNotificationReceivedListener(() => {})
    const sub2 = addNotificationResponseListener(() => {})
    return () => { sub1.remove(); sub2.remove() }
  }, [])

  // Aguarda AsyncStorage hidratar antes de navegar.
  // Sem esse guard, o efeito dispara com token=null e manda ao login
  // mesmo quando o usuário já estava autenticado.
  useEffect(() => {
    if (!_hasHydrated) return
    if (!token) {
      router.replace('/(auth)/login')
    } else if (user?.role === 'partner') {
      router.replace('/(partner)/dashboard')
    } else {
      router.replace('/(tabs)/listas')
    }
  }, [_hasHydrated, token, user?.role])

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
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
