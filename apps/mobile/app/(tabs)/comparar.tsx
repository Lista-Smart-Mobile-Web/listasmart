import { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

interface Product { id: string; name: string; category: string; unit: string }
interface PriceEntry { value: string; market_name: string; registered_at: string }

export default function CompararScreen() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', query],
    queryFn: () => api.get('/products', { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
  })

  const { data: prices = [] } = useQuery<PriceEntry[]>({
    queryKey: ['prices', selectedId],
    queryFn: () => api.get(`/products/${selectedId}/prices`).then((r) => r.data),
    enabled: !!selectedId,
  })

  const selected = products.find((p) => p.id === selectedId)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comparar Preços</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar produto…"
        value={query}
        onChangeText={(v) => { setQuery(v); setSelectedId(null) }}
      />

      {!selectedId && products.length > 0 && (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productRow} onPress={() => setSelectedId(item.id)}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>{item.category} · {item.unit}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selected && (
        <>
          <Text style={styles.selectedLabel}>{selected.name}</Text>
          {prices.length === 0 ? (
            <Text style={styles.empty}>Nenhum preço registrado ainda.</Text>
          ) : (
            <FlatList
              data={prices}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={styles.priceRow}>
                  <Text style={styles.marketName}>{item.market_name}</Text>
                  <Text style={styles.price}>R$ {Number(item.value).toFixed(2)}</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0a0a0a', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
  productRow: { padding: 14, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  productName: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  productMeta: { fontSize: 13, color: '#999', marginTop: 2 },
  selectedLabel: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 12, marginTop: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 10, backgroundColor: '#f9f9f9', marginBottom: 8 },
  marketName: { fontSize: 15, color: '#333' },
  price: { fontSize: 15, fontWeight: '700', color: '#f59e0b' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
})
