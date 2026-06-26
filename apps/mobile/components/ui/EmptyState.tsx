import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Spacing } from '@constants/index'

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name']
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={52} color={Colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  iconWrap: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionWrap: {
    marginTop: Spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
})
