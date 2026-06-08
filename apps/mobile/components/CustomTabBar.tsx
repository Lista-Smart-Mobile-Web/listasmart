import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@constants/index'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const focused = state.index === index
          const isScanner = route.name === 'scanner'

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          if (isScanner) {
            return (
              <View key={route.key} style={styles.fabWrap}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.fabTouch}>
                  <View style={[styles.fab, focused && styles.fabActive]}>
                    <View style={styles.fabRing}>
                      <Ionicons
                        name={(focused ? 'qr-code' : 'qr-code-outline') as IoniconName}
                        size={28}
                        color="#fff"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.fabLabel, { color: focused ? Colors.primary : Colors.textSecondary }]}>
                  Scanner
                </Text>
              </View>
            )
          }

          const Icon = options.tabBarIcon

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.65}
            >
              {Icon && (
                <Icon
                  focused={focused}
                  color={focused ? Colors.primary : Colors.textSecondary}
                  size={22}
                />
              )}
              <Text style={[styles.label, { color: focused ? Colors.primary : Colors.textSecondary }]}>
                {options.title ?? route.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0b08',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,122,42,0.2)',
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    height: 62,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // FAB (Scanner central)
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    overflow: 'visible',
  },
  fabTouch: {
    alignItems: 'center',
    marginTop: -26,    // pop acima da tab bar
    marginBottom: 4,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#0d0b08',
  },
  fabActive: {
    backgroundColor: Colors.primaryLight,
    shadowOpacity: 0.7,
  },
  fabRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
