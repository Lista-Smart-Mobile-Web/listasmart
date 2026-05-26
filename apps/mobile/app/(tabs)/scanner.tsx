import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useSubmitContribution } from '@hooks/useContributions'
import { Button, Card } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'

// Pontuação por ação (definida em docs/context.md):
// QR Code completo: +30 pts | Manual: +10 pts | Confirmar: +5 pts

type Mode = 'scan' | 'manual'

interface ManualForm {
  productName: string
  marketName: string
  price: string
}

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [mode, setMode] = useState<Mode>('scan')
  const [manualModal, setManualModal] = useState(false)
  const [form, setForm] = useState<ManualForm>({ productName: '', marketName: '', price: '' })
  const [lastScan, setLastScan] = useState<string | null>(null)

  const submitContribution = useSubmitContribution()

  async function handleBarcode({ data }: { data: string }) {
    if (scanned) return
    setScanned(true)
    setLastScan(data)
    // TODO: quando backend estiver disponível, buscar produto por barcode
    // GET /products?barcode=<data>
    // Se encontrado → mostrar info do produto + opção de confirmar preço
    // Se não encontrado → abrir modal manual com barcode preenchido
    Alert.alert(
      'Código escaneado',
      `Código: ${data}\n\nProduto não encontrado no sistema ainda.\nCadastre o preço manualmente para ganhar +10 pts.`,
      [
        { text: 'Cadastrar preço', onPress: () => { setManualModal(true); setScanned(false) } },
        { text: 'Escanear outro', onPress: () => setScanned(false) },
      ]
    )
  }

  async function handleManualSubmit() {
    const price = parseFloat(form.price.replace(',', '.'))
    if (!form.productName || !form.marketName || isNaN(price)) {
      Alert.alert('Preencha todos os campos')
      return
    }
    // TODO: quando backend disponível, buscar IDs reais de produto e mercado
    // Por ora envia os nomes — backend precisa de productId e marketId reais
    submitContribution.mutate(
      { type: 'manual', price },
      {
        onSuccess: () => {
          setManualModal(false)
          setForm({ productName: '', marketName: '', price: '' })
          Alert.alert('✅ Contribuição enviada!', '+10 pontos adicionados ao seu perfil.')
        },
      }
    )
  }

  if (!permission) return <View style={styles.safe} />

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.permTitle}>Câmera necessária</Text>
          <Text style={styles.permText}>Para escanear cupons e ganhar pontos, permita o acesso à câmera.</Text>
          <Button label="Permitir câmera" onPress={requestPermission} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scanner</Text>
        <TouchableOpacity style={styles.manualBtn} onPress={() => setManualModal(true)}>
          <Ionicons name="create-outline" size={16} color={Colors.primaryLight} />
          <Text style={styles.manualBtnText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Info de pontuação */}
      <View style={styles.ptsRow}>
        <View style={styles.ptsChip}>
          <Text style={styles.ptsLabel}>QR fiscal</Text>
          <Text style={styles.ptsValue}>+30 pts</Text>
        </View>
        <View style={styles.ptsChip}>
          <Text style={styles.ptsLabel}>Manual</Text>
          <Text style={styles.ptsValue}>+10 pts</Text>
        </View>
        <View style={styles.ptsChip}>
          <Text style={styles.ptsLabel}>Confirmar</Text>
          <Text style={styles.ptsValue}>+5 pts</Text>
        </View>
      </View>

      {/* Câmera */}
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcode}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
        />
        {/* Frame overlay */}
        <View style={styles.frameOuter}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
        <View style={styles.hint}>
          <Text style={styles.hintText}>Aponte para o código de barras ou QR do cupom fiscal</Text>
        </View>
      </View>

      {/* Modal cadastro manual */}
      <Modal visible={manualModal} transparent animationType="slide" onRequestClose={() => setManualModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setManualModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Cadastrar preço manualmente</Text>
            <Text style={styles.modalSub}>+10 pontos pela contribuição</Text>

            {[
              { key: 'productName', label: 'Produto', placeholder: 'Ex: Arroz 5kg Tio João' },
              { key: 'marketName', label: 'Supermercado', placeholder: 'Ex: Atacadão Centro' },
              { key: 'price', label: 'Preço (R$)', placeholder: '0,00', keyboard: 'decimal-pad' as const },
            ].map((field) => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType={field.keyboard ?? 'default'}
                  value={form[field.key as keyof ManualForm]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                />
              </View>
            ))}

            <Button
              label={submitContribution.isPending ? 'Enviando…' : 'Enviar contribuição'}
              loading={submitContribution.isPending}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.sm }}
              onPress={handleManualSubmit}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const CORNER = 20
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md },
  permTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, textAlign: 'center' },
  permText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
  },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  manualBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: Colors.primaryBorder,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full,
  },
  manualBtnText: { fontSize: Typography.sm, color: Colors.primaryLight, fontWeight: Typography.semibold },

  ptsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  ptsChip: {
    flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center',
  },
  ptsLabel: { fontSize: 10, color: Colors.textMuted },
  ptsValue: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primaryLight },

  cameraWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  frameOuter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 260, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.primaryLight, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hint: {
    position: 'absolute', bottom: Spacing.xxl, left: Spacing.xxl, right: Spacing.xxl,
    backgroundColor: 'rgba(12,10,8,0.75)', borderRadius: Radius.md, padding: Spacing.md,
  },
  hintText: { color: Colors.text, fontSize: Typography.sm, textAlign: 'center' },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.xxl, gap: Spacing.md,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2,
    alignSelf: 'center', marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  modalSub: { fontSize: Typography.sm, color: Colors.primaryLight },
  fieldWrap: { gap: Spacing.xs },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary },
  fieldInput: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.borderMed,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.text,
  },
})
