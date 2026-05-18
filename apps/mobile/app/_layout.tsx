import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore'

const queryClient = new QueryClient()

export default function RootLayout() {
  const { token, user } = useAuthStore((s) => ({ token: s.token, user: s.user }))

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login')
    } else if (user?.role === 'partner') {
      router.replace('/(partner)/dashboard')
    } else {
      router.replace('/(tabs)/listas')
    }
  }, [token, user?.role])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
