import { View, Text, ScrollView, StyleSheet } from 'react-native'

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Inteligência</Text>
      <Text style={styles.subtitle}>Seu painel de economia</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Economia este mês</Text>
        <Text style={styles.cardValue}>—</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Produto mais caro que a média</Text>
        <Text style={styles.cardValue}>—</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mercado mais barato para sua lista</Text>
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
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: '700', color: '#0a0a0a' },
})
