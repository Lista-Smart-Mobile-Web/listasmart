import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db'
import { wrap } from '../middleware/asyncWrap'
import { registerSchema, loginSchema } from '@listasmart/shared'

const router = Router()

router.post('/register', wrap(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, email, password, role, marketId } = parsed.data
  const hash = await bcrypt.hash(password, 10)

  try {
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, market_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, role, market_id as "marketId", points, level`,
      [name, email, hash, role, marketId ?? null]
    )
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )
    res.status(201).json({ user, token })
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
    throw err
  }
}))

router.post('/login', wrap(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password } = parsed.data
  const { rows: [user] } = await pool.query(
    `SELECT id, name, email, password_hash, role, market_id as "marketId", points, level
     FROM users WHERE email = $1`,
    [email]
  )
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const { password_hash, ...userData } = user
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )
  res.json({ user: userData, token })
}))

export default router
