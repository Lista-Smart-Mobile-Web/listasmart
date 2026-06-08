import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@store/useAuthStore'
import { Colors } from '@constants/index'

export default function Index() {
  const { token, user, _hasHydrated } = useAuthStore((s) => ({
    token: s.token,
    user: s.user,
    _hasHydrated: s._hasHydrated,
  }))

  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  if (!token) return <Redirect href="/(auth)/login" />
  if (user?.role === 'partner') return <Redirect href="/(partner)/dashboard" />
  return <Redirect href="/(tabs)/listas" />
}
