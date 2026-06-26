import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAnalyticsOverview } from '@hooks/useContributions'
import { Card, ScreenHeader, LoadingScreen, EmptyState } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

export default function DashboardScreen() {
  const { data, isLoading } = useAnalyticsOverview()

  const maxTrend = data ? Math.max(...data.weeklyTrend.map((d: any) => d.total)) : 0

  if (isLoading) return <LoadingScreen message="Analisando suas economias..." />

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Inteligência" subtitle="Seu painel de economia" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {!data ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Ainda sem dados"
            description="Conecte ao backend e comece a contribuir com preços para ver suas estatísticas detalhadas."
          />
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
  scroll: { paddingBottom: 100, gap: Spacing.lg, paddingTop: Spacing.md },

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
