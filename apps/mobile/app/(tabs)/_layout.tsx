import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CustomTabBar from '@components/CustomTabBar'
import { useAuthStore } from '@store/useAuthStore'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function icon(outline: IoniconName, filled: IoniconName) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  )
}

export default function TabsLayout() {
  const { token } = useAuthStore()

  if (!token) return <Redirect href="/(auth)/login" />
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="listas"
        options={{ title: 'Listas', tabBarIcon: icon('list-outline', 'list') }}
      />
      <Tabs.Screen
        name="comparar"
        options={{ title: 'Comparar', tabBarIcon: icon('bar-chart-outline', 'bar-chart') }}
      />
      {/* Centro — FAB */}
      <Tabs.Screen
        name="scanner"
        options={{ title: 'Scanner', tabBarIcon: icon('qr-code-outline', 'qr-code') }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Ranking', tabBarIcon: icon('trophy-outline', 'trophy') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: icon('person-outline', 'person') }}
      />
      {/* Dashboard acessível via link interno — sem aba */}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
    </Tabs>
  )
}
