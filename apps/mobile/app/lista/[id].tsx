import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, Pressable,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useListStore } from '@store/useListStore'
import { OfflineBanner } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { ListItemLocal } from '@/types'

// TODO: integrar com usePriceComparison quando backend estiver disponível
// Dependência: GET /lists/:id/items (retorna avgPrice e cheapestMarket por item)

export default function ListaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [addModal, setAddModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  const list = useListStore((s) => s.lists.find((l) => l.id === id))
  const { toggleItem, removeItem, addItem } = useListStore()

  if (!list) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Lista não encontrada</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const checked = list.items.filter((i) => i.isChecked).length
  const total = list.items.length
  const progress = total > 0 ? checked / total : 0

  function handleAddItem() {
    const name = newItemName.trim()
    if (!name || !list) return
    addItem(list.id, {
      id: `item_${Date.now()}`,
      productId: `local_${Date.now()}`,
      name,
      category: '',
      unit: 'un',
      quantity: 1,
      isChecked: false,
    })
    setNewItemName('')
    setAddModal(false)
  }

  function confirmRemove(item: ListItemLocal) {
    Alert.alert('Remover', `Remover "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => list && removeItem(list.id, item.id) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>{list.name}</Text>
          <Text style={styles.meta}>{checked}/{total} itens marcados</Text>
        </View>
        <TouchableOpacity
          style={styles.compareBtn}
          onPress={() => router.push('/(tabs)/comparar')}
        >
          <Ionicons name="bar-chart-outline" size={18} color={Colors.primaryLight} />
        </TouchableOpacity>
      </View>

      {/* Barra de progresso */}
      {total > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      {/* Lista de itens */}
      {total === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cart-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Lista vazia</Text>
          <Text style={styles.emptyText}>Adicione produtos pelo botão abaixo</Text>
        </View>
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.isChecked && styles.itemChecked]}
              onPress={() => toggleItem(list.id, item.id)}
              onLongPress={() => confirmRemove(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.isChecked && styles.checkboxDone]}>
                {item.isChecked && <Ionicons name="checkmark" size={14} color="#1a0d00" />}
              </View>
              <View style={styles.itemBody}>
                <Text style={[styles.itemName, item.isChecked && styles.strikethrough]}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity}x · {item.unit}
                  {item.avgPrice ? `  ·  ~R$ ${item.avgPrice.toFixed(2)}` : ''}
                </Text>
              </View>
              {item.cheapestMarket && !item.isChecked && (
                <View style={styles.cheapTag}>
                  <Ionicons name="pricetag-outline" size={11} color={Colors.success} />
                  <Text style={styles.cheapText}>{item.cheapestMarket.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModal(true)}>
        <Ionicons name="add" size={28} color="#1a0d00" />
      </TouchableOpacity>

      {/* Modal adicionar item */}
      <Modal visible={addModal} transparent animationType="fade" onRequestClose={() => setAddModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setAddModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Adicionar item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do produto"
              placeholderTextColor={Colors.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
              onSubmitEditing={handleAddItem}
            />
            {/* TODO: busca por barcode via expo-camera (integrar com ScannerScreen) */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setAddModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddItem}>
                <Text style={styles.modalConfirmText}>Adicionar</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
  },
  backIcon: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  title: { fontSize: Typography.lg, fontWeight: Typography.extrabold, color: Colors.text },
  meta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  compareBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    alignItems: 'center', justifyContent: 'center',
  },

  progressWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
  },
  progressBar: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.full },
  progressLabel: { fontSize: Typography.xs, color: Colors.textMuted, width: 32, textAlign: 'right' },

  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },

  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  itemChecked: { opacity: 0.45 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  itemBody: { flex: 1 },
  itemName: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.text },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textMuted },
  itemMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  cheapTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.successDim, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  cheapText: { fontSize: 10, color: Colors.success, fontWeight: Typography.semibold },

  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted },
  backBtn: { marginTop: Spacing.sm },
  backBtnText: { color: Colors.primaryLight, fontWeight: Typography.semibold },

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
