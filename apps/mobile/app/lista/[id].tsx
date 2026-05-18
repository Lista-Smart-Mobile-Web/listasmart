import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

interface ListItem {
  id: string
  product_id: string
  name: string
  category: string
  unit: string
  quantity: number
  is_checked: boolean
}

interface ListDetail {
  id: string
  name: string
  items: ListItem[]
}

export default function ListaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: list, isLoading } = useQuery<ListDetail>({
    queryKey: ['list', id],
    queryFn: () => api.get(`/lists/${id}`).then((r) => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ itemId, is_checked }: { itemId: string; is_checked: boolean }) =>
      api.patch(`/lists/${id}/items/${itemId}`, { is_checked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/lists/${id}/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list', id] }),
  })

  function confirmDelete(itemId: string, name: string) {
    Alert.alert('Remover item', `Remover "${name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteMutation.mutate(itemId) },
    ])
  }

  const checkedCount = list?.items.filter((i) => i.is_checked).length ?? 0

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{list?.name ?? '…'}</Text>
      {list && (
        <Text style={styles.progress}>{checkedCount}/{list.items.length} itens</Text>
      )}

      {isLoading ? (
        <Text style={styles.empty}>Carregando…</Text>
      ) : list?.items.length === 0 ? (
        <Text style={styles.empty}>Lista vazia. Adicione produtos pelo comparador.</Text>
      ) : (
        <FlatList
          data={list!.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.is_checked && styles.itemChecked]}
              onPress={() => toggleMutation.mutate({ itemId: item.id, is_checked: !item.is_checked })}
              onLongPress={() => confirmDelete(item.id, item.name)}
            >
              <View style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}>
                {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.is_checked && styles.strikethrough]}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.quantity}x · {item.unit}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  back: { paddingHorizontal: 20, marginBottom: 8 },
  backText: { color: '#f59e0b', fontWeight: '600', fontSize: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#0a0a0a', paddingHorizontal: 20 },
  progress: { fontSize: 13, color: '#999', paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemChecked: { opacity: 0.5 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  checkboxChecked: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: '#0a0a0a' },
  strikethrough: { textDecorationLine: 'line-through' },
  itemMeta: { fontSize: 13, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, paddingHorizontal: 40 },
})
