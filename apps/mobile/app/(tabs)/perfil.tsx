import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import api from '@services/api'
import { useAuthStore } from '@store/useAuthStore'
import { Badge, Card } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

// Pontos para subir de nível — definido em docs/context.md
const LEVEL_THRESHOLDS = [
  { level: 'iniciante', min: 0, max: 49 },
  { level: 'colaborador', min: 50, max: 199 },
  { level: 'verificado', min: 200, max: 499 },
  { level: 'especialista', min: 500, max: 999 },
  { level: 'embaixador', min: 1000, max: Infinity },
]

function getLevelProgress(points: number, level: string) {
  const current = LEVEL_THRESHOLDS.find((l) => l.level === level)
  if (!current || current.max === Infinity) return 1
  const range = current.max - current.min
  const progress = (points - current.min) / range
  return Math.min(Math.max(progress, 0), 1)
}

function getNextLevel(level: string): string | null {
  const idx = LEVEL_THRESHOLDS.findIndex((l) => l.level === level)
  return LEVEL_THRESHOLDS[idx + 1]?.level ?? null
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const BADGE_ICONS: Record<string, IoniconName> = {
  primeira_lista: 'clipboard-outline',
  colaborador_iniciante: 'handshake-outline',
  verificador: 'checkmark-circle-outline',
  sequencia_7dias: 'flame-outline',
  embaixador: 'trophy-outline',
}

export default function PerfilScreen() {
  const { user, logout } = useAuthStore()

  // TODO: endpoint /users/me/badges ainda não implementado no backend
  // Dependência: GET /users/me/badges (packages/api)
  const { data: badges = [] } = useQuery<{ badge_type: string; earned_at: string }[]>({
    queryKey: ['badges'],
    queryFn: () => api.get('/users/me/badges').then((r) => r.data),
    enabled: !!user,
    retry: false,
  })

  const pts = user?.points ?? 0
  const level = user?.level ?? 'iniciante'
  const progress = getLevelProgress(pts, level)
  const nextLevel = getNextLevel(level)
  const current = LEVEL_THRESHOLDS.find((l) => l.level === level)
  const ptsToNext = current && current.max !== Infinity ? current.max - pts + 1 : null

  function confirmLogout() {
    Alert.alert('Sair', 'Tem certeza que quer sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + nome */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {user?.name}
          </Text>
          <Text style={styles.email} numberOfLines={1} adjustsFontSizeToFit>
            {user?.email}
          </Text>
          <Badge label={level} color="amber" />
        </View>

        {/* Card de pontos + progresso */}
        <Card variant="amber" style={styles.ptsCard}>
          <View style={styles.ptsRow}>
            <View>
              <Text style={styles.ptsValue}>{pts}</Text>
              <Text style={styles.ptsLabel}>pontos totais</Text>
            </View>
            {nextLevel && ptsToNext !== null && (
              <View style={styles.ptsNext}>
                <Text style={styles.ptsNextLabel}>Faltam</Text>
                <Text style={styles.ptsNextValue}>{ptsToNext} pts</Text>
                <Text style={styles.ptsNextLevel}>para {nextLevel}</Text>
              </View>
            )}
            {!nextLevel && (
              <View style={styles.ptsNext}>
                <Ionicons name="trophy-outline" size={16} color={Colors.amber} />
                <Text style={styles.ptsNextLevel}>Nível máximo!</Text>
              </View>
            )}
          </View>
          {/* Barra de progresso de nível */}
          <View style={styles.levelBar}>
            <View style={[styles.levelFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.levelLabels}>
            <Text style={styles.levelLabelText}>{level}</Text>
            {nextLevel && <Text style={styles.levelLabelText}>{nextLevel}</Text>}
          </View>
        </Card>

        {/* Conquistas */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            <View style={styles.badgesGrid}>
              {badges.map((b) => (
                <Card key={b.badge_type} variant="default" style={styles.badgeCard}>
                  <Ionicons name={BADGE_ICONS[b.badge_type] ?? 'medal-outline'} size={24} color={Colors.amber} />
                  <Text style={styles.badgeContent} numberOfLines={2} adjustsFontSizeToFit>{b.badge_type.replace(/_/g, ' ')}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <Card variant="default" padding={0}>
            {[
              { icon: 'person-outline', label: 'Editar perfil', onPress: () => {} },
              { icon: 'notifications-outline', label: 'Notificações', onPress: () => {} },
              { icon: 'shield-checkmark-outline', label: 'Privacidade', onPress: () => {} },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < arr.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 100, gap: Spacing.xl },

  avatarSection: { alignItems: 'center', paddingTop: Spacing.xl, gap: Spacing.sm },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryDim, borderWidth: 2, borderColor: Colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  name: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  email: { fontSize: Typography.sm, color: Colors.textSecondary },

  ptsCard: { marginHorizontal: Spacing.xl, gap: Spacing.md },
  ptsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ptsValue: { fontSize: Typography.xxxl, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  ptsLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  ptsNext: { alignItems: 'flex-end', gap: 2 },
  ptsNextLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  ptsNextValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  ptsNextLevel: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },

  levelBar: { height: 6, backgroundColor: Colors.bg, borderRadius: Radius.full, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  levelLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  levelLabelText: { fontSize: 10, color: Colors.textMuted, textTransform: 'capitalize' },

  section: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { 
    alignItems: 'center', gap: Spacing.xs, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', width: 104 
  },
  badgeContent: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', textTransform: 'capitalize' },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { flex: 1, fontSize: Typography.base, color: Colors.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.error,
    backgroundColor: Colors.errorDim,
  },
  logoutText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.error },
})
