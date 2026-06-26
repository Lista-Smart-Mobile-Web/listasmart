import React, { useState, useEffect } from 'react'
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Pressable, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import { useMutation } from '@tanstack/react-query'
import api from '@services/api'
import { useAuthStore } from '@store/useAuthStore'
import { Button } from '@components/ui'

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuthStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null)

  useEffect(() => {
    if (visible) {
      setName(user?.name ?? '')
      setEmail(user?.email ?? '')
      setPassword('')
      setShowPassword(false)
      setFocusedField(null)
    }
  }, [visible, user])

  const updateProfile = useMutation({
    mutationFn: async (payload: { name: string; email: string; password?: string }) => {
      const { data } = await api.patch('/users/me', payload)
      return data as { name?: string; email?: string }
    },
    onSuccess: (data) => {
      updateUser({
        name: data.name ?? name.trim(),
        email: data.email ?? email.trim(),
      })
      Alert.alert('Sucesso', 'Seus dados foram atualizados e salvos com segurança.')
      onClose()
    },
    onError: (err: any) => {
      Alert.alert(
        'Erro ao salvar',
        err?.response?.data?.error ?? 'Não foi possível atualizar seus dados agora.'
      )
    },
  })

  function handleSubmit() {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (cleanName.length < 2) {
      Alert.alert('Aviso', 'Por favor, informe um nome com ao menos 2 caracteres.')
      return
    }

    const emailOk = /^\\S+@\\S+\\.\\S+$/.test(cleanEmail)
    if (!emailOk) {
      Alert.alert('Aviso', 'Por favor, informe um e-mail válido para continuar.')
      return
    }

    const payload: { name: string; email: string; password?: string } = { name: cleanName, email: cleanEmail }
    if (cleanPassword) {
      if (cleanPassword.length < 8) {
        Alert.alert('Senha muito curta', 'Sua nova senha deve ter ao menos 8 caracteres para ser segura.')
        return
      }
      payload.password = cleanPassword
    }

    updateProfile.mutate(payload)
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingView}
        >
          <LinearGradient
            colors={['#1c1714', '#0c0a08']}
            style={styles.sheetContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.dragIndicatorWrap}>
              <View style={styles.dragIndicator} />
            </View>

            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Dados da conta</Text>
                <Text style={styles.headerSubtitle}>
                  Mantenha suas informações sempre atualizadas
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              {/* NOME */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <View style={[styles.inputContainer, focusedField === 'name' && styles.inputFocused]}>
                  <Ionicons name="person-outline" size={20} color={focusedField === 'name' ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <View style={[styles.inputContainer, focusedField === 'email' && styles.inputFocused]}>
                  <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    placeholder="voce@email.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* SENHA */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nova senha <Text style={styles.optionalText}>(opcional)</Text></Text>
                <View style={[styles.inputContainer, focusedField === 'password' && styles.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? Colors.primary : Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                    placeholder="Preencha apenas para alterar"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  {password.length > 0 && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.helperText}>
                  Sua nova senha deve conter pelo menos 8 caracteres para garantir a segurança da conta.
                </Text>
              </View>

              <View style={styles.footer}>
                <Button
                  label={updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
                  fullWidth
                  size="lg"
                  loading={updateProfile.isPending}
                  onPress={handleSubmit}
                />
              </View>

            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  avoidingView: {
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: Dimensions.get('window').height * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dragIndicator: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl + 20,
    gap: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
    marginBottom: 2,
  },
  optionalText: {
    color: Colors.textSecondary,
    fontWeight: '400',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    height: 54,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(196,122,42,0.05)',
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: Typography.base,
    height: '100%',
  },
  eyeIcon: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    marginTop: Spacing.md,
  }
})
