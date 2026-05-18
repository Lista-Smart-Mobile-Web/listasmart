import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'

interface RankUser { id: string; name: string; points: number; level: string; rank: number }

const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  colaborador: 'Colaborador',
  verificado: 'Verificado',
  especialista: 'Especialista',
  embaixador: 'Embaixador',
}

export default function RankingScreen() {
  const currentUser = useAuthStore((s) => s.user)
  const { data: ranking = [], isLoading } = useQuery<RankUser[]>({
    queryKey: ['ranking'],
    queryFn: () => api.get('/ranking').then((r) => r.data),
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking</Text>

      {isLoading ? (
        <Text style={styles.empty}>Carregando…</Text>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.row, item.id === currentUser?.id && styles.rowMe]}>
              <Text style={styles.rank}>#{item.rank}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}{item.id === currentUser?.id ? ' (você)' : ''}</Text>
                <Text style={styles.level}>{LEVEL_LABELS[item.level] ?? item.level}</Text>
              </View>
              <Text style={styles.points}>{item.points} pts</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#0a0a0a', paddingHorizontal: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  rowMe: { backgroundColor: '#fffbeb' },
  rank: { width: 36, fontSize: 14, fontWeight: '700', color: '#f59e0b' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  level: { fontSize: 12, color: '#999', marginTop: 2 },
  points: { fontSize: 14, fontWeight: '700', color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60 },
})
