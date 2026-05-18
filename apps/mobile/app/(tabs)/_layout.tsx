import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; label: string; icon: IoniconName; iconFocused: IoniconName }[] = [
  { name: 'listas',   label: 'Listas',    icon: 'list-outline',         iconFocused: 'list' },
  { name: 'scanner',  label: 'Scanner',   icon: 'qr-code-outline',      iconFocused: 'qr-code' },
  { name: 'comparar', label: 'Comparar',  icon: 'bar-chart-outline',    iconFocused: 'bar-chart' },
  { name: 'ranking',  label: 'Ranking',   icon: 'trophy-outline',       iconFocused: 'trophy' },
  { name: 'perfil',   label: 'Perfil',    icon: 'person-outline',       iconFocused: 'person' },
]

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#f59e0b', headerShown: false }}>
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
