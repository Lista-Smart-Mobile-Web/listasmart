import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
  TextInput, FlatList, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useSubmitContribution } from '@hooks/useContributions'
import { useProductByBarcode, useProductSearch } from '@hooks/useProducts'
import { useMarkets } from '@hooks/useMarkets'
import { Button } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { Product, Market } from '@/types'

type Screen = 'camera' | 'search' | 'price'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [screen, setScreen] = useState<Screen>('camera')
  const [barcode, setBarcode] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [market, setMarket] = useState<Market | null>(null)
  const [price, setPrice] = useState('')
  const [success, setSuccess] = useState(false)

  const submitContribution = useSubmitContribution()
  const barcodeQuery = useProductByBarcode(barcode)
  const searchQuery = useProductSearch(searchText)
  const marketsQuery = useMarkets()

  // When barcode lookup finishes, navigate to the appropriate screen
  useEffect(() => {
    if (!barcode || barcodeQuery.isLoading) return
    if (barcodeQuery.data) {
      setProduct(barcodeQuery.data)
      setScreen('price')
    } else {
      setScreen('search')
    }
  }, [barcode, barcodeQuery.isLoading, barcodeQuery.data])

  const handleBarcode = useCallback(
    ({ data }: { data: string }) => {
      if (scanned || screen !== 'camera') return
      setScanned(true)
      setBarcode(data)
    },
    [scanned, screen],
  )

  function openManual() {
    setBarcode(null)
    setSearchText('')
    setScreen('search')
  }

  function selectProduct(p: Product) {
    setProduct(p)
    setMarket(null)
    setPrice('')
    setScreen('price')
  }

  function closeAll() {
    setScreen('camera')
    setScanned(false)
    setBarcode(null)
    setSearchText('')
    setProduct(null)
    setMarket(null)
    setPrice('')
    setSuccess(false)
  }

  function submit() {
    if (!product || !market) return
    const numPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(numPrice) || numPrice <= 0) return

    submitContribution.mutate(
      {
        type: barcode ? 'qr_code' : 'manual',
        productId: product.id,
        marketId: market.id,
        price: numPrice,
      },
      {
        onSuccess: () => {
          setSuccess(true)
          setTimeout(closeAll, 2500)
        },
      },
    )
  }

  if (!permission) return <View style={styles.safe} />

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.permTitle}>Câmera necessária</Text>
          <Text style={styles.permText}>
            Para escanear produtos e ganhar pontos, permita o acesso à câmera.
          </Text>
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
        <TouchableOpacity style={styles.manualBtn} onPress={openManual}>
          <Ionicons name="create-outline" size={16} color={Colors.primaryLight} />
          <Text style={styles.manualBtnText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Points info chips */}
      <View style={styles.ptsRow}>
        <View style={styles.ptsChip}>
          <Text style={styles.ptsLabel}>Código de barras</Text>
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

      {/* Camera view */}
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcode}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
        />

        {/* Aiming frame corners */}
        <View style={styles.frameOuter}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {/* Loading overlay while barcode lookup is in-flight */}
        {scanned && barcodeQuery.isLoading && (
          <View style={styles.lookupOverlay}>
            <ActivityIndicator color={Colors.primaryLight} size="large" />
            <Text style={styles.lookupText}>Buscando produto…</Text>
          </View>
        )}

        <View style={styles.hint}>
          <Text style={styles.hintText}>Aponte para o código de barras do produto</Text>
        </View>
      </View>

      {/* ── Search Modal ──────────────────────────────────────── */}
      <Modal
        visible={screen === 'search'}
        transparent
        animationType="slide"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.overlay} onPress={closeAll}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Buscar produto</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do produto…"
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />

            {searchQuery.isLoading && (
              <ActivityIndicator color={Colors.primaryLight} style={{ marginVertical: Spacing.lg }} />
            )}

            {searchText.length >= 2 && !searchQuery.isLoading && !searchQuery.data?.length && (
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            )}

            {searchText.length < 2 && (
              <Text style={styles.emptyText}>Digite ao menos 2 letras para buscar</Text>
            )}

            <FlatList
              data={searchQuery.data ?? []}
              keyExtractor={(item) => item.id}
              style={styles.resultList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.productRow} onPress={() => selectProduct(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productMeta}>{item.category} · {item.unit}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Market + Price Modal ──────────────────────────────── */}
      <Modal
        visible={screen === 'price'}
        transparent
        animationType="slide"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.overlay} onPress={closeAll}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
                <Text style={styles.successTitle}>Contribuição enviada!</Text>
                <Text style={styles.successSub}>
                  +{barcode ? '30' : '10'} pontos adicionados ao seu perfil
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Selected product */}
                {product && (
                  <View style={styles.productCard}>
                    <Text style={styles.productCardLabel}>Produto selecionado</Text>
                    <Text style={styles.productCardName}>{product.name}</Text>
                    <Text style={styles.productCardMeta}>{product.category} · {product.unit}</Text>
                  </View>
                )}

                {/* Market selection */}
                <Text style={styles.sectionLabel}>Selecione o supermercado</Text>
                {marketsQuery.isLoading ? (
                  <ActivityIndicator color={Colors.primaryLight} style={{ marginBottom: Spacing.md }} />
                ) : !marketsQuery.data?.length ? (
                  <Text style={styles.emptyText}>Nenhum supermercado cadastrado</Text>
                ) : (
                  <View style={styles.marketList}>
                    {marketsQuery.data.map((m, i) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.marketRow,
                          market?.id === m.id && styles.marketRowActive,
                          i > 0 && styles.marketRowBorder,
                        ]}
                        onPress={() => setMarket(m)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.marketName, market?.id === m.id && styles.marketNameActive]}>
                            {m.name}
                          </Text>
                          <Text style={styles.marketCity}>{m.city}</Text>
                        </View>
                        {market?.id === m.id && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primaryLight} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Price input */}
                <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Preço (R$)</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />

                <Button
                  label={submitContribution.isPending ? 'Enviando…' : 'Enviar contribuição'}
                  loading={submitContribution.isPending}
                  fullWidth
                  size="lg"
                  style={{ marginTop: Spacing.md, marginBottom: Spacing.xxl }}
                  disabled={!product || !market || !price || submitContribution.isPending}
                  onPress={submit}
                />
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const CORNER = 22
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xxl, gap: Spacing.md,
  },
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

  lookupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12,10,8,0.85)',
    alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
  },
  lookupText: { color: Colors.text, fontSize: Typography.base },

  hint: {
    position: 'absolute', bottom: Spacing.xxl, left: Spacing.xxl, right: Spacing.xxl,
    backgroundColor: 'rgba(12,10,8,0.75)', borderRadius: Radius.md, padding: Spacing.md,
  },
  hintText: { color: Colors.text, fontSize: Typography.sm, textAlign: 'center' },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, paddingBottom: 8,
    maxHeight: '88%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text,
    marginBottom: Spacing.md,
  },

  searchInput: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.borderMed,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.base, color: Colors.text, marginBottom: Spacing.md,
  },
  resultList: { maxHeight: 360 },
  emptyText: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg },

  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  productName: { fontSize: Typography.base, color: Colors.text, fontWeight: Typography.semibold },
  productMeta: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.border },

  productCard: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.primaryBorder,
    borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.lg, gap: 2,
  },
  productCardLabel: { fontSize: Typography.xs, color: Colors.primaryLight, fontWeight: Typography.semibold },
  productCardName: { fontSize: Typography.base, color: Colors.text, fontWeight: Typography.bold },
  productCardMeta: { fontSize: Typography.sm, color: Colors.textSecondary },

  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  marketList: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  marketRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    gap: Spacing.sm, backgroundColor: Colors.bg,
  },
  marketRowActive: { backgroundColor: Colors.primaryDim },
  marketRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  marketName: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.semibold },
  marketNameActive: { color: Colors.primaryLight },
  marketCity: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },

  priceInput: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.borderMed,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.xl, color: Colors.text, fontWeight: Typography.bold, textAlign: 'center',
  },

  successBox: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  successTitle: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text },
  successSub: { fontSize: Typography.base, color: Colors.primaryLight },
})
