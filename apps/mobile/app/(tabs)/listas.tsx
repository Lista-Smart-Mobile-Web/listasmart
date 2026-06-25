import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, TextInput
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useLists, useDeleteList } from '@hooks/useLists'
import { useAuthStore } from '@store/useAuthStore'
import { OfflineBanner } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { ShoppingListLocal } from '@/types'

export default function ListasScreen() {
  const { lists, isLoading } = useLists()
  const deleteList = useDeleteList()
  const user = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLists = lists.filter((l: ShoppingListLocal) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function confirmDelete(list: ShoppingListLocal) {
    Alert.alert('Excluir lista', `Excluir "${list.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteList.mutate(list.id) },
    ])
  }

  const checkedTotal = (list: ShoppingListLocal) => list.items.filter((i) => i.isChecked).length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <OfflineBanner />

      {/* Global Style Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
          {/* Notification dot */}
          <View style={styles.notifDot} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.logoBox}>
            <Text style={styles.logoL}>L</Text>
          </View>
          <Text style={styles.appName}>Lista Smart</Text>
        </View>

        <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/(tabs)/perfil')}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginLeft: Spacing.md }} />
          <TextInput
            placeholder="Buscar listas..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.searchPlusBtn} 
            onPress={() => router.push('/lista/nova')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats bar (Bento style) */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="list" size={14} color={Colors.primaryLight} />
          <Text style={styles.statText}>{lists.length} listas</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="trophy-outline" size={14} color={Colors.primaryLight} />
          <Text style={styles.statText}>{user?.points ?? 0} pts</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: Colors.primaryDim, borderColor: Colors.primaryBorder }]}>
          <Text style={[styles.statText, { color: Colors.primaryLight, textTransform: 'capitalize' }]}>{user?.level ?? 'iniciante'}</Text>
        </View>
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando…</Text>
        </View>
      ) : filteredLists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma lista encontrada</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const total = item.items.length
            const checked = checkedTotal(item)
            const progress = total > 0 ? checked / total : 0
            return (
              <View>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push(`/lista/${item.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardDate}>Atualizado em {new Date(item.createdAt).toLocaleDateString()}</Text>

                  <View style={styles.progressWrap}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {checked}/{total} itens
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md 
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
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
  
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primaryLight },

  searchWrap: { paddingHorizontal: Spacing.xl, marginVertical: Spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.full,
    height: 52,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.text,
  },
  searchPlusBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(196,122,42,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 4,
  },

  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.lg },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full,
  },
  statText: { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.textSecondary },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: 140, paddingTop: Spacing.xs, gap: Spacing.md },
  
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24, // Bento Box Radius
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: Typography.lg, fontWeight: Typography.extrabold, color: Colors.text },
  cardDate: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4, marginBottom: Spacing.md },
  deleteBtn: { padding: 4 },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  progressText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary, width: 60, textAlign: 'right' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100, gap: Spacing.md },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted },
})
