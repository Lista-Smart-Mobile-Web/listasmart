import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore'

const queryClient = new QueryClient()

export default function RootLayout() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) router.replace('/(auth)/login')
  }, [token])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
