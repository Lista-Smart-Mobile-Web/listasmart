import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'

type Role = 'consumer' | 'partner'

export default function CadastroScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('consumer')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  async function handleRegister() {
    if (!name || !email || !password) return Alert.alert('Preencha todos os campos')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      setAuth(data.user, data.token)
      if (data.user.role === 'partner') {
        router.replace('/(partner)/dashboard')
      } else {
        router.replace('/(tabs)/listas')
      }
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.error ?? 'Falha ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Comece a economizar hoje</Text>

      <TextInput style={styles.input} placeholder="Nome completo" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.roleLabel}>Tipo de conta</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'consumer' && styles.roleBtnActive]}
          onPress={() => setRole('consumer')}
        >
          <Text style={[styles.roleBtnText, role === 'consumer' && styles.roleBtnTextActive]}>Consumidor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'partner' && styles.roleBtnActive]}
          onPress={() => setRole('partner')}
        >
          <Text style={[styles.roleBtnText, role === 'partner' && styles.roleBtnTextActive]}>Supermercado</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Cadastrando…' : 'Criar conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Já tem conta? Entre</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '800', color: '#0a0a0a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  roleLabel: { fontSize: 14, color: '#444', marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e5e5', alignItems: 'center' },
  roleBtnActive: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  roleBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
  roleBtnTextActive: { color: '#d97706' },
  btn: { backgroundColor: '#f59e0b', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#f59e0b', marginTop: 20, fontSize: 14 },
})
