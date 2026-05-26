import { View, Text, StyleSheet } from 'react-native'
import { useOfflineStore } from '@store/useOfflineStore'
import { Colors, Typography, Spacing } from '@constants/index'

export function OfflineBanner() {
  const isOnline = useOfflineStore((s) => s.isOnline)
  if (isOnline) return null
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Modo offline — alterações serão sincronizadas quando a conexão voltar</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(224,80,80,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.error,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  text: {
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: Typography.medium,
  },
})
