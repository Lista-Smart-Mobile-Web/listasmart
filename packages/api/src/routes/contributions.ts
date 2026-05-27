import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'
import { contributionSchema } from '@listasmart/shared'
import { awardPoints } from '../services/pointsService'
import { evaluateContribution, reEvaluatePending } from '../services/validationService'

const router = Router()

router.post('/', authUser, wrap(async (req, res) => {
  const parsed = contributionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { productId, marketId, price, type } = parsed.data

  // Spam guard: same user + product + market within 24 h (confirm type is exempt)
  if (type !== 'confirm') {
    const { rows: [dup] } = await pool.query(
      `SELECT id FROM contributions
       WHERE user_id    = $1
         AND product_id = $2
         AND market_id  = $3
         AND type      != 'confirm'
         AND created_at > NOW() - INTERVAL '24 hours'`,
      [req.user!.id, productId, marketId]
    )
    if (dup) {
      return res.status(429).json({
        error: 'Você já enviou esse produto/mercado nas últimas 24 horas',
      })
    }
  }

  const { rows: [priceRow] } = await pool.query(
    `INSERT INTO prices (product_id, market_id, value, source, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [productId, marketId, price, type]
  )

  const { rows: [contribution] } = await pool.query(
    `INSERT INTO contributions (user_id, type, product_id, market_id, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.user!.id, type, productId, marketId, price]
  )

  const validationResult = await evaluateContribution(contribution.id)

  if (type === 'confirm') {
    await reEvaluatePending(productId, marketId)
  }

  let pointsResult: Awaited<ReturnType<typeof awardPoints>> | null = null
  if (validationResult !== 'rejected') {
    pointsResult = await awardPoints(req.user!.id, type)
  }

  if (pointsResult) {
    await pool.query(
      `UPDATE contributions SET points = $1 WHERE id = $2`,
      [pointsResult.earned, contribution.id]
    )
  }

  res.status(201).json({
    contribution: { ...contribution, status: validationResult },
    price: priceRow,
    points: pointsResult ?? null,
  })
}))

router.get('/history', authUser, wrap(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const { rows } = await pool.query(
    `SELECT
       c.id, c.type, c.price, c.status, c.points, c.created_at,
       p.id   AS product_id,   p.name AS product_name,
       m.id   AS market_id,    m.name AS market_name, m.city
     FROM contributions c
     JOIN products p ON p.id = c.product_id
     JOIN markets  m ON m.id = c.market_id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC
     LIMIT $2`,
    [req.user!.id, limit]
  )
  res.json(rows)
}))

export default router
