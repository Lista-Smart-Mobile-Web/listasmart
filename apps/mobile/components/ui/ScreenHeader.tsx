import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandLogo } from '@components/BrandLogo'
import { Colors, Typography, Spacing } from '@constants/index'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  showNotifications?: boolean
  hasUnread?: boolean
  onNotificationPress?: () => void
  rightElement?: React.ReactNode
}

export function ScreenHeader({
  title,
  subtitle,
  showNotifications = false,
  hasUnread = false,
  onNotificationPress,
  rightElement
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <BrandLogo size={28} />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {rightElement}
        {showNotifications && (
          <TouchableOpacity style={styles.btn} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
            {hasUnread && <View style={styles.notifDot} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  titleWrap: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
})
