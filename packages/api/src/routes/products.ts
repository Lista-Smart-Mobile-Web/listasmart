import { Router } from 'express'
import pool from '../db'
import { wrap } from '../middleware/asyncWrap'
import { authUser } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  unit: z.enum(['un', 'kg', 'g', 'l', 'ml', 'dz']),
  barcode: z.string().optional()
})

router.get('/', wrap(async (req, res) => {
  const { q, category, barcode } = req.query
  const conditions: string[] = []
  const params: unknown[] = []

  if (barcode) {
    params.push(barcode)
    conditions.push(`barcode = $${params.length}`)
  }
  if (q) {
    params.push(`%${q}%`)
    conditions.push(`name ILIKE $${params.length}`)
  }
  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await pool.query(
    `SELECT id, name, category, barcode, unit FROM products ${where} ORDER BY name LIMIT 50`,
    params
  )
  res.json(rows)
}))

router.post('/', authUser, wrap(async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, category, unit, barcode } = parsed.data

  const { rows: [product] } = await pool.query(
    `INSERT INTO products (name, category, unit, barcode) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [name, category, unit, barcode || null]
  )
  res.status(201).json(product)
}))

router.get('/:id', wrap(async (req, res) => {
  const { rows: [product] } = await pool.query(
    `SELECT * FROM products WHERE id = $1`,
    [req.params.id]
  )
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' })
  res.json(product)
}))

router.get('/:id/prices', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.value, p.registered_at, p.source,
            m.id as market_id, m.name as market_name, m.address, m.city
     FROM prices p JOIN markets m ON m.id = p.market_id
     WHERE p.product_id = $1 AND p.status = 'approved'
     ORDER BY p.registered_at DESC`,
    [req.params.id]
  )
  res.json(rows)
}))

export default router
