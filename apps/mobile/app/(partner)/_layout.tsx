import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@store/useAuthStore'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; label: string; icon: IoniconName; iconFocused: IoniconName }[] = [
  { name: 'dashboard',  label: 'Dashboard',  icon: 'grid-outline',          iconFocused: 'grid' },
  { name: 'precos',     label: 'Preços',     icon: 'pricetag-outline',      iconFocused: 'pricetag' },
  { name: 'promocoes',  label: 'Promoções',  icon: 'megaphone-outline',     iconFocused: 'megaphone' },
  { name: 'relatorios', label: 'Relatórios', icon: 'document-text-outline', iconFocused: 'document-text' },
  { name: 'perfil',     label: 'Perfil',     icon: 'storefront-outline',    iconFocused: 'storefront' },
]

export default function PartnerLayout() {
  const { token } = useAuthStore()

  if (!token) return <Redirect href="/(auth)/login" />
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0ea5e9', headerShown: false }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
