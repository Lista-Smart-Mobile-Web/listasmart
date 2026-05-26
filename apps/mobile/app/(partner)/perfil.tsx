import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@store/useAuthStore'

export default function PartnerPerfilScreen() {
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }))

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
