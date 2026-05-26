import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@store/useAuthStore'
import { useRanking } from '@hooks/useContributions'
import { Badge } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { RankingEntry } from '@/types'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const LEVEL_BADGE: Record<string, Parameters<typeof Badge>[0]['color']> = {
  iniciante: 'muted',
  colaborador: 'green',
  verificado: 'amber',
  especialista: 'amber',
  embaixador: 'amber',
}

export default function RankingScreen() {
  const currentUser = useAuthStore((s) => s.user)
  const { data: ranking = [], isLoading } = useRanking()

  const myEntry = ranking.find((r) => r.userId === currentUser?.id)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>Colaboradores da semana</Text>
      </View>

      {/* Posição do usuário atual */}
      {myEntry && (
        <View style={styles.myCard}>
          <View style={styles.myLeft}>
            <Text style={styles.myRank}>#{myEntry.position}</Text>
            <View>
              <Text style={styles.myName}>Você</Text>
              <Text style={styles.myLevel}>{myEntry.level}</Text>
            </View>
          </View>
          <View style={styles.myRight}>
            <Text style={styles.myPoints}>{myEntry.points}</Text>
            <Text style={styles.myPtsLabel}>pts</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primaryLight} />
        </View>
      ) : ranking.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Ranking vazio</Text>
          {/* TODO: ranking carregado de GET /ranking quando backend disponível */}
          <Text style={styles.emptyText}>Seja o primeiro a contribuir com preços esta semana!</Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: RankingEntry }) => {
            const isMe = item.userId === currentUser?.id
            return (
              <View style={[styles.row, isMe && styles.rowMe]}>
                <View style={styles.posWrap}>
                  {MEDAL[item.position] ? (
                    <Text style={styles.medal}>{MEDAL[item.position]}</Text>
                  ) : (
                    <Text style={[styles.pos, isMe && styles.posMe]}>#{item.position}</Text>
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
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },

  myCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: Radius.lg, padding: Spacing.lg,
  },
  myLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  myRank: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  myName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  myLevel: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  myRight: { alignItems: 'flex-end' },
  myPoints: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  myPtsLabel: { fontSize: Typography.xs, color: Colors.textSecondary },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xxl },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowMe: { backgroundColor: Colors.primaryDim, marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl, borderBottomColor: Colors.primaryBorder },
  posWrap: { width: 36, alignItems: 'center' },
  medal: { fontSize: 22 },
  pos: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  posMe: { color: Colors.primaryLight },
  rowInfo: { flex: 1, gap: 3 },
  rowName: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.text },
  rowNameMe: { fontWeight: Typography.bold },
  rowPoints: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  rowPointsMe: { color: Colors.primaryLight },
})
