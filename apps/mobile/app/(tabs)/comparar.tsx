import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLists } from '@hooks/useLists'
import { usePriceComparison } from '@hooks/useProducts'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { PriceComparison } from '@/types'

// TODO: integrar localização real com expo-location quando disponível
// Dependência: GET /prices/compare?list_id=&lat=&lng=&radius=15

export default function CompararScreen() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const { lists } = useLists()

  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  const { data: comparisons = [], isLoading, isFetching } =
    usePriceComparison(selectedListId)

  const selectedList = lists.find((l) => l.id === selectedListId)
  const cheapest = comparisons[0]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Comparar preços</Text>
        <Text style={styles.subtitle}>Veja onde sua lista sai mais barata</Text>
      </View>

      {/* Seletor de lista */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Selecione uma lista</Text>
        <FlatList
          horizontal
          data={lists}
          keyExtractor={(l) => l.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listChips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedListId === item.id && styles.chipActive]}
              onPress={() => setSelectedListId(item.id)}
            >
              <Text style={[styles.chipText, selectedListId === item.id && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {!selectedListId && (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Selecione uma lista</Text>
          <Text style={styles.emptyText}>Escolha uma lista acima para ver a comparação de preços por mercado</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Buscando preços…</Text>
        </View>
      )}

      {selectedListId && !isLoading && comparisons.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sem dados de preços</Text>
          {/* TODO: mensagem muda quando backend retornar dados reais */}
          <Text style={styles.emptyText}>Ainda não há preços cadastrados para os itens desta lista. Contribua escaneando preços!</Text>
        </View>
      )}

      {comparisons.length > 0 && (
        <FlatList
          data={comparisons}
          keyExtractor={(c) => c.marketId}
          contentContainerStyle={styles.results}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            cheapest ? (
              <View style={styles.cheapestBanner}>
                <Ionicons name="trophy" size={20} color={Colors.primaryLight} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cheapestLabel}>Mais barato para "{selectedList?.name}"</Text>
                  <Text style={styles.cheapestMarket}>{cheapest.marketName}</Text>
                </View>
                <Text style={styles.cheapestPrice}>R$ {cheapest.totalPrice.toFixed(2)}</Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }: { item: PriceComparison; index: number }) => (
            <View style={[styles.marketCard, index === 0 && styles.marketCardBest]}>
              <View style={styles.marketTop}>
                <View style={styles.marketRank}>
                  <Text style={[styles.rankNum, index === 0 && styles.rankNumBest]}>#{index + 1}</Text>
                </View>
                <View style={styles.marketInfo}>
                  <Text style={styles.marketName}>{item.marketName}</Text>
                  {item.distance !== undefined && (
                    <Text style={styles.marketDist}>{item.distance.toFixed(1)} km</Text>
                  )}
                </View>
                <View style={styles.marketPricing}>
                  <Text style={styles.marketTotal}>R$ {item.totalPrice.toFixed(2)}</Text>
                  {item.savings > 0 && (
                    <Text style={styles.marketSaving}>-R$ {item.savings.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },

  section: { paddingBottom: Spacing.md },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  listChips: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primaryBorder },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.primaryLight, fontWeight: Typography.semibold },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: Typography.sm, color: Colors.textSecondary },

  results: { paddingHorizontal: Spacing.xl, paddingBottom: 100, gap: Spacing.sm },

  cheapestBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
  },
  cheapestLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  cheapestMarket: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primaryLight },
  cheapestPrice: { fontSize: Typography.lg, fontWeight: Typography.extrabold, color: Colors.primaryLight },

  marketCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
  },
  marketCardBest: { borderColor: Colors.primaryBorder },
  marketTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  marketRank: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rankNum: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary },
  rankNumBest: { color: Colors.primaryLight },
  marketInfo: { flex: 1 },
  marketName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  marketDist: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  marketPricing: { alignItems: 'flex-end' },
  marketTotal: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  marketSaving: { fontSize: Typography.xs, color: Colors.success, fontWeight: Typography.semibold },
})
