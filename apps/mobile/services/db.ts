import * as SQLite from 'expo-sqlite'
import type { ListItemLocal, ShoppingListLocal, OfflineOperation } from '@/types'

// ─── Conexão ──────────────────────────────────────────────────────────────────
// expo-sqlite ≥ 13 usa a API síncrona openDatabaseSync
const db = SQLite.openDatabaseSync('listasmart.db')

// ─── Inicialização ────────────────────────────────────────────────────────────
export function initDB(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS lists (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      pending_sync INTEGER NOT NULL DEFAULT 0,
      pending_delete INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS list_items (
      id              TEXT PRIMARY KEY,
      list_id         TEXT NOT NULL,
      product_id      TEXT NOT NULL,
      name            TEXT NOT NULL,
      category        TEXT NOT NULL DEFAULT '',
      unit            TEXT NOT NULL DEFAULT 'un',
      quantity        INTEGER NOT NULL DEFAULT 1,
      is_checked      INTEGER NOT NULL DEFAULT 0,
      avg_price       REAL,
      cheapest_market TEXT,
      pending_sync    INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      payload     TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      retries     INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_items_list_id ON list_items(list_id);
  `)
}

// ─── Listas ───────────────────────────────────────────────────────────────────
export function getLists(): ShoppingListLocal[] {
  const rows = db.getAllSync<{
    id: string; name: string; is_active: number; created_at: string;
    pending_sync: number; pending_delete: number
  }>('SELECT * FROM lists WHERE pending_delete = 0 ORDER BY created_at DESC')

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    items: getItemsByList(r.id),
    _pendingSync: Boolean(r.pending_sync),
    _pendingDelete: Boolean(r.pending_delete),
  }))
}

export function upsertList(list: Pick<ShoppingListLocal, 'id' | 'name' | 'createdAt'>, pendingSync = false): void {
  db.runSync(
    `INSERT OR REPLACE INTO lists (id, name, is_active, created_at, pending_sync)
     VALUES (?, ?, 1, ?, ?)`,
    [list.id, list.name, list.createdAt, pendingSync ? 1 : 0]
  )
}

export function markListDeleted(listId: string): void {
  db.runSync('UPDATE lists SET pending_delete = 1 WHERE id = ?', [listId])
}

export function hardDeleteList(listId: string): void {
  db.runSync('DELETE FROM lists WHERE id = ?', [listId])
}

export function markListSynced(listId: string): void {
  db.runSync('UPDATE lists SET pending_sync = 0 WHERE id = ?', [listId])
}

// ─── Itens ────────────────────────────────────────────────────────────────────
export function getItemsByList(listId: string): ListItemLocal[] {
  const rows = db.getAllSync<{
    id: string; list_id: string; product_id: string; name: string;
    category: string; unit: string; quantity: number; is_checked: number;
    avg_price: number | null; cheapest_market: string | null; pending_sync: number
  }>('SELECT * FROM list_items WHERE list_id = ? ORDER BY rowid', [listId])

  return rows.map((r) => ({
    id: r.id,
    listId: r.list_id,
    productId: r.product_id,
    name: r.name,
    category: r.category,
    unit: r.unit,
    quantity: r.quantity,
    isChecked: Boolean(r.is_checked),
    avgPrice: r.avg_price ?? undefined,
    cheapestMarket: r.cheapest_market ? JSON.parse(r.cheapest_market) : undefined,
    _pendingSync: Boolean(r.pending_sync),
  }))
}

export function upsertItem(item: ListItemLocal, pendingSync = false): void {
  db.runSync(
    `INSERT OR REPLACE INTO list_items
       (id, list_id, product_id, name, category, unit, quantity, is_checked, avg_price, cheapest_market, pending_sync)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id, item.listId, item.productId, item.name,
      item.category, item.unit, item.quantity,
      item.isChecked ? 1 : 0,
      item.avgPrice ?? null,
      item.cheapestMarket ? JSON.stringify(item.cheapestMarket) : null,
      pendingSync ? 1 : 0,
    ]
  )
}

export function toggleItem(itemId: string): void {
  db.runSync(
    'UPDATE list_items SET is_checked = CASE WHEN is_checked = 0 THEN 1 ELSE 0 END, pending_sync = 1 WHERE id = ?',
    [itemId]
  )
}

export function deleteItem(itemId: string): void {
  db.runSync('DELETE FROM list_items WHERE id = ?', [itemId])
}

export function markItemSynced(itemId: string): void {
  db.runSync('UPDATE list_items SET pending_sync = 0 WHERE id = ?', [itemId])
}

// ─── Fila offline ─────────────────────────────────────────────────────────────
export function enqueueOfflineOp(op: Omit<OfflineOperation, 'retries'>): void {
  db.runSync(
    'INSERT INTO offline_queue (id, type, payload, created_at, retries) VALUES (?, ?, ?, ?, 0)',
    [op.id, op.type, JSON.stringify(op.payload), op.createdAt]
  )
}

export function getOfflineQueue(): OfflineOperation[] {
  const rows = db.getAllSync<{
    id: string; type: string; payload: string; created_at: string; retries: number
  }>('SELECT * FROM offline_queue ORDER BY created_at ASC')

  return rows.map((r) => ({
    id: r.id,
    type: r.type as OfflineOperation['type'],
    payload: JSON.parse(r.payload),
    createdAt: r.created_at,
    retries: r.retries,
  }))
}

export function removeOfflineOp(opId: string): void {
  db.runSync('DELETE FROM offline_queue WHERE id = ?', [opId])
}

export function incrementRetry(opId: string): void {
  db.runSync('UPDATE offline_queue SET retries = retries + 1 WHERE id = ?', [opId])
}

export default db
