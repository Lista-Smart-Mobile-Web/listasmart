import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'

export default function PartnerPromocoesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Promoções</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Nova</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Gerencie suas promoções ativas</Text>

      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhuma promoção ativa</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#0a0a0a' },
  addBtn: { backgroundColor: '#0ea5e9', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#aaa', fontSize: 15 },
})
