import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import api from '@services/api'
import { useAuthStore } from '@store/useAuthStore'
import { Card, Badge } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

const LEVEL_THRESHOLDS = [
  { level: 'iniciante', min: 0, max: 49 },
  { level: 'colaborador', min: 50, max: 199 },
  { level: 'verificado', min: 200, max: 499 },
  { level: 'especialista', min: 500, max: 999 },
  { level: 'embaixador', min: 1000, max: Infinity },
]

function getLevelProgress(pts: number, level: string) {
  const current = LEVEL_THRESHOLDS.find((l) => l.level === level)
  const next = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(current!) + 1]
  if (!current || !next) return 1 // max level
  const range = next.min - current.min
  const earned = pts - current.min
  return Math.min(Math.max(earned / range, 0), 1)
}

function getNextLevel(level: string) {
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
      {/* Global Style Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.logoBox}>
            <Text style={styles.logoL}>L</Text>
          </View>
          <Text style={styles.appName}>Perfil</Text>
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/(tabs)/listas')}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

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

        {/* Card de pontos + progresso (Bento Style) */}
        <View>
          <View style={[styles.ptsCard]}>
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
                  <Ionicons name="trophy-outline" size={16} color={Colors.primaryLight} />
                  <Text style={styles.ptsNextLevel}>Nível máximo!</Text>
                </View>
              )}
            </View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.levelLabels}>
              <Text style={styles.levelLabelText}>{level}</Text>
              {nextLevel && <Text style={styles.levelLabelText}>{nextLevel}</Text>}
            </View>
          </View>
        </View>

        {/* Conquistas */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            <View style={styles.badgesGrid}>
              {badges.map((b) => (
                <View key={b.badge_type} style={styles.badgeCard}>
                  <Ionicons name={BADGE_ICONS[b.badge_type] ?? 'medal-outline'} size={24} color={Colors.primaryLight} />
                  <Text style={styles.badgeContent} numberOfLines={2} adjustsFontSizeToFit>{b.badge_type.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrap}><Ionicons name="person-outline" size={20} color={Colors.text} /></View>
              <Text style={styles.menuText}>Dados da conta</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrap}><Ionicons name="notifications-outline" size={20} color={Colors.text} /></View>
              <Text style={styles.menuText}>Notificações</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 140, gap: Spacing.xl },

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md 
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center'
  },
  logoL: { fontSize: 16, fontWeight: '900', color: '#1a0d00' },
  appName: { fontSize: 20, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },

  avatarSection: { alignItems: 'center', paddingTop: Spacing.md, gap: Spacing.sm },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryDim, borderWidth: 3, borderColor: Colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryLight, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  avatarText: { fontSize: 40, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  name: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.text },
  email: { fontSize: Typography.sm, color: Colors.textSecondary },

  ptsCard: { 
    marginHorizontal: Spacing.xl, gap: Spacing.lg,
    backgroundColor: 'rgba(196,122,42,0.1)', borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: 24, padding: Spacing.xl,
  },
  ptsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ptsValue: { fontSize: 36, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  ptsLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  ptsNext: { alignItems: 'flex-end', gap: 2 },
  ptsNextLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  ptsNextValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  ptsNextLevel: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },

  levelBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.full, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  levelLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  levelLabelText: { fontSize: 10, color: Colors.textMuted, textTransform: 'capitalize', fontWeight: 'bold' },

  section: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: { 
    alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', backgroundColor: Colors.surface,
    width: 104, height: 84, borderRadius: 20
  },
  badgeContent: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', textTransform: 'capitalize', fontWeight: 'bold' },

  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)'
  },
  menuIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.text },

  logoutBtn: {
    marginHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.errorDim, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.error,
  },
  logoutText: { color: Colors.error, fontSize: Typography.base, fontWeight: Typography.bold },
})
