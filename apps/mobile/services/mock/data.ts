/**
 * MOCK DATA — ListaSmart Dev
 *
 * Dados falsos para desenvolvimento sem backend.
 * Ative com EXPO_PUBLIC_USE_MOCKS=true no .env
 *
 * Para substituir por dados reais: remova o arquivo inteiro e desative a flag.
 */

import type { ListItemLocal, ShoppingListLocal } from '@/types'

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'user_mock_1',
  name: 'Maria Silva',
  email: 'qualquer@email.com', // qualquer email/senha aceita no mock
  role: 'consumer' as const,
  points: 340,
  level: 'verificado' as const,
}

export const MOCK_TOKEN = 'mock.dev.jwt.listasmart'

// ─── Listas (formato da API — snake_case) ─────────────────────────────────────

export const MOCK_LISTS_API: { id: string; name: string; is_active: boolean; created_at: string }[] = [
  { id: 'list_1', name: 'Compras do mês',       is_active: true, created_at: new Date().toISOString() },
  { id: 'list_2', name: 'Feira da semana',       is_active: true, created_at: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 'list_3', name: 'Churrasco de domingo',  is_active: true, created_at: new Date(Date.now() - 172_800_000).toISOString() },
]

// ─── Itens por lista (formato interno — ListItemLocal) ────────────────────────

export const MOCK_LIST_ITEMS: Record<string, ListItemLocal[]> = {
  list_1: [
    { id: 'item_1',  listId: 'list_1', productId: 'prod_1', name: 'Arroz Tio João 5kg',      category: 'Grãos',      unit: 'kg', quantity: 2, isChecked: true,  avgPrice: 28.99, cheapestMarket: { id: 'mkt_1', name: 'Atacadão' } },
    { id: 'item_2',  listId: 'list_1', productId: 'prod_2', name: 'Feijão Carioca Camil 1kg', category: 'Grãos',      unit: 'kg', quantity: 3, isChecked: false, avgPrice: 8.49,  cheapestMarket: { id: 'mkt_1', name: 'Atacadão' } },
    { id: 'item_3',  listId: 'list_1', productId: 'prod_3', name: 'Azeite Gallo 500ml',       category: 'Óleos',      unit: 'un', quantity: 1, isChecked: false, avgPrice: 24.90, cheapestMarket: { id: 'mkt_2', name: 'Carrefour' } },
    { id: 'item_4',  listId: 'list_1', productId: 'prod_4', name: 'Leite Integral 1L',        category: 'Laticínios', unit: 'un', quantity: 6, isChecked: true,  avgPrice: 4.89,  cheapestMarket: { id: 'mkt_1', name: 'Atacadão' } },
    { id: 'item_5',  listId: 'list_1', productId: 'prod_5', name: 'Detergente Ypê 500ml',     category: 'Limpeza',    unit: 'un', quantity: 2, isChecked: false, avgPrice: 2.49,  cheapestMarket: undefined },
  ],
  list_2: [
    { id: 'item_6',  listId: 'list_2', productId: 'prod_6', name: 'Alface Crespa',            category: 'Hortifruti', unit: 'un', quantity: 2, isChecked: false, avgPrice: 2.99,  cheapestMarket: undefined },
    { id: 'item_7',  listId: 'list_2', productId: 'prod_7', name: 'Tomate Italiano',           category: 'Hortifruti', unit: 'kg', quantity: 1, isChecked: true,  avgPrice: 7.99,  cheapestMarket: { id: 'mkt_2', name: 'Carrefour' } },
    { id: 'item_8',  listId: 'list_2', productId: 'prod_8', name: 'Frango Inteiro Sadia',      category: 'Carnes',     unit: 'kg', quantity: 2, isChecked: false, avgPrice: 14.90, cheapestMarket: { id: 'mkt_1', name: 'Atacadão' } },
  ],
  list_3: [
    { id: 'item_9',  listId: 'list_3', productId: 'prod_9',  name: 'Picanha Bovina',          category: 'Carnes',   unit: 'kg', quantity: 2, isChecked: false, avgPrice: 59.90, cheapestMarket: { id: 'mkt_1', name: 'Atacadão' } },
    { id: 'item_10', listId: 'list_3', productId: 'prod_10', name: 'Linguiça Toscana 1kg',    category: 'Carnes',   unit: 'kg', quantity: 1, isChecked: false, avgPrice: 18.90, cheapestMarket: undefined },
    { id: 'item_11', listId: 'list_3', productId: 'prod_11', name: 'Carvão 3kg',              category: 'Outros',   unit: 'un', quantity: 2, isChecked: true,  avgPrice: 12.90, cheapestMarket: undefined },
    { id: 'item_12', listId: 'list_3', productId: 'prod_12', name: 'Cerveja Pack 12x350ml',   category: 'Bebidas',  unit: 'cx', quantity: 1, isChecked: false, avgPrice: 38.90, cheapestMarket: { id: 'mkt_2', name: 'Carrefour' } },
  ],
}

