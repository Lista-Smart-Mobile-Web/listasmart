import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { contributionSchema } from '@listasmart/shared'
import { awardPoints } from '../services/pointsService'
import { evaluateContribution } from '../services/validationService'

const router = Router()

router.post('/', authUser, async (req, res) => {
  const parsed = contributionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { product_id, market_id, price, type } = parsed.data

  const { rows: [priceRow] } = await pool.query(
    `INSERT INTO prices (product_id, market_id, value, source, status)
     VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
    [product_id, market_id, price, type]
  )

  const { rows: [contribution] } = await pool.query(
    `INSERT INTO contributions (user_id, type, product_id, market_id, price)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.user!.id, type, product_id, market_id, price]
  )

  await evaluateContribution(contribution.id)
  const { points, level } = await awardPoints(req.user!.id, type)

  res.status(201).json({ price: priceRow, contribution, points, level })
})

export default router
