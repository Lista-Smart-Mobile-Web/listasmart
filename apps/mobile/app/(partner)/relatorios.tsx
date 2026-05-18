import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'

export default function PartnerRelatoriosScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>Exportação de dados do seu mercado</Text>

      <TouchableOpacity style={styles.exportBtn}>
        <Text style={styles.exportBtnText}>Exportar PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.exportBtn, styles.exportBtnSecondary]}>
        <Text style={[styles.exportBtnText, styles.exportBtnTextSecondary]}>Exportar CSV</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#0a0a0a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32 },
  exportBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportBtnSecondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#0ea5e9' },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  exportBtnTextSecondary: { color: '#0ea5e9' },
})
