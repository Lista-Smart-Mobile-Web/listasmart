import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'
import { createListSchema, addListItemSchema, updateListItemSchema } from '@listasmart/shared'

const router = Router()

router.get('/', authUser, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT 
       l.id, 
       l.name, 
       l.is_active, 
       l.created_at,
       COALESCE(
         json_agg(
           json_build_object('id', li.id, 'isChecked', li.is_checked)
         ) FILTER (WHERE li.id IS NOT NULL),
         '[]'
       ) AS items
     FROM lists l
     LEFT JOIN list_items li ON li.list_id = l.id
     WHERE l.user_id = $1
     GROUP BY l.id
     ORDER BY l.created_at DESC`,
    [req.user!.id]
  )
  res.json(rows)
}))

router.post('/', authUser, wrap(async (req, res) => {
  const parsed = createListSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [list] } = await pool.query(
    `INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING *`,
    [req.user!.id, parsed.data.name]
  )
  res.status(201).json(list)
}))

router.get('/:id', authUser, wrap(async (req, res) => {
  const { rows: [list] } = await pool.query(
    `SELECT * FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' })

  const { rows: items } = await pool.query(
    `SELECT
       li.id,
       li.quantity,
       li.is_checked                          AS "isChecked",
       p.id                                   AS "productId",
       p.name,
       p.category,
       p.unit,
       ROUND(AVG(pr.value)::numeric, 2)       AS "avgPrice",
       (
         SELECT row_to_json(sub) FROM (
           SELECT m2.id, m2.name
           FROM prices pr2
           JOIN markets m2 ON m2.id = pr2.market_id
           WHERE pr2.product_id = p.id AND pr2.status = 'approved'
           ORDER BY pr2.value ASC, pr2.registered_at DESC
           LIMIT 1
         ) sub
       )                                      AS "cheapestMarket"
     FROM list_items li
     JOIN products p  ON p.id = li.product_id
     LEFT JOIN prices pr ON pr.product_id = p.id AND pr.status = 'approved'
     WHERE li.list_id = $1
     GROUP BY li.id, li.quantity, li.is_checked, p.id, p.name, p.category, p.unit
     ORDER BY p.name`,
    [req.params.id]
  )
  res.json({ ...list, items })
}))

router.get('/:id/items', authUser, wrap(async (req, res) => {
  const { rows: [list] } = await pool.query(
    `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' })

  const { rows } = await pool.query(
    `SELECT
       li.id,
       li.quantity,
       li.is_checked                          AS "isChecked",
       p.id                                   AS "productId",
       p.name,
       p.category,
       p.unit,
       ROUND(AVG(pr.value)::numeric, 2)       AS "avgPrice",
       (
         SELECT row_to_json(sub) FROM (
           SELECT m2.id, m2.name
           FROM prices pr2
           JOIN markets m2 ON m2.id = pr2.market_id
           WHERE pr2.product_id = p.id AND pr2.status = 'approved'
           ORDER BY pr2.value ASC, pr2.registered_at DESC
           LIMIT 1
         ) sub
       )                                      AS "cheapestMarket"
     FROM list_items li
     JOIN products p  ON p.id = li.product_id
     LEFT JOIN prices pr ON pr.product_id = p.id AND pr.status = 'approved'
     WHERE li.list_id = $1
     GROUP BY li.id, li.quantity, li.is_checked, p.id, p.name, p.category, p.unit
     ORDER BY p.name`,
    [req.params.id]
  )
  res.json(rows)
}))

router.delete('/:id', authUser, wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Lista não encontrada' })
  res.status(204).end()
}))

router.post('/:id/items', authUser, wrap(async (req, res) => {
  const parsed = addListItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [list] } = await pool.query(
    `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' })

  const { rows: [item] } = await pool.query(
    `INSERT INTO list_items (list_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (list_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity
     RETURNING *`,
    [req.params.id, parsed.data.productId, parsed.data.quantity ?? 1]
  )
  res.status(201).json(item)
}))

router.patch('/:id/items/:itemId', authUser, wrap(async (req, res) => {
  const parsed = updateListItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [item] } = await pool.query(
    `UPDATE list_items li
     SET
       quantity   = COALESCE($1, li.quantity),
       is_checked = COALESCE($2, li.is_checked)
     FROM lists l
     WHERE li.id = $3
       AND l.id  = li.list_id
       AND l.user_id = $4
     RETURNING li.*`,
    [parsed.data.quantity, parsed.data.isChecked, req.params.itemId, req.user!.id]
  )
  if (!item) return res.status(404).json({ error: 'Item não encontrado' })
  res.json(item)
}))

router.delete('/:id/items/:itemId', authUser, wrap(async (req, res) => {
  await pool.query(
    `DELETE FROM list_items li
     USING lists l
     WHERE li.id      = $1
       AND l.id       = li.list_id
       AND l.user_id  = $2`,
    [req.params.itemId, req.user!.id]
  )
  res.status(204).end()
}))

export default router
