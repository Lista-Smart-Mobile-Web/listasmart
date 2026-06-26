import { useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuthStore } from '@store/useAuthStore'
import { useRanking } from '@hooks/useContributions'
import { Badge, ScreenHeader, EmptyState, LoadingScreen } from '@components/ui'
import { NotificationsModal } from '@components/NotificationsModal'
import { useNotificationStore } from '@store/useNotificationStore'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { RankingEntry } from '@/types'

const MEDAL_COLOR: Record<number, string> = { 1: '#FACC15', 2: '#94A3B8', 3: '#D97706' }

const LEVEL_BADGE: Record<string, Parameters<typeof Badge>[0]['color']> = {
  iniciante: 'muted',
  colaborador: 'green',
  verificado: 'amber',
  especialista: 'amber',
  embaixador: 'amber',
}

export default function RankingScreen() {
  const currentUser = useAuthStore((s) => s.user)
  const { data, isLoading } = useRanking()
  const ranking = data?.leaderboard || []
  const myEntry = data?.me || null

  const [notifVisible, setNotifVisible] = useState(false)
  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Ranking"
        showNotifications
        hasUnread={hasUnread}
        onNotificationPress={() => setNotifVisible(true)}
        rightElement={
          <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/perfil')}>
            <Text style={styles.avatarText}>{currentUser?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        }
      />

      {/* Posição do usuário atual (Bento Box highlight) */}
      {myEntry && (
        <View style={styles.myCard}>
          <View style={styles.myLeft}>
            {MEDAL_COLOR[myEntry.position] ? (
              <Ionicons name="medal" size={32} color={MEDAL_COLOR[myEntry.position]} />
            ) : (
              <Text style={styles.myRank}>#{myEntry.position}</Text>
            )}
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.myName} numberOfLines={1} adjustsFontSizeToFit>Sua Posição</Text>
              <Badge label={myEntry.level} color={LEVEL_BADGE[myEntry.level] ?? 'muted'} />
            </View>
          </View>
          <View style={styles.myRight}>
            <Text style={styles.myPoints}>{myEntry.points}</Text>
            <Text style={styles.myPtsLabel}>pts</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <LoadingScreen message="Atualizando ranking..." />
      ) : ranking.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title="Ranking vazio"
          description="Seja o primeiro a contribuir com preços esta semana e assuma o topo!"
        />
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: RankingEntry, index: number }) => {
            const isMe = item.userId === currentUser?.id
            return (
              <View>
                <View style={[styles.row, isMe && styles.rowMe]}>
                  <View style={styles.posWrap}>
                    {MEDAL_COLOR[item.position] ? (
                      <View style={styles.medalWrap}>
                        <Ionicons name="medal" size={22} color={MEDAL_COLOR[item.position]} />
                      </View>
                    ) : (
                      <Text style={styles.rankNum}>#{item.position}</Text>
                    )}
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowName, isMe && styles.rowNameMe]}>
                      {item.name}{isMe ? ' (você)' : ''}
                    </Text>
                    <Badge
                      label={item.level}
                      color={LEVEL_BADGE[item.level] ?? 'muted'}
                    />
                  </View>
                  <Text style={[styles.rowPoints, isMe && styles.rowPointsMe]}>
                    {item.points} pts
                  </Text>
                </View>
              </View>
            )
          }}
        />
      )}
      <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primaryLight },

  myCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, marginTop: Spacing.md,
    backgroundColor: 'rgba(196,122,42,0.1)', borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: 24, padding: Spacing.xl,
    shadowColor: Colors.primaryLight, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  myLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  myRank: { fontSize: 28, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  myName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text, marginBottom: 2 },
  myLevel: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  myRight: { alignItems: 'flex-end' },
  myPoints: { fontSize: 28, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  myPtsLabel: { fontSize: Typography.xs, color: Colors.textSecondary },

  rankNum: { width: 32, fontSize: 16, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  medalWrap: { width: 32, alignItems: 'center', justifyContent: 'center' },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: 140 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  rowMe: { 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl, 
    borderBottomColor: 'rgba(196,122,42,0.1)',
  },
  posWrap: { width: 36, alignItems: 'center' },
  rowInfo: { flex: 1, gap: 4, alignItems: 'flex-start' },
  rowName: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.text },
  rowNameMe: { fontWeight: Typography.bold, color: Colors.primaryLight },
  rowPoints: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  rowPointsMe: { color: Colors.primaryLight },
})
