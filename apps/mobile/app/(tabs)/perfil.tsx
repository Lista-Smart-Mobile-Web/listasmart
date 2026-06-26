import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Pressable, TextInput, ActivityIndicator, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'

import api from '@services/api'
import { registerForPushNotifications } from '@services/notifications'
import { DEFAULT_NOTIFICATION_PREFS, loadNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '@services/notificationPrefs'
import { useAuthStore } from '@store/useAuthStore'
import { Badge, Button } from '@components/ui'
import { BrandLogo } from '@components/BrandLogo'
import { NotificationsModal } from '@components/NotificationsModal'
import { EditProfileModal } from '@components/EditProfileModal'
import { useNotificationStore } from '@store/useNotificationStore'
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

function getBadgeIconName(badgeType: string): string {
  if (badgeType === 'primeira_lista') return 'clipboard-outline'
  if (badgeType === 'colaborador_iniciante') return 'people-outline'
  if (badgeType === 'verificador') return 'checkmark-circle-outline'
  if (badgeType === 'sequencia_7dias') return 'flame-outline'
  if (badgeType === 'embaixador') return 'trophy-outline'
  return 'medal-outline'
}

interface ContributionHistoryItem {
  id: string
  type: 'qr_code' | 'manual' | 'confirm'
  price: number
  status: 'pending' | 'approved' | 'rejected'
  points: number | null
  created_at: string
  product_name: string
  market_name: string
  city: string
}

function contributionTypeLabel(type: ContributionHistoryItem['type']) {
  if (type === 'qr_code') return 'Cupom QR'
  if (type === 'confirm') return 'Confirmação'
  return 'Manual'
}

function contributionStatusLabel(status: ContributionHistoryItem['status']) {
  if (status === 'approved') return 'Aprovado'
  if (status === 'rejected') return 'Rejeitado'
  return 'Em análise'
}

function contributionStatusColor(status: ContributionHistoryItem['status']) {
  if (status === 'approved') return Colors.success
  if (status === 'rejected') return Colors.error
  return Colors.primaryLight
}

export default function PerfilScreen() {
  const { user, logout, updateUser } = useAuthStore()
  const [editOpen, setEditOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS)
  const [notifVisible, setNotifVisible] = useState(false)
  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnread = notifications.some((n) => !n.isRead)

  const { data: badges = [] } = useQuery<{ badge_type: string; earned_at: string }[]>({
    queryKey: ['badges'],
    queryFn: () => api.get('/users/me/badges').then((r) => r.data),
    enabled: !!user,
    retry: false,
  })

  const { data: history = [], isLoading: historyLoading } = useQuery<ContributionHistoryItem[]>({
    queryKey: ['contributions', 'history', 'perfil'],
    queryFn: () => api.get('/contributions/history', { params: { limit: 6 } }).then((r) => r.data),
    enabled: !!user,
    staleTime: 1000 * 60,
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

  async function openNotifications() {
    setNotifOpen(true)
    setNotifLoading(true)
    try {
      setNotifPrefs(await loadNotificationPrefs())
    } catch {
      setNotifPrefs(DEFAULT_NOTIFICATION_PREFS)
      Alert.alert('Aviso', 'Não foi possível carregar suas preferências. Usando o padrão.')
    } finally {
      setNotifLoading(false)
    }
  }

  async function handleToggleEnabled(next: boolean) {
    setNotifPrefs((prev) => ({ ...prev, enabled: next }))

    if (!next) return

    const token = await registerForPushNotifications()
    if (!token) {
      Alert.alert(
        'Permissão não concedida',
        'Ative a permissão de notificações nas configurações do sistema para receber alertas.'
      )
    }
  }

  async function handleSaveNotificationPrefs() {
    setNotifSaving(true)
    try {
      await saveNotificationPrefs(notifPrefs)
      setNotifOpen(false)
      Alert.alert('Preferências salvas', 'Suas configurações de notificação foram atualizadas.')
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar as preferências agora.')
    } finally {
      setNotifSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Global Style Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setNotifVisible(true)}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
          {/* Notification dot */}
          {hasUnread && <View style={styles.notifDot} />}
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <BrandLogo size={28} />
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
                  <Ionicons name={getBadgeIconName(b.badge_type) as any} size={24} color={Colors.primaryLight} />
                  <Text style={styles.badgeContent} numberOfLines={2} adjustsFontSizeToFit>{b.badge_type.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de contribuições</Text>
          <View style={styles.historyCard}>
            {historyLoading ? (
              <View style={styles.historyLoading}>
                <ActivityIndicator color={Colors.primaryLight} />
                <Text style={styles.historyHint}>Carregando histórico...</Text>
              </View>
            ) : history.length === 0 ? (
              <Text style={styles.historyHint}>Você ainda não enviou contribuições.</Text>
            ) : (
              history.map((entry, idx) => (
                <View key={entry.id} style={[styles.historyRow, idx > 0 && styles.historyRowBorder]}>
                  <View style={styles.historyMain}>
                    <Text style={styles.historyProduct} numberOfLines={1}>{entry.product_name}</Text>
                    <Text style={styles.historyMeta} numberOfLines={1}>
                      {entry.market_name} · {entry.city}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {new Date(entry.created_at).toLocaleDateString('pt-BR')} · {contributionTypeLabel(entry.type)}
                    </Text>
                  </View>

                  <View style={styles.historyAside}>
                    <Text style={styles.historyPrice}>R$ {Number(entry.price).toFixed(2).replace('.', ',')}</Text>
                    <Text style={[styles.historyStatus, { color: contributionStatusColor(entry.status) }]}>
                      {contributionStatusLabel(entry.status)}
                    </Text>
                    <Text style={styles.historyPoints}>
                      {entry.points && entry.points > 0 ? `+${entry.points} pts` : '0 pts'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setEditOpen(true)}>
              <View style={styles.menuIconWrap}><Ionicons name="person-outline" size={20} color={Colors.text} /></View>
              <Text style={styles.menuText}>Dados da conta</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={openNotifications}
            >
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

      <EditProfileModal visible={editOpen} onClose={() => setEditOpen(false)} />

      <Modal visible={notifOpen} transparent animationType="slide" onRequestClose={() => setNotifOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setNotifOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Configurações de Notificações</Text>

            {notifLoading ? (
              <View style={styles.historyLoading}>
                <ActivityIndicator color={Colors.primaryLight} />
                <Text style={styles.historyHint}>Carregando preferências...</Text>
              </View>
            ) : (
              <>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleMain}>
                    <Text style={styles.toggleTitle}>Receber notificações</Text>
                    <Text style={styles.toggleDesc}>Permite que o Lista Smart envie alertas para o seu dispositivo. Desative para silenciar completamente o app.</Text>
                  </View>
                  <Switch
                    value={notifPrefs.enabled}
                    onValueChange={handleToggleEnabled}
                    trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                    thumbColor={notifPrefs.enabled ? Colors.primaryLight : Colors.textMuted}
                  />
                </View>

                <View style={[styles.toggleRow, !notifPrefs.enabled && styles.toggleDisabled]}>
                  <View style={styles.toggleMain}>
                    <Text style={styles.toggleTitle}>Contribuição aprovada</Text>
                    <Text style={styles.toggleDesc}>Seja avisado e comemore imediatamente sempre que você ganhar pontos no ranking por validar preços.</Text>
                  </View>
                  <Switch
                    value={notifPrefs.contributionApproved}
                    onValueChange={(v) => setNotifPrefs((p) => ({ ...p, contributionApproved: v }))}
                    disabled={!notifPrefs.enabled}
                    trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                    thumbColor={notifPrefs.contributionApproved && notifPrefs.enabled ? Colors.primaryLight : Colors.textMuted}
                  />
                </View>

                <View style={[styles.toggleRow, !notifPrefs.enabled && styles.toggleDisabled]}>
                  <View style={styles.toggleMain}>
                    <Text style={styles.toggleTitle}>Queda de preço</Text>
                    <Text style={styles.toggleDesc}>Saiba na hora quando os itens salvos nas suas listas ficarem mais baratos em supermercados próximos a você.</Text>
                  </View>
                  <Switch
                    value={notifPrefs.priceDrop}
                    onValueChange={(v) => setNotifPrefs((p) => ({ ...p, priceDrop: v }))}
                    disabled={!notifPrefs.enabled}
                    trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                    thumbColor={notifPrefs.priceDrop && notifPrefs.enabled ? Colors.primaryLight : Colors.textMuted}
                  />
                </View>

                <View style={[styles.toggleRow, !notifPrefs.enabled && styles.toggleDisabled]}>
                  <View style={styles.toggleMain}>
                    <Text style={styles.toggleTitle}>Sincronização offline</Text>
                    <Text style={styles.toggleDesc}>Receba um aviso discreto assim que suas operações feitas sem internet forem sincronizadas com segurança.</Text>
                  </View>
                  <Switch
                    value={notifPrefs.offlineSync}
                    onValueChange={(v) => setNotifPrefs((p) => ({ ...p, offlineSync: v }))}
                    disabled={!notifPrefs.enabled}
                    trackColor={{ false: Colors.border, true: Colors.primaryBorder }}
                    thumbColor={notifPrefs.offlineSync && notifPrefs.enabled ? Colors.primaryLight : Colors.textMuted}
                  />
                </View>

                <Button
                  label={notifSaving ? 'Salvando...' : 'Salvar preferências'}
                  fullWidth
                  size="lg"
                  loading={notifSaving}
                  onPress={handleSaveNotificationPrefs}
                  style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
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
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 10,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primaryLight,
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

  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  historyLoading: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historyHint: {
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    fontSize: Typography.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  historyRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  historyMain: { flex: 1, gap: 2 },
  historyProduct: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  historyMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  historyAside: {
    alignItems: 'flex-end',
    minWidth: 95,
  },
  historyPrice: {
    color: Colors.text,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  historyStatus: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    marginTop: 2,
  },
  historyPoints: {
    color: Colors.primaryLight,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    marginTop: 1,
  },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: 8,
    maxHeight: '88%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  toggleDisabled: {
    opacity: 0.55,
  },
  toggleMain: { flex: 1, gap: 2 },
  toggleTitle: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  toggleDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },

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
