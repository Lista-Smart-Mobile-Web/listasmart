// Re-exporta todos os tipos de @listasmart/shared
// NUNCA duplique tipos aqui — importe sempre daqui ou de @listasmart/shared
export type {
  User,
  UserRole,
  UserLevel,
  Product,
  Market,
  Price,
  Contribution,
  ContributionType,
  ContributionStatus,
  ShoppingList,
  ListItem,
  Badge,
  Promotion,
} from '@listasmart/shared'

// ─── Tipos locais do app (não pertencem ao shared) ────────────────────────────

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Extensão de ListItem para uso local (inclui o id da linha na lista)
export interface ListItemLocal {
  id: string
  listId: string
  productId: string
  name: string
  category: string
  unit: string
  quantity: number
  isChecked: boolean
  avgPrice?: number
  cheapestMarket?: { id: string; name: string }
  // Offline: se foi adicionado offline ainda não sincronizado
  _pendingSync?: boolean
}

export interface ShoppingListLocal {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  items: ListItemLocal[]
  // Offline
  _pendingSync?: boolean
  _pendingDelete?: boolean
}

export interface RankingEntry {
  position: number
  userId: string
  name: string
  points: number
  level: string
  isCurrentUser?: boolean
}

export interface AnalyticsOverview {
  totalSaved: number
  avgSavingsPercent: number
  topCategory: string
  cheapestMarket: string
  weeklyTrend: { date: string; total: number }[]
}

export interface PriceComparison {
  marketId: string
  marketName: string
  distance?: number
  totalPrice: number
  savings: number
  savingsPercent: number
  items: {
    productId: string
    productName: string
    price: number
    isLowest: boolean
  }[]
}

// Fila de operações offline
export type OfflineOpType =
  | 'CREATE_LIST'
  | 'DELETE_LIST'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'TOGGLE_ITEM'
  | 'SUBMIT_CONTRIBUTION'

export interface OfflineOperation {
  id: string
  type: OfflineOpType
  payload: Record<string, unknown>
  createdAt: string
  retries: number
}
