import { View, Text, ScrollView, StyleSheet } from 'react-native'

export default function PartnerDashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Visão geral do seu mercado</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Produtos mais buscados</Text>
        <Text style={styles.cardValue}>—</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Posição de competitividade</Text>
        <Text style={styles.cardValue}>—</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Últimas atualizações de preço</Text>
        <Text style={styles.cardValue}>—</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0a0a0a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  cardLabel: { fontSize: 13, color: '#0369a1', marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: '700', color: '#0a0a0a' },
})
