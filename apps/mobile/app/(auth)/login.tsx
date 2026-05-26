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
import { Button, Input } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const { control, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const { data: res } = await api.post('/auth/login', data)
      setAuth(res.user, res.token)
      router.replace(res.user.role === 'partner' ? '/(partner)/dashboard' : '/(tabs)/listas')
    } catch (err: any) {
      setError('email', { message: err.response?.data?.error ?? 'Credenciais inválidas' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo / branding */}
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>L</Text>
            </View>
            <Text style={styles.appName}>Lista Smart</Text>
            <Text style={styles.tagline}>Economize nas suas compras</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Entrar</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
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
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              label="Entrar"
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.sm }}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/cadastro')}>
              <Text style={styles.footerLink}> Cadastre-se grátis</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.xxxl },

  brand: { alignItems: 'center', gap: Spacing.sm },
  logoMark: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 32, fontWeight: Typography.extrabold, color: '#1a0d00' },
  appName: { fontSize: Typography.xxl, fontWeight: Typography.extrabold, color: Colors.text },
  tagline: { fontSize: Typography.sm, color: Colors.textSecondary },

  form: { gap: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.sm },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.lg },
  footerText: { fontSize: Typography.sm, color: Colors.textSecondary },
  footerLink: { fontSize: Typography.sm, color: Colors.primaryLight, fontWeight: Typography.semibold },
})
