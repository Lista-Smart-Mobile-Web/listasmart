import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@constants/index'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]

          // Ignore hidden route rendered outside the custom bar
          if (route.name === 'dashboard') {
            return null
          }

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

          const Icon = options.tabBarIcon

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isScanner && styles.scannerWrapper,
                  focused && { backgroundColor: isScanner ? Colors.primaryLight : 'rgba(255,255,255,0.1)' }
                ]}
              >
                {isScanner ? (
                  <Ionicons
                    name={(focused ? 'qr-code' : 'qr-code-outline') as IoniconName}
                    size={24}
                    color={focused ? '#1a0d00' : Colors.primaryLight}
                  />
                ) : (
                  Icon && (
                    <Icon
                      focused={focused}
                      color={focused ? Colors.text : Colors.textSecondary}
                      size={24}
                    />
                  )
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none', // Permite clique através de partes transparentes
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1308', // Escuro quente
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 40,
    height: 72,
    width: width * 0.85,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerWrapper: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
})
