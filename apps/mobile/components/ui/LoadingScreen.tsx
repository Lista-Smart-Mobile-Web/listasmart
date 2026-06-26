import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { Colors, Typography, Spacing } from '@constants/index'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryLight} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    gap: Spacing.md,
  },
  text: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
})
