import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LogBox } from 'react-native'
import { useOfflineStore } from '@store/useOfflineStore'
import { useListStore } from '@store/useListStore'
import { initDB } from '@services/db'
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@services/notifications'
import { ToastHost } from '@components/ui'
import { Colors } from '@constants/index'

// Intercepta e silencia os warnings no terminal do Metro Bundler
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes("Deep imports from the 'react-native' package are deprecated")) return;
    if (args[0].includes("expo-notifications: Android Push notifications")) return;
    if (args[0].includes("\`expo-notifications\` functionality is not fully supported in Expo Go")) return;
  }
  originalWarn(...args);
};

// Oculta as caixas amarelas na tela do aplicativo
LogBox.ignoreLogs([
  "Deep imports from the 'react-native' package are deprecated",
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported in Expo Go",
])


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
          <ToastHost />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
