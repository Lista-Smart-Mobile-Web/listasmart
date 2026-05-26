import { View, type ViewProps, StyleSheet } from 'react-native'
import { Colors, Radius, Spacing } from '@constants/index'

type Variant = 'default' | 'elevated' | 'amber'

interface CardProps extends ViewProps {
  variant?: Variant
  padding?: number
}

export function Card({ variant = 'default', padding = Spacing.lg, style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], { padding }, style]} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  default: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderMed,
  },
  amber: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primaryBorder,
  },
})
