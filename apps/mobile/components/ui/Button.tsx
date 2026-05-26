import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type TouchableOpacityProps } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, Radius, Typography, Spacing } from '@constants/index'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends TouchableOpacityProps {
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  onPress,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  function handlePress(e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? Colors.bg : Colors.primaryLight} />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}` as keyof typeof styles]]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },

  // Variants
  primary: { backgroundColor: Colors.primaryLight },
  secondary: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: { backgroundColor: Colors.errorDim, borderWidth: 1, borderColor: Colors.error },

  // Sizes
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minHeight: 34 },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 44 },
  lg: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, minHeight: 52 },

  // Labels
  label: { fontWeight: Typography.bold, fontSize: Typography.base },
  label_primary: { color: '#1a0d00' },
  label_secondary: { color: Colors.primaryLight },
  label_ghost: { color: Colors.textSecondary },
  label_danger: { color: Colors.error },
})
