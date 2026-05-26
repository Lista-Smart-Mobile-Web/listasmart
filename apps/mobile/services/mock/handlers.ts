/**
 * MOCK HANDLERS
 *
 * Mapeia rotas da API para dados fake.
 * Padrão: METHOD /path → { status, data }
 *
 * Para adicionar uma rota nova:
 *   1. Adicione os dados em data.ts
 *   2. Adicione o case aqui
 *   3. Remova quando o backend estiver pronto
 */

import type { InternalAxiosRequestConfig } from 'axios'
import {
  MOCK_USER,
  MOCK_TOKEN,
  MOCK_LISTS_API,
  MOCK_LIST_ITEMS,
  MOCK_PRODUCTS,
  MOCK_PRICE_COMPARISONS,
  MOCK_RANKING,
  MOCK_ANALYTICS_OVERVIEW,
  MOCK_PRICE_HISTORY,
  MOCK_BADGES,
  MOCK_CONTRIBUTIONS,
} from './data'

export interface MockResult {
  data: unknown
  status: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {}
  try {
    return typeof config.data === 'string' ? JSON.parse(config.data) : (config.data as Record<string, unknown>)
  } catch {
    return {}
  }
}

/**
 * Extrai o caminho relativo da URL.
 * Funciona com url = '/lists' ou url = 'http://host/api/v1/lists'
 */
function normalizePath(config: InternalAxiosRequestConfig): string {
  const raw = config.url ?? ''
  // Se a URL for absoluta (começa com http), extrai só o path
  let path = raw.startsWith('http') ? new URL(raw).pathname : raw
  // Remove prefixo /api/v1 caso presente
  path = path.replace(/^\/api\/v1/, '')
  // Garante barra inicial
  if (!path.startsWith('/')) path = `/${path}`
  return path
}

/**
 * Combina método + padrão de path com a requisição real.
 * Suporta segmentos dinâmicos: /lists/:id
 * Retorna os params extraídos ou null se não bater.
 */
function match(
  method: string,
  pattern: string,
  reqMethod: string,
  reqPath: string,
): Record<string, string> | null {
  if (method.toLowerCase() !== reqMethod.toLowerCase()) return null
  const patternParts = pattern.split('/')
  const pathParts = reqPath.split('/')
  if (patternParts.length !== pathParts.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i]
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

// ─── Router principal ─────────────────────────────────────────────────────────

export function getMockResponse(config: InternalAxiosRequestConfig): MockResult | null {
  const method = (config.method ?? 'get').toLowerCase()
  const path   = normalizePath(config)
  const params = (config.params ?? {}) as Record<string, unknown>
  const body   = parseBody(config)

  // ── Auth ──────────────────────────────────────────────────────────────────

  if (match('post', '/auth/login', method, path)) {
    // Aceita qualquer email/senha em modo mock
    return {
      status: 200,
      data: { user: MOCK_USER, token: MOCK_TOKEN },
    }
  }

  if (match('post', '/auth/register', method, path)) {
    const role = (body.role as string) || 'consumer'
    return {
      status: 201,
      data: {
        user: {
          ...MOCK_USER,
          name:  (body.name  as string) || MOCK_USER.name,
          email: (body.email as string) || MOCK_USER.email,
          role,
          points: 0,
          level: 'iniciante',
        },
        token: MOCK_TOKEN,
      },
    }
  }

  // ── Listas ────────────────────────────────────────────────────────────────

  if (match('get', '/lists', method, path)) {
    return { status: 200, data: MOCK_LISTS_API }
  }

  if (match('post', '/lists', method, path)) {
    const newList = {
      id:         `list_${Date.now()}`,
      name:       (body.name as string) || 'Nova lista',
      is_active:  true,
      created_at: new Date().toISOString(),
    }
    MOCK_LISTS_API.push(newList) // persiste em memória durante a sessão
    return { status: 201, data: newList }
  }

  const deleteList = match('delete', '/lists/:id', method, path)
  if (deleteList) {
    const idx = MOCK_LISTS_API.findIndex((l) => l.id === deleteList.id)
    if (idx !== -1) MOCK_LISTS_API.splice(idx, 1)
    return { status: 204, data: null }
  }

  const listItems = match('get', '/lists/:id/items', method, path)
  if (listItems) {
    // Retorna itens no formato snake_case (como a API real retornaria)
    const items = (MOCK_LIST_ITEMS[listItems.id] ?? []).map((item) => ({
      id:              item.id,
      list_id:         item.listId,
      product_id:      item.productId,
      name:            item.name,
      category:        item.category,
      unit:            item.unit,
      quantity:        item.quantity,
      is_checked:      item.isChecked ? 1 : 0,
      avg_price:       item.avgPrice ?? null,
      cheapest_market: item.cheapestMarket ? JSON.stringify(item.cheapestMarket) : null,
    }))
    return { status: 200, data: items }
  }

  const postItem = match('post', '/lists/:id/items', method, path)
  if (postItem) {
    return { status: 201, data: { id: `item_${Date.now()}`, ...body } }
  }

  const deleteItem = match('delete', '/lists/:listId/items/:itemId', method, path)
  if (deleteItem) {
    return { status: 204, data: null }
  }

  const patchItem = match('patch', '/lists/:listId/items/:itemId', method, path)
  if (patchItem) {
    return { status: 200, data: body }
  }

  // ── Produtos ──────────────────────────────────────────────────────────────

  if (match('get', '/products', method, path)) {
    if (params.barcode) {
      const found = MOCK_PRODUCTS.find((p) => p.barcode === params.barcode)
      return { status: 200, data: found ? [found] : [] }
    }
    if (params.q) {
      const q = String(params.q).toLowerCase()
      return { status: 200, data: MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)) }
    }
    return { status: 200, data: MOCK_PRODUCTS }
  }

  const productDetail = match('get', '/products/:id', method, path)
  if (productDetail) {
    const found = MOCK_PRODUCTS.find((p) => p.id === productDetail.id)
    return found ? { status: 200, data: found } : { status: 404, data: { error: 'Produto não encontrado' } }
  }

  // ── Preços / Comparação ───────────────────────────────────────────────────

  if (match('get', '/prices/compare', method, path)) {
    return { status: 200, data: MOCK_PRICE_COMPARISONS }
  }

  // ── Contribuições ─────────────────────────────────────────────────────────

  if (match('post', '/contributions', method, path)) {
    const typeStr = (body.type as string) || 'manual'
    const points = typeStr === 'qr_code' ? 30 : typeStr === 'confirm' ? 5 : 10
    return {
      status: 201,
      data: {
        id:         `contrib_${Date.now()}`,
        userId:     MOCK_USER.id,
        status:     'approved',
        points,
        createdAt:  new Date().toISOString(),
        ...body,
      },
    }
  }

  if (match('get', '/contributions/history', method, path)) {
    return { status: 200, data: MOCK_CONTRIBUTIONS }
  }

  // ── Gamificação ───────────────────────────────────────────────────────────

  if (match('get', '/ranking', method, path)) {
    return { status: 200, data: MOCK_RANKING }
  }

  if (match('get', '/users/me/badges', method, path)) {
    return { status: 200, data: MOCK_BADGES }
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  if (match('get', '/analytics/overview', method, path)) {
    return { status: 200, data: MOCK_ANALYTICS_OVERVIEW }
  }

  if (match('get', '/analytics/prices', method, path)) {
    return { status: 200, data: MOCK_PRICE_HISTORY }
  }

  // ── Endpoint não mapeado ──────────────────────────────────────────────────
  return null
}
