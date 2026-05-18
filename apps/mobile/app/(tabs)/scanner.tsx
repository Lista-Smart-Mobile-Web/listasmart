import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import api from '../../services/api'

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (!permission?.granted) requestPermission()
  }, [])

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return
    setScanned(true)

    try {
      const { data: product } = await api.get('/products', { params: { q: data } })
      if (product.length > 0) {
        Alert.alert(product[0].name, `Categoria: ${product[0].category}\nUnidade: ${product[0].unit}`, [
          { text: 'OK', onPress: () => setScanned(false) },
        ])
      } else {
        Alert.alert('Produto não encontrado', `Código: ${data}`, [
          { text: 'OK', onPress: () => setScanned(false) },
        ])
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar o produto', [
        { text: 'OK', onPress: () => setScanned(false) },
      ])
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Permissão de câmera necessária</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Aponte para o código de barras</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msg: { fontSize: 16, color: '#666' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 240, height: 160, borderWidth: 2, borderColor: '#f59e0b', borderRadius: 12 },
  hint: { color: '#fff', marginTop: 20, fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
})
