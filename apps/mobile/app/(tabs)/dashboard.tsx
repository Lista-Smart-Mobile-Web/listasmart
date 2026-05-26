import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAnalyticsOverview } from '@hooks/useContributions'
import { Card } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

// TODO: substituir mocks pelos dados reais de GET /analytics/overview quando backend disponível
// Os mocks abaixo simulam a estrutura esperada da resposta da API

const MOCK_OVERVIEW = {
  totalSaved: 47.3,
  avgSavingsPercent: 12,
  topCategory: 'Laticínios',
  cheapestMarket: 'Atacadão',
  weeklyTrend: [
    { date: 'Seg', total: 85 },
    { date: 'Ter', total: 92 },
    { date: 'Qua', total: 78 },
    { date: 'Qui', total: 110 },
    { date: 'Sex', total: 95 },
    { date: 'Sáb', total: 130 },
    { date: 'Dom', total: 60 },
  ],
}

export default function DashboardScreen() {
  const { data: overview, isLoading } = useAnalyticsOverview()

  // Usa dados reais se disponíveis, senão mock para visualização
  const data = overview ?? MOCK_OVERVIEW
  const isMock = !overview

  const maxTrend = Math.max(...data.weeklyTrend.map((d) => d.total))

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inteligência</Text>
          <Text style={styles.subtitle}>Seu painel de economia</Text>
          {isMock && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockText}>Dados de exemplo · conecte ao backend</Text>
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.primaryLight} />
          </View>
        ) : (
          <>
            {/* Cards de métricas */}
            <View style={styles.metricsRow}>
              <Card variant="amber" style={styles.metricCard}>
                <Ionicons name="trending-down" size={20} color={Colors.primaryLight} />
                <Text style={styles.metricValue}>R$ {data.totalSaved.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Economizado este mês</Text>
              </Card>
              <Card variant="default" style={styles.metricCard}>
                <Ionicons name="stats-chart" size={20} color={Colors.success} />
                <Text style={[styles.metricValue, { color: Colors.success }]}>{data.avgSavingsPercent}%</Text>
                <Text style={styles.metricLabel}>Economia média</Text>
              </Card>
            </View>

            {/* Mercado e categoria destaque */}
            <View style={styles.metricsRow}>
              <Card variant="default" style={styles.metricCard}>
                <Ionicons name="storefront-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.metricValueSm}>{data.cheapestMarket}</Text>
                <Text style={styles.metricLabel}>Mercado mais barato</Text>
              </Card>
              <Card variant="default" style={styles.metricCard}>
                <Ionicons name="pricetag-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.metricValueSm}>{data.topCategory}</Text>
                <Text style={styles.metricLabel}>Categoria destaque</Text>
              </Card>
            </View>

            {/* Mini gráfico de tendência semanal */}
            <Card variant="default" style={styles.trendCard}>
              <Text style={styles.trendTitle}>Gastos esta semana</Text>
              <View style={styles.barChart}>
                {data.weeklyTrend.map((d) => {
                  const pct = maxTrend > 0 ? (d.total / maxTrend) * 100 : 0
                  return (
                    <View key={d.date} style={styles.barWrap}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${pct}%` }]} />
                      </View>
                      <Text style={styles.barLabel}>{d.date}</Text>
                    </View>
                  )
                })}
              </View>
            </Card>

            {/* Próximas funcionalidades */}
            <Card variant="default" style={styles.comingSoon}>
              <View style={styles.comingSoonRow}>
                <Ionicons name="bulb-outline" size={18} color={Colors.primaryLight} />
                <Text style={styles.comingSoonTitle}>Em breve</Text>
              </View>
              <Text style={styles.comingSoonText}>
                Histórico de preços por produto, alertas de queda de preço e sugestão automática do mercado mais barato para sua lista.
              </Text>
              {/* TODO: implementar após GET /analytics/prices e sistema de notificações */}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 100, gap: Spacing.lg },

  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.xs },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  mockBadge: {
    alignSelf: 'flex-start', marginTop: Spacing.sm,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  mockText: { fontSize: 10, color: Colors.primaryLight, fontWeight: Typography.semibold },

  loading: { alignItems: 'center', paddingTop: 60 },

  metricsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  metricCard: { flex: 1, gap: Spacing.xs },
  metricValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.primaryLight },
  metricValueSm: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  metricLabel: { fontSize: Typography.xs, color: Colors.textMuted },

  trendCard: { marginHorizontal: Spacing.xl, gap: Spacing.md },
  trendTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs, height: 80 },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '70%', backgroundColor: Colors.border, borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.primaryLight, borderRadius: Radius.sm },
  barLabel: { fontSize: 9, color: Colors.textMuted },

  comingSoon: { marginHorizontal: Spacing.xl, gap: Spacing.sm },
  comingSoonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  comingSoonTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.primaryLight },
  comingSoonText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
})
