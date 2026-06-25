import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@store/useAuthStore'
import api from '@services/api'

interface PartnerMarketDetail {
  id: string
  name: string
  address: string
  city: string
  cnpj?: string | null
  created_at?: string
}

export default function PartnerPerfilScreen() {
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }))

  const {
    data: market,
    isLoading,
    isError,
    refetch,
  } = useQuery<PartnerMarketDetail>({
    queryKey: ['partner', 'market', user?.marketId],
    queryFn: () => api.get(`/markets/${user?.marketId}`).then((r) => r.data),
    enabled: Boolean(user?.marketId),
    staleTime: 1000 * 60 * 5,
  })

  function handleLogout() {
    logout()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil do Mercado</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Responsável</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email ?? '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Mercado</Text>

        {!user?.marketId && (
          <Text style={styles.muted}>Conta sem mercado vinculado.</Text>
        )}

        {user?.marketId && isLoading && (
          <View style={styles.inlineRow}>
            <ActivityIndicator size="small" color="#0369a1" />
            <Text style={styles.muted}>Carregando dados do mercado...</Text>
          </View>
        )}

        {user?.marketId && isError && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>Nao foi possivel carregar os dados do mercado.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.marketId && !isLoading && !isError && market && (
          <View style={styles.marketContent}>
            <Text style={styles.marketName}>{market.name}</Text>
            <Text style={styles.marketMeta}>{market.city}</Text>
            <Text style={styles.marketMeta}>{market.address || 'Endereco nao informado'}</Text>
            <Text style={styles.marketMeta}>CNPJ: {market.cnpj || 'Nao informado'}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0a0a0a', marginBottom: 24 },
  card: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  label: { fontSize: 12, color: '#0369a1', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#0a0a0a' },
  muted: { color: '#475569', fontSize: 14 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marketContent: { gap: 4 },
  marketName: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  marketMeta: { fontSize: 14, color: '#334155' },
  errorWrap: { gap: 8 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  retryBtn: {
    borderWidth: 1,
    borderColor: '#0369a1',
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryText: { color: '#0369a1', fontWeight: '700', fontSize: 12 },
  logoutBtn: {
    marginTop: 24,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
})
