import { View, Text, StyleSheet } from 'react-native'
import { Colors, Radius, Typography, Spacing } from '@constants/index'

type Color = 'amber' | 'green' | 'red' | 'muted'

interface BadgeProps {
  label: string
  color?: Color
}

export function Badge({ label, color = 'amber' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[color]]}>
      <Text style={[styles.text, styles[`text_${color}` as keyof typeof styles]]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  amber: { backgroundColor: Colors.primaryDim, borderColor: Colors.primaryBorder },
  green: { backgroundColor: Colors.successDim, borderColor: Colors.success },
  red: { backgroundColor: Colors.errorDim, borderColor: Colors.error },
  muted: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: Colors.border },

  text: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  text_amber: { color: Colors.primaryLight },
  text_green: { color: Colors.success },
  text_red: { color: Colors.error },
  text_muted: { color: Colors.textSecondary },
})
