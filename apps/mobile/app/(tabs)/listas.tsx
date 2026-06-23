import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@store/useAuthStore'
import { useLists, useCreateList, useDeleteList } from '@hooks/useLists'
import { OfflineBanner } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { ShoppingListLocal } from '@/types'

export default function ListasScreen() {
  const user = useAuthStore((s) => s.user)
  const [modalVisible, setModalVisible] = useState(false)
  const [newListName, setNewListName] = useState('')

  const { lists, isLoading } = useLists()
  const createList = useCreateList()
  const deleteList = useDeleteList()

  function handleCreate() {
    const name = newListName.trim()
    if (!name) return
    createList.mutate(name)
    setNewListName('')
    setModalVisible(false)
  }

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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
              Olá, {user?.name?.split(' ')[0]}
            </Text>
            <Ionicons name="hand-left-outline" size={20} color={Colors.amber} />
          </View>
          <Text style={styles.subtitle}>Suas listas de compras</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
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
          <Text style={[styles.statText, { color: Colors.primaryLight }]}>{user?.level ?? 'iniciante'}</Text>
        </View>
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando…</Text>
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma lista ainda</Text>
          <Text style={styles.emptyText}>Crie sua primeira lista de compras</Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const total = item.items.length
            const checked = checkedTotal(item)
            const progress = total > 0 ? checked / total : 0
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/lista/${item.id}`)}
                onLongPress={() => confirmDelete(item)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="cart-outline" size={20} color={Colors.primaryLight} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {total > 0 ? `${checked}/${total} itens` : 'Lista vazia'}
                      {item._pendingSync ? '  •  pendente sync' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
                {total > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#1a0d00" />
      </TouchableOpacity>

      {/* Modal nova lista */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Nova lista</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da lista"
              placeholderTextColor={Colors.textMuted}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreate}>
                <Text style={styles.modalConfirmText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  greeting: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
  },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full,
  },
  statText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textSecondary },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100, gap: Spacing.sm },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  cardMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  progressBar: {
    height: 3, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.full },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted },

  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xxl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryLight, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: Spacing.xxl },
  modal: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.xxl, gap: Spacing.lg,
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  modalInput: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.borderMed,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.text,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  modalCancel: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  modalCancelText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semibold },
  modalConfirm: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, backgroundColor: Colors.primaryLight,
  },
  modalConfirmText: { fontSize: Typography.sm, color: '#1a0d00', fontWeight: Typography.bold },
})
