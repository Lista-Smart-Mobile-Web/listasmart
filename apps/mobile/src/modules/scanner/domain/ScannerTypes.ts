import type { Product } from '@/types'

export interface NfeMatchedItem {
  code: string | null
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  product: Product | null
  matched: boolean
}

export interface NfeScanResponse {
  accessKey: string | null
  issuedAt: string | null
  total: number | null
  emitter: {
    cnpj: string | null
    name: string | null
    address: string | null
    city: string | null
  }
  market: {
    id: string
    name: string
    city: string
  } | null
  items: NfeMatchedItem[]
}

export interface ProcessedFiscalScan {
  marketName: string | null
  preferredMarketId: string | null
  matchedItems: NfeMatchedItem[]
}
