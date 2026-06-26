import React from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  FlatList, Pressable, Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import { useNotificationStore, type NotificationItem } from '@store/useNotificationStore'

interface NotificationsModalProps {
  visible: boolean
  onClose: () => void
}

function getIconProps(type: NotificationItem['type']) {
  switch (type) {
    case 'price_update':
      return { name: 'trending-down-outline' as const, color: Colors.success, bg: 'rgba(61,170,42,0.1)' }
    case 'badge_earned':
      return { name: 'ribbon-outline' as const, color: '#E8A050', bg: 'rgba(232,160,80,0.1)' }
    case 'promotion':
      return { name: 'flash-outline' as const, color: '#C47A2A', bg: 'rgba(196,122,42,0.1)' }
    default:
      return { name: 'notifications-outline' as const, color: Colors.textSecondary, bg: 'rgba(255,255,255,0.03)' }
  }
}

function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date()
    const past = new Date(isoString)
    const diffMs = now.getTime() - past.getTime()
    
    if (diffMs < 0) return 'Agora mesmo'
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 60) {
      return diffMins <= 1 ? 'Agora mesmo' : `${diffMins} min atrás`
    }
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
      return `${diffHours}h atrás`
    }
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    
    return past.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  } catch {
    return ''
  }
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore()
  
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const hasNotifications = notifications.length > 0

  const handleItemPress = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id)
    }
  }

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const iconProps = getIconProps(item.type)
    
    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={[
          styles.itemCard,
          !item.isRead && styles.itemUnread
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconProps.bg }]}>
          <Ionicons name={iconProps.name} size={22} color={iconProps.color} />
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.itemBody}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, !item.isRead && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemTime}>
              {formatRelativeTime(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.itemMessage} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </Pressable>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <LinearGradient
          colors={['#1c1714', '#0c0a08']}
          style={styles.sheetContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.dragIndicatorWrap}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Notificações</Text>
              {unreadCount > 0 && (
                <Text style={styles.headerSubtitle}>
                  Você tem {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {hasNotifications && (
            <View style={styles.actionsRow}>
              {unreadCount > 0 ? (
                <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn} activeOpacity={0.7}>
                  <Ionicons name="checkmark-done-outline" size={16} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              <TouchableOpacity onPress={clearAll} style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="trash-bin-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {hasNotifications ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyRings}>
                <View style={styles.emptyRingInner}>
                  <Ionicons name="notifications-outline" size={36} color={Colors.primary} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptySubtitle}>
                Avisaremos sobre economia de listas, novas conquistas e promoções importantes.
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: Dimensions.get('window').height * 0.8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dragIndicator: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.primaryLight,
    fontWeight: '500',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  actionBtnText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 76,
  },
  itemCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'flex-start',
  },
  itemUnread: {
    backgroundColor: 'rgba(196,122,42,0.04)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#1c1714',
  },
  itemBody: {
    flex: 1,
    paddingTop: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleUnread: {
    fontWeight: '600',
    color: Colors.text,
  },
  itemTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  itemMessage: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  emptyRings: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(196,122,42,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyRingInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(196,122,42,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,122,42,0.15)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
})
