import { Router } from 'express'
import pool from '../db'
import { wrap } from '../middleware/asyncWrap'

const router = Router()

// GET /prices/compare?product_id=<uuid>&lat=<num>&lng=<num>&radius=<km>
router.get('/compare', wrap(async (req, res) => {
  const { product_id, lat, lng, radius } = req.query

  if (!product_id) {
    return res.status(400).json({ error: 'product_id é obrigatório' })
  }

  const useGeo = lat !== undefined && lng !== undefined
  const radiusKm = Number(radius) || 10

  if (useGeo && (isNaN(Number(lat)) || isNaN(Number(lng)))) {
    return res.status(400).json({ error: 'lat e lng devem ser números válidos' })
  }

  let rows: unknown[]

  if (useGeo) {
    const { rows: result } = await pool.query(
      `SELECT DISTINCT ON (p.market_id)
         p.id, p.value, p.registered_at,
         m.id   AS market_id,   m.name AS market_name,
         m.address, m.city,     m.lat,  m.lng,
         (6371 * acos(
           LEAST(1.0,
             cos(radians($2)) * cos(radians(m.lat)) *
             cos(radians(m.lng) - radians($3)) +
             sin(radians($2)) * sin(radians(m.lat))
           )
         )) AS distance_km
       FROM prices p
       JOIN markets m ON m.id = p.market_id
       WHERE p.product_id = $1
         AND p.status     = 'approved'
         AND (6371 * acos(
               LEAST(1.0,
                 cos(radians($2)) * cos(radians(m.lat)) *
                 cos(radians(m.lng) - radians($3)) +
                 sin(radians($2)) * sin(radians(m.lat))
               )
             )) <= $4
       ORDER BY p.market_id, p.registered_at DESC`,
      [product_id, Number(lat), Number(lng), radiusKm]
    )
    rows = result
  } else {
    const { rows: result } = await pool.query(
      `SELECT DISTINCT ON (p.market_id)
         p.id, p.value, p.registered_at,
         m.id   AS market_id,   m.name AS market_name,
         m.address, m.city,     m.lat,  m.lng
       FROM prices p
       JOIN markets m ON m.id = p.market_id
       WHERE p.product_id = $1 AND p.status = 'approved'
       ORDER BY p.market_id, p.registered_at DESC`,
      [product_id]
    )
    rows = result
  }

  rows.sort((a: any, b: any) => Number(a.value) - Number(b.value))
  res.json(rows)
}))

export default router
