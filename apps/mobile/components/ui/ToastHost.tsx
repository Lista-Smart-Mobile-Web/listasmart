import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Radius, Spacing, Typography } from '@constants/index'
import { useToastStore } from '@services/toast'

export function ToastHost() {
  const insets = useSafeAreaInsets()
  const { visible, message, kind } = useToastStore((s) => ({
    visible: s.visible,
    message: s.message,
    kind: s.kind,
  }))

  if (!visible || !message) return null

  return (
    <View pointerEvents="none" style={[styles.container, { top: insets.top + 8 }]}>
      <View
        style={[
          styles.toast,
          kind === 'error' && styles.toastError,
          kind === 'success' && styles.toastSuccess,
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: Spacing.xl,
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  toastError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorDim,
  },
  toastSuccess: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryDim,
  },
  message: {
    color: Colors.text,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    textAlign: 'center',
  },
})
