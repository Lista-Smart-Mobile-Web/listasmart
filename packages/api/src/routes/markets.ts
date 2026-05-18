import { Router } from 'express'
import pool from '../db'

const router = Router()

router.get('/', async (req, res) => {
  const { city } = req.query
  const params: any[] = []
  const where = city ? (params.push(city), `WHERE city ILIKE $1`) : ''
  const { rows } = await pool.query(
    `SELECT id, name, address, city, lat, lng FROM markets ${where} ORDER BY name`,
    params
  )
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const { rows: [market] } = await pool.query(
    `SELECT * FROM markets WHERE id = $1`,
    [req.params.id]
  )
  if (!market) return res.status(404).json({ error: 'Mercado não encontrado' })
  res.json(market)
})

router.get('/:id/prices', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.value, p.registered_at, pr.id as product_id, pr.name as product_name, pr.category, pr.unit
     FROM prices p JOIN products pr ON pr.id = p.product_id
     WHERE p.market_id = $1 AND p.status = 'approved'
     ORDER BY pr.name, p.registered_at DESC`,
    [req.params.id]
  )
  res.json(rows)
})

export default router
