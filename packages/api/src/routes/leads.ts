import { Router } from 'express'
import pool from '../db'
import { leadSchema } from '@listasmart/shared'

const router = Router()

router.post('/', async (req, res) => {
  const parsed = leadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { store_name, city, contact_name, phone, email, store_count, message } = parsed.data

  const { rows: [lead] } = await pool.query(
    `INSERT INTO leads (store_name, city, contact_name, phone, email, store_count, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
    [store_name, city, contact_name, phone, email, store_count, message ?? null]
  )
  res.status(201).json(lead)
})

export default router
