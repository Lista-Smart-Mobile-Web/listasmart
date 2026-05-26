/**
 * MOCK DB SEEDER
 *
 * Popula o SQLite com dados fake na primeira execução.
 * Só roda se o banco estiver vazio (getLists().length === 0).
 *
 * Necessário porque as telas leem itens diretamente do SQLite via Zustand,
 * não da resposta da API. Sem esse seed, as listas aparecem mas sem itens.
 *
 * TODO: remover quando o backend estiver pronto e retornar dados reais.
 */

import { getLists, upsertList, upsertItem } from '../db'
import { MOCK_LISTS_API, MOCK_LIST_ITEMS } from './data'

export function seedMockDB(): void {
  const existing = getLists()
  if (existing.length > 0) return // já semeado, evita duplicação

  for (const list of MOCK_LISTS_API) {
    upsertList({ id: list.id, name: list.name, createdAt: list.created_at })

    const items = MOCK_LIST_ITEMS[list.id] ?? []
    for (const item of items) {
      upsertItem(item)
    }
  }

  console.info(`[MOCK] SQLite semeado com ${MOCK_LISTS_API.length} listas e ${
    Object.values(MOCK_LIST_ITEMS).flat().length
  } itens`)
}
