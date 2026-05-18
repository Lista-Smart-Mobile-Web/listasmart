import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

interface ShoppingList {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

async function fetchLists(): Promise<ShoppingList[]> {
  const { data } = await api.get('/lists')
  return data
}

async function createList(name: string) {
  const { data } = await api.post('/lists', { name })
  return data
}

export default function ListasScreen() {
  const queryClient = useQueryClient()
  const { data: lists = [], isLoading } = useQuery({ queryKey: ['lists'], queryFn: fetchLists })

  const mutation = useMutation({
    mutationFn: createList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  })

  function handleCreate() {
    Alert.prompt('Nova lista', 'Nome da lista', (name) => {
      if (name?.trim()) mutation.mutate(name.trim())
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Listas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
          <Text style={styles.addBtnText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.empty}>Carregando…</Text>
      ) : lists.length === 0 ? (
        <Text style={styles.empty}>Nenhuma lista ainda. Crie a primeira!</Text>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/lista/${item.id}`)}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0a0a0a' },
  addBtn: { backgroundColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  card: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 12, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0a0a0a' },
  cardMeta: { fontSize: 13, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
})
