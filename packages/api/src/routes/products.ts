import { Router } from 'express'
import pool from '../db'

const router = Router()

router.get('/', async (req, res) => {
  const { q, category } = req.query
  const conditions: string[] = []
  const params: any[] = []

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
})

router.get('/:id', async (req, res) => {
  const { rows: [product] } = await pool.query(
    `SELECT * FROM products WHERE id = $1`,
    [req.params.id]
  )
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' })
  res.json(product)
})

router.get('/:id/prices', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.value, p.registered_at, p.source,
            m.id as market_id, m.name as market_name, m.address, m.city
     FROM prices p JOIN markets m ON m.id = p.market_id
     WHERE p.product_id = $1 AND p.status = 'approved'
     ORDER BY p.registered_at DESC`,
    [req.params.id]
  )
  res.json(rows)
})

export default router
