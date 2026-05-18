import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { createListSchema, addListItemSchema, updateListItemSchema } from '@listasmart/shared'

const router = Router()

router.get('/', authUser, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, is_active, created_at FROM lists WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user!.id]
  )
  res.json(rows)
})

router.post('/', authUser, async (req, res) => {
  const parsed = createListSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [list] } = await pool.query(
    `INSERT INTO lists (user_id, name) VALUES ($1,$2) RETURNING *`,
    [req.user!.id, parsed.data.name]
  )
  res.status(201).json(list)
})

router.get('/:id', authUser, async (req, res) => {
  const { rows: [list] } = await pool.query(
    `SELECT * FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' })

  const { rows: items } = await pool.query(
    `SELECT li.id, li.quantity, li.is_checked, p.id as product_id, p.name, p.category, p.unit
     FROM list_items li JOIN products p ON p.id = li.product_id
     WHERE li.list_id = $1`,
    [req.params.id]
  )
  res.json({ ...list, items })
})

router.delete('/:id', authUser, async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Lista não encontrada' })
  res.status(204).end()
})

router.post('/:id/items', authUser, async (req, res) => {
  const parsed = addListItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [list] } = await pool.query(
    `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' })

  const { rows: [item] } = await pool.query(
    `INSERT INTO list_items (list_id, product_id, quantity)
     VALUES ($1,$2,$3)
     ON CONFLICT (list_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity
     RETURNING *`,
    [req.params.id, parsed.data.product_id, parsed.data.quantity ?? 1]
  )
  res.status(201).json(item)
})

router.patch('/:id/items/:itemId', authUser, async (req, res) => {
  const parsed = updateListItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [item] } = await pool.query(
    `UPDATE list_items li SET
       quantity   = COALESCE($1, li.quantity),
       is_checked = COALESCE($2, li.is_checked)
     FROM lists l
     WHERE li.id = $3 AND l.id = li.list_id AND l.user_id = $4
     RETURNING li.*`,
    [parsed.data.quantity, parsed.data.is_checked, req.params.itemId, req.user!.id]
  )
  if (!item) return res.status(404).json({ error: 'Item não encontrado' })
  res.json(item)
})

router.delete('/:id/items/:itemId', authUser, async (req, res) => {
  await pool.query(
    `DELETE FROM list_items li USING lists l
     WHERE li.id = $1 AND l.id = li.list_id AND l.user_id = $2`,
    [req.params.itemId, req.user!.id]
  )
  res.status(204).end()
})

export default router
