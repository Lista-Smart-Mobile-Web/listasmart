import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'

interface Badge { badge_type: string; earned_at: string }

const LEVEL_COLORS: Record<string, string> = {
  iniciante: '#94a3b8',
  colaborador: '#22c55e',
  verificado: '#3b82f6',
  especialista: '#a855f7',
  embaixador: '#f59e0b',
}

export default function PerfilScreen() {
  const { user, logout } = useAuthStore()

  const { data: badges = [] } = useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: () => api.get('/users/me/badges').then((r) => r.data),
    enabled: !!user,
  })

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: LEVEL_COLORS[user?.level ?? 'iniciante'] }]}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.points}>{user?.points ?? 0} pts</Text>
          <Text style={styles.level}>{user?.level}</Text>
        </View>
      </View>

      {badges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          {badges.map((b) => (
            <Text key={b.badge_type} style={styles.badge}>🏅 {b.badge_type}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 20 },
  card: { alignItems: 'center', paddingVertical: 32, borderRadius: 16, backgroundColor: '#f9f9f9', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: '#0a0a0a' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  pointsRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  points: { fontSize: 15, fontWeight: '700', color: '#f59e0b' },
  level: { fontSize: 15, color: '#666', textTransform: 'capitalize' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 10 },
  badge: { fontSize: 14, color: '#333', paddingVertical: 6 },
  logoutBtn: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 16, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
})
