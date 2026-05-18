import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'

const router = Router()

router.get('/me', authUser, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.type, c.price, c.status, c.points, c.created_at,
            p.name as product_name, m.name as market_name
     FROM contributions c
     JOIN products p ON p.id = c.product_id
     JOIN markets m ON m.id = c.market_id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [req.user!.id]
  )
  res.json(rows)
})

export default router
