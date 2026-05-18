import { Router } from 'express'
import pool from '../db'

const router = Router()

router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, points, level,
            RANK() OVER (ORDER BY points DESC) AS rank
     FROM users
     ORDER BY points DESC
     LIMIT 50`
  )
  res.json(rows)
})

export default router