// ─── Produtos ──────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS = [
  { id: 'prod_1',  name: 'Arroz Tio João 5kg',           category: 'Grãos',      barcode: '7896085017003', unit: 'kg' },
  { id: 'prod_2',  name: 'Feijão Carioca Camil 1kg',     category: 'Grãos',      barcode: '7896006706916', unit: 'kg' },
  { id: 'prod_3',  name: 'Azeite Gallo Clássico 500ml',  category: 'Óleos',      barcode: '5601252052027', unit: 'un' },
  { id: 'prod_4',  name: 'Leite Integral Italac 1L',     category: 'Laticínios', barcode: '7897091002124', unit: 'un' },
  { id: 'prod_5',  name: 'Detergente Ypê 500ml',         category: 'Limpeza',    barcode: '7896098900026', unit: 'un' },
  { id: 'prod_6',  name: 'Alface Crespa',                category: 'Hortifruti', barcode: '2000001000001', unit: 'un' },
  { id: 'prod_7',  name: 'Tomate Italiano',              category: 'Hortifruti', barcode: '2000001000002', unit: 'kg' },
  { id: 'prod_8',  name: 'Frango Inteiro Sadia',         category: 'Carnes',     barcode: '7891515901019', unit: 'kg' },
  { id: 'prod_9',  name: 'Picanha Bovina',               category: 'Carnes',     barcode: '2000001000003', unit: 'kg' },
  { id: 'prod_10', name: 'Linguiça Toscana Perdigão 1kg',category: 'Carnes',     barcode: '7891515101017', unit: 'kg' },
  { id: 'prod_11', name: 'Carvão Vegetal 3kg',           category: 'Outros',     barcode: '7898240731005', unit: 'un' },
  { id: 'prod_12', name: 'Cerveja Brahma Lata 350ml',    category: 'Bebidas',    barcode: '7891149131016', unit: 'un' },
  { id: 'prod_13', name: 'Macarrão Barilla Espaguete',   category: 'Massas',     barcode: '8076800195057', unit: 'un' },
  { id: 'prod_14', name: 'Manteiga Aviação 200g',        category: 'Laticínios', barcode: '7896004005554', unit: 'un' },
  { id: 'prod_15', name: 'Sabão em Pó Omo 1kg',         category: 'Limpeza',    barcode: '7891150032060', unit: 'un' },
]

// ─── Mercados ──────────────────────────────────────────────────────────────────

export const MOCK_MARKETS = [
  { id: 'mkt_1', name: 'Atacadão',       address: 'Av. Brasil, 1000',    city: 'São Paulo', lat: -23.550, lng: -46.634 },
  { id: 'mkt_2', name: 'Carrefour',      address: 'Rua das Flores, 200', city: 'São Paulo', lat: -23.555, lng: -46.639 },
  { id: 'mkt_3', name: 'Pão de Açúcar',  address: 'R. Augusta, 780',     city: 'São Paulo', lat: -23.558, lng: -46.644 },
  { id: 'mkt_4', name: 'Extra',          address: 'Av. Paulista, 2000',  city: 'São Paulo', lat: -23.561, lng: -46.651 },
]

// ─── Comparação de preços ──────────────────────────────────────────────────────

export const MOCK_PRICE_COMPARISONS = [
  {
    marketId: 'mkt_1', marketName: 'Atacadão', distance: 1.2,
    totalPrice: 87.60, savings: 24.40, savingsPercent: 22,
    items: [
      { productId: 'prod_1', productName: 'Arroz Tio João 5kg',      price: 26.99, isLowest: true  },
      { productId: 'prod_2', productName: 'Feijão Carioca 1kg',       price: 7.90,  isLowest: true  },
      { productId: 'prod_3', productName: 'Azeite Gallo 500ml',       price: 26.50, isLowest: false },
      { productId: 'prod_4', productName: 'Leite Integral 1L',        price: 4.50,  isLowest: true  },
    ],
  },
  {
    marketId: 'mkt_2', marketName: 'Carrefour', distance: 2.5,
    totalPrice: 95.30, savings: 16.70, savingsPercent: 15,
    items: [
      { productId: 'prod_1', productName: 'Arroz Tio João 5kg',      price: 28.50, isLowest: false },
      { productId: 'prod_2', productName: 'Feijão Carioca 1kg',       price: 8.90,  isLowest: false },
      { productId: 'prod_3', productName: 'Azeite Gallo 500ml',       price: 23.90, isLowest: true  },
      { productId: 'prod_4', productName: 'Leite Integral 1L',        price: 5.10,  isLowest: false },
    ],
  },
  {
    marketId: 'mkt_3', marketName: 'Pão de Açúcar', distance: 3.8,
    totalPrice: 108.90, savings: 3.10, savingsPercent: 3,
    items: [
      { productId: 'prod_1', productName: 'Arroz Tio João 5kg',      price: 31.99, isLowest: false },
      { productId: 'prod_2', productName: 'Feijão Carioca 1kg',       price: 9.49,  isLowest: false },
    ],
  },
  {
    marketId: 'mkt_4', marketName: 'Extra', distance: 5.1,
    totalPrice: 112.00, savings: 0, savingsPercent: 0,
    items: [],
  },
]

