import { Router } from 'express'
import pool from '../db'
import { authPartner } from '../middleware/auth'

const router = Router()

router.get('/market/:marketId', authPartner, async (req, res) => {
  const { marketId } = req.params

  const [pricesResult, productsResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) as total_prices,
              AVG(value) as avg_price,
              MAX(registered_at) as last_update
       FROM prices WHERE market_id = $1 AND status = 'approved'`,
      [marketId]
    ),
    pool.query(
      `SELECT p.name, pr.value, pr.registered_at
       FROM prices pr JOIN products p ON p.id = pr.product_id
       WHERE pr.market_id = $1 AND pr.status = 'approved'
       ORDER BY pr.registered_at DESC LIMIT 20`,
      [marketId]
    ),
  ])

  res.json({
    stats: pricesResult.rows[0],
    recent_prices: productsResult.rows,
  })
})

export default router
