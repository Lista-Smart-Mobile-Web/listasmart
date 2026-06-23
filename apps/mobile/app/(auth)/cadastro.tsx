import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@services/api'
import { useAuthStore } from '@store/useAuthStore'
import { Button, Input, Card } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['consumer', 'partner']),
})
type FormData = z.infer<typeof schema>

export default function CadastroScreen() {
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const { control, handleSubmit, watch, setValue, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'consumer' },
  })

  const selectedRole = watch('role')

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const { data: res } = await api.post('/auth/register', data)
      setAuth(res.user, res.token)
      router.replace(res.user.role === 'partner' ? '/(partner)/dashboard' : '/(tabs)/listas')
    } catch (err: any) {
      setError('email', { message: err.response?.data?.error ?? 'Falha ao cadastrar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece a economizar hoje</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome completo"
                  placeholder="Maria Silva"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            {/* Seleção de tipo de conta */}
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Tipo de conta</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, selectedRole === 'consumer' && styles.roleBtnActive]}
                  onPress={() => setValue('role', 'consumer')}
                >
                  <Text style={styles.roleEmoji}>🛒</Text>
                  <Text style={[styles.roleBtnText, selectedRole === 'consumer' && styles.roleBtnTextActive]}>
                    Consumidor
                  </Text>
                  <Text style={styles.roleDesc}>Listas e comparação</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, selectedRole === 'partner' && styles.roleBtnActive]}
                  onPress={() => setValue('role', 'partner')}
                >
                  <Text style={styles.roleEmoji}>🏪</Text>
                  <Text style={[styles.roleBtnText, selectedRole === 'partner' && styles.roleBtnTextActive]}>
                    Supermercado
                  </Text>
                  <Text style={styles.roleDesc}>Dashboard + promoções</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label="Criar conta"
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.sm }}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}> Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.xxl, paddingVertical: Spacing.xxl },

  header: { gap: Spacing.xs },
  title: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.text },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary },

  form: { gap: Spacing.md },

  roleSection: { gap: Spacing.sm },
  roleLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  roleRow: { flexDirection: 'row', gap: Spacing.sm },
  roleBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center', gap: Spacing.xs,
  },
  roleBtnActive: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryDim },
  roleEmoji: { fontSize: 24 },
  roleBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary },
  roleBtnTextActive: { color: Colors.primaryLight },
  roleDesc: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center' },

  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: Typography.sm, color: Colors.textSecondary },
  footerLink: { fontSize: Typography.sm, color: Colors.primaryLight, fontWeight: Typography.semibold },
})
