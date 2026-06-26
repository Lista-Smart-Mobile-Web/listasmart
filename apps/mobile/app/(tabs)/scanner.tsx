import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
  TextInput, FlatList, ActivityIndicator, ScrollView, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useSubmitContribution } from '@hooks/useContributions'
import { useProductByBarcode, useProductSearch, useCreateProduct } from '@hooks/useProducts'
import { useMarkets } from '@hooks/useMarkets'
import { looksLikeFiscalQr, processFiscalQr as processFiscalQrAction, formatPriceInput } from '@services/scanner'
import { Button } from '@components/ui'
import { Colors, Typography, Spacing, Radius } from '@constants/index'
import type { Product, Market } from '@/types'
import type { NfeMatchedItem } from '@/src/modules/scanner/domain/ScannerTypes'

type Screen = 'camera' | 'search' | 'create_product' | 'nfeItems' | 'price'
type ContributionType = 'qr_code' | 'manual'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [screen, setScreen] = useState<Screen>('camera')

  const [barcode, setBarcode] = useState<string | null>(null)
  const [rawScanData, setRawScanData] = useState<string | null>(null)
  const [isFiscalLookup, setIsFiscalLookup] = useState(false)
  const [nfeItems, setNfeItems] = useState<NfeMatchedItem[]>([])
  const [fiscalMarketName, setFiscalMarketName] = useState<string | null>(null)
  const [preferredMarketId, setPreferredMarketId] = useState<string | null>(null)
  const [contributionType, setContributionType] = useState<ContributionType>('manual')

  const [searchText, setSearchText] = useState('')
  const [newCat, setNewCat] = useState('Alimentos')
  const [newUnit, setNewUnit] = useState('un')

  const [product, setProduct] = useState<Product | null>(null)
  const [market, setMarket] = useState<Market | null>(null)
  const [price, setPrice] = useState('')
  const [success, setSuccess] = useState(false)

  const submitContribution = useSubmitContribution()
  const createProduct = useCreateProduct()
  const barcodeQuery = useProductByBarcode(barcode)
  const searchQuery = useProductSearch(searchText)
  const marketsQuery = useMarkets()

  useEffect(() => {
    if (!barcode || barcodeQuery.isLoading) return

    if (barcodeQuery.data) {
      setProduct(barcodeQuery.data)
      setContributionType('manual')
      setPrice('')
      setScreen('price')
      return
    }

    setScreen('search')
  }, [barcode, barcodeQuery.isLoading, barcodeQuery.data])

  useEffect(() => {
    if (!preferredMarketId || !marketsQuery.data?.length) return
    const found = marketsQuery.data.find((m) => m.id === preferredMarketId)
    if (found) setMarket(found)
  }, [preferredMarketId, marketsQuery.data])

  useEffect(() => {
    if (!barcodeQuery.isError || !barcode) return
    Alert.alert('Falha ao buscar produto', 'Nao foi possivel consultar este codigo agora. Tente busca manual.')
    setScreen('search')
  }, [barcodeQuery.isError, barcode])

  const selectFiscalItem = useCallback((item: NfeMatchedItem) => {
    if (!item.product) return

    setProduct(item.product)
    setContributionType('qr_code')
    setPrice(formatPriceInput(item.unitPrice || item.totalPrice))
    setScreen('price')
  }, [])

  const processFiscalQr = useCallback(async (input: string) => {
    setIsFiscalLookup(true)

    try {
      const result = await processFiscalQrAction(input)

      setFiscalMarketName(result.marketName)
      setPreferredMarketId(result.preferredMarketId)

      if (!result.matchedItems.length) {
        Alert.alert(
          'Cupom lido, mas sem itens cadastrados',
          'Nao encontramos produtos deste cupom no catalogo. Continue no modo manual.'
        )
        setContributionType('manual')
        setScreen('search')
        return
      }

      setNfeItems(result.matchedItems)

      if (result.matchedItems.length === 1) {
        selectFiscalItem(result.matchedItems[0])
      } else {
        setScreen('nfeItems')
      }
    } catch {
      setContributionType('manual')
      setBarcode(input)
    } finally {
      setIsFiscalLookup(false)
    }
  }, [selectFiscalItem])

  const handleBarcode = useCallback(
    ({ data, type }: { data: string; type?: string }) => {
      if (scanned || screen !== 'camera') return

      setScanned(true)
      setRawScanData(data)

      if (looksLikeFiscalQr(data, type)) {
        void processFiscalQr(data)
        return
      }

      setContributionType('manual')
      setBarcode(data)
    },
    [scanned, screen, processFiscalQr],
  )

  function openManual() {
    setBarcode(null)
    setContributionType('manual')
    setSearchText('')
    setScreen('search')
  }

  function selectProduct(p: Product) {
    setProduct(p)
    setContributionType(barcode ? 'qr_code' : 'manual')
    setPreferredMarketId(null)
    setMarket(null)
    setPrice('')
    setScreen('price')
  }

  function handleCreateProduct() {
    if (searchText.length < 2) return
    createProduct.mutate({
      name: searchText,
      category: newCat,
      unit: newUnit,
      barcode: barcode || null,
    }, {
      onSuccess: (newProd) => {
        selectProduct(newProd)
      },
      onError: () => {
        Alert.alert('Erro', 'Não foi possível cadastrar o produto.')
      }
    })
  }

  function closeAll() {
    setScreen('camera')
    setScanned(false)

    setBarcode(null)
    setRawScanData(null)
    setIsFiscalLookup(false)
    setNfeItems([])
    setFiscalMarketName(null)
    setPreferredMarketId(null)
    setContributionType('manual')

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
        type: contributionType,
        productId: product.id,
        marketId: market.id,
        price: numPrice,
        qrData: contributionType === 'qr_code' ? rawScanData ?? undefined : undefined,
      },
      {
        onSuccess: () => {
          setSuccess(true)
          setTimeout(closeAll, 2500)
        },
        onError: (err: any) => {
          Alert.alert(
            'Erro ao enviar contribuicao',
            err?.response?.data?.error ?? 'Nao foi possivel enviar agora. Tente novamente.'
          )
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
          <Text style={styles.permTitle}>Camera necessaria</Text>
          <Text style={styles.permText}>
            Para escanear produtos e ganhar pontos, permita o acesso a camera.
          </Text>
          <Button label="Permitir camera" onPress={requestPermission} style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner</Text>
        <TouchableOpacity style={styles.manualBtn} onPress={openManual}>
          <Ionicons name="create-outline" size={16} color={Colors.primaryLight} />
          <Text style={styles.manualBtnText}>Manual</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ptsRow}>
        <View style={styles.ptsChip}>
          <Text style={styles.ptsLabel}>Cupom fiscal (QR)</Text>
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

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcode}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
        />

        <View style={styles.frameOuter}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        {scanned && (isFiscalLookup || barcodeQuery.isLoading) && (
          <View style={styles.lookupOverlay}>
            <ActivityIndicator color={Colors.primaryLight} size="large" />
            <Text style={styles.lookupText}>
              {isFiscalLookup ? 'Lendo cupom fiscal...' : 'Buscando produto...'}
            </Text>
          </View>
        )}

        <View style={styles.hint}>
          <Text style={styles.hintText}>Aponte para o QR do cupom fiscal ou codigo de barras do produto</Text>
        </View>
      </View>

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
              placeholder="Digite o nome do produto..."
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />

            {searchQuery.isLoading && (
              <ActivityIndicator color={Colors.primaryLight} style={{ marginVertical: Spacing.lg }} />
            )}

            {searchText.length >= 2 && !searchQuery.isLoading && !searchQuery.data?.length && (
              <View style={{ alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg }}>
                <Text style={styles.emptyText}>Produto não encontrado no catálogo.</Text>
                <Button 
                  label="Cadastrar novo produto" 
                  onPress={() => setScreen('create_product')} 
                />
              </View>
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

      <Modal
        visible={screen === 'create_product'}
        transparent
        animationType="slide"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.overlay} onPress={closeAll}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Cadastrar Produto</Text>

            <Text style={styles.sectionLabel}>Nome do Produto</Text>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />

            <Text style={styles.sectionLabel}>Categoria</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md }}>
              {['Alimentos', 'Laticínios', 'Carnes', 'Hortifruti', 'Bebidas', 'Limpeza', 'Padaria'].map((c) => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.chip, newCat === c && styles.chipActive]}
                  onPress={() => setNewCat(c)}
                >
                  <Text style={[styles.chipText, newCat === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Unidade de Medida</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xl }}>
              {['un', 'kg', 'g', 'l', 'ml', 'dz'].map((u) => (
                <TouchableOpacity 
                  key={u} 
                  style={[styles.chip, newUnit === u && styles.chipActive]}
                  onPress={() => setNewUnit(u)}
                >
                  <Text style={[styles.chipText, newUnit === u && styles.chipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label={createProduct.isPending ? 'Salvando...' : 'Salvar Produto'}
              loading={createProduct.isPending}
              onPress={handleCreateProduct}
              disabled={searchText.length < 2 || createProduct.isPending}
              fullWidth
              size="lg"
              style={{ marginBottom: Spacing.xl }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={screen === 'nfeItems'}
        transparent
        animationType="slide"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.overlay} onPress={closeAll}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Produtos do cupom</Text>

            {fiscalMarketName && (
              <View style={styles.receiptInfo}>
                <Ionicons name="storefront-outline" size={14} color={Colors.primaryLight} />
                <Text style={styles.receiptInfoText}>{fiscalMarketName}</Text>
              </View>
            )}

            <Text style={styles.receiptHelp}>
              Selecione o item que deseja enviar como contribuicao.
            </Text>

            <FlatList
              data={nfeItems}
              keyExtractor={(item, idx) => `${item.product?.id ?? 'item'}-${idx}`}
              style={styles.resultList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.productRow} onPress={() => selectFiscalItem(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.product?.name ?? item.name}</Text>
                    <Text style={styles.productMeta}>
                      R$ {item.unitPrice.toFixed(2).replace('.', ',')} · {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <Button
              label="Nao encontrei meu item"
              variant="ghost"
              fullWidth
              onPress={openManual}
              style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
            />
          </Pressable>
        </Pressable>
      </Modal>

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
                <Text style={styles.successTitle}>Contribuicao enviada!</Text>
                <Text style={styles.successSub}>
                  +{contributionType === 'qr_code' ? '30' : '10'} pontos adicionados ao seu perfil
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {product && (
                  <View style={styles.productCard}>
                    <Text style={styles.productCardLabel}>Produto selecionado</Text>
                    <Text style={styles.productCardName}>{product.name}</Text>
                    <Text style={styles.productCardMeta}>{product.category} · {product.unit}</Text>
                    {contributionType === 'qr_code' && (
                      <View style={styles.fiscalBadge}>
                        <Ionicons name="receipt-outline" size={12} color={Colors.primaryLight} />
                        <Text style={styles.fiscalBadgeText}>Cupom fiscal</Text>
                      </View>
                    )}
                  </View>
                )}

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

                <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Preco (R$)</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />

                <Button
                  label={submitContribution.isPending ? 'Enviando...' : 'Enviar contribuicao'}
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

  fiscalBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  fiscalBadgeText: { fontSize: Typography.xs, color: Colors.primaryLight, fontWeight: Typography.semibold },

  receiptInfo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  receiptInfoText: { color: Colors.primaryLight, fontSize: Typography.xs, fontWeight: Typography.semibold },
  receiptHelp: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md },

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

  chip: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6, backgroundColor: Colors.bg,
  },
  chipActive: { borderColor: Colors.primaryLight, backgroundColor: Colors.primaryDim },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryLight, fontWeight: Typography.bold },
})
