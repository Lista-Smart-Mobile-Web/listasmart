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
import { Ionicons } from '@expo/vector-icons'
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
    <View style={styles.container}>
      <View style={styles.glowBg} />
      
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            
            {/* Header / Logo */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Ionicons name="cart" size={28} color={Colors.primaryLight} />
                <Text style={styles.logoText}>Lista Smart</Text>
              </View>
              
              <Text style={styles.title}>Olá!</Text>
              <Text style={styles.subtitle}>Por favor, insira seus dados para continuar.</Text>
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color="#FFF" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Endereço de e-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    style={styles.inputGlass}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      placeholder="Senha"
                      secureTextEntry
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      style={styles.inputGlass}
                    />
                  </View>
                )}
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <Button
                label="Entrar"
                loading={loading}
                fullWidth
                size="lg"
                style={styles.primaryBtn}
                onPress={handleSubmit(onSubmit)}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/cadastro')}>
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <View style={styles.termsRow}>
              <Text style={styles.termsText}>Termos de Serviço | Política de Privacidade</Text>
            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(196,122,42,0.12)',
  },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl },

  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 40 },
  logoText: { fontSize: 22, fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },

  socialRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  socialText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.text },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontSize: Typography.xs, color: Colors.textSecondary },

  form: { gap: Spacing.md, marginBottom: Spacing.xl },
  inputGlass: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    color: Colors.text,
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.text },

  primaryBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xxl },
  footerText: { fontSize: Typography.sm, color: Colors.textSecondary },
  footerLink: { fontSize: Typography.sm, color: Colors.text, fontWeight: Typography.bold },

  termsRow: { alignItems: 'center', marginTop: 'auto' },
  termsText: { fontSize: 10, color: Colors.textMuted, textDecorationLine: 'underline' },
})
