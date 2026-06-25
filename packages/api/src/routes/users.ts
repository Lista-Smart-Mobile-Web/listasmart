import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { updateUserSchema } from '@listasmart/shared'

const router = Router()

router.get('/me', authUser, async (req, res) => {
  const { rows: [user] } = await pool.query(
    `SELECT id, name, email, points, level, created_at FROM users WHERE id = $1`,
    [req.user!.id]
  )
  res.json(user)
})

router.patch('/me', authUser, async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, email } = parsed.data

  try {
    const { rows: [user] } = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, points, level`,
      [name, email, req.user!.id]
    )
    res.json(user)
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'E-mail já cadastrado' })
    }
    throw err
  }
})

router.get('/me/badges', authUser, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT badge_type, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at DESC`,
    [req.user!.id]
  )
  res.json(rows)
})

export default router