// ─── Ranking ───────────────────────────────────────────────────────────────────

export const MOCK_RANKING = [
  { position: 1, userId: 'user_other_1', name: 'João Pereira',      points: 1250, level: 'embaixador',   isCurrentUser: false },
  { position: 2, userId: 'user_other_2', name: 'Ana Souza',         points: 980,  level: 'especialista', isCurrentUser: false },
  { position: 3, userId: 'user_other_3', name: 'Carlos Lima',       points: 760,  level: 'especialista', isCurrentUser: false },
  { position: 4, userId: MOCK_USER.id,   name: MOCK_USER.name,      points: MOCK_USER.points, level: MOCK_USER.level, isCurrentUser: true },
  { position: 5, userId: 'user_other_4', name: 'Fernanda Costa',    points: 280,  level: 'verificado',   isCurrentUser: false },
  { position: 6, userId: 'user_other_5', name: 'Ricardo Alves',     points: 210,  level: 'colaborador',  isCurrentUser: false },
  { position: 7, userId: 'user_other_6', name: 'Patrícia Mendes',   points: 175,  level: 'colaborador',  isCurrentUser: false },
  { position: 8, userId: 'user_other_7', name: 'Bruno Santos',      points: 90,   level: 'colaborador',  isCurrentUser: false },
]

// ─── Analytics / Dashboard ─────────────────────────────────────────────────────

export const MOCK_ANALYTICS_OVERVIEW = {
  totalSaved: 47.30,
  avgSavingsPercent: 12,
  topCategory: 'Laticínios',
  cheapestMarket: 'Atacadão',
  weeklyTrend: [
    { date: 'Seg', total: 85  },
    { date: 'Ter', total: 92  },
    { date: 'Qua', total: 78  },
    { date: 'Qui', total: 110 },
    { date: 'Sex', total: 95  },
    { date: 'Sáb', total: 130 },
    { date: 'Dom', total: 60  },
  ],
}

export const MOCK_PRICE_HISTORY = [
  { date: '2026-05-18', price: 28.99, market: 'Atacadão'       },
  { date: '2026-05-19', price: 27.50, market: 'Carrefour'      },
  { date: '2026-05-20', price: 29.90, market: 'Extra'          },
  { date: '2026-05-21', price: 26.99, market: 'Atacadão'       },
  { date: '2026-05-22', price: 27.20, market: 'Carrefour'      },
  { date: '2026-05-23', price: 28.50, market: 'Pão de Açúcar'  },
  { date: '2026-05-24', price: 26.49, market: 'Atacadão'       },
]

// ─── Badges / Conquistas ───────────────────────────────────────────────────────

export const MOCK_BADGES = [
  { badge_type: 'primeira_lista',       earned_at: new Date(Date.now() - 7 * 86_400_000).toISOString() },
  { badge_type: 'colaborador_iniciante', earned_at: new Date(Date.now() - 3 * 86_400_000).toISOString() },
  { badge_type: 'verificador',           earned_at: new Date(Date.now() - 1 * 86_400_000).toISOString() },
]

// ─── Contribuições ─────────────────────────────────────────────────────────────

export const MOCK_CONTRIBUTIONS = [
  { id: 'contrib_1', userId: MOCK_USER.id, type: 'manual',   productId: 'prod_1', marketId: 'mkt_1', price: 26.99, status: 'approved', points: 10, createdAt: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 'contrib_2', userId: MOCK_USER.id, type: 'qr_code',  productId: 'prod_3', marketId: 'mkt_2', price: 23.90, status: 'approved', points: 30, createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString() },
  { id: 'contrib_3', userId: MOCK_USER.id, type: 'confirm',  productId: 'prod_4', marketId: 'mkt_3', price: 4.89,  status: 'pending',  points: 5,  createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString() },
]
