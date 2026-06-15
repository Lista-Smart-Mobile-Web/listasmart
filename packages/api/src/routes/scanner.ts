import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'
import { parseNfe } from '../services/nfeService'
import { z } from 'zod'

const router = Router()

const nfeScanSchema = z.object({
  input: z.string().min(1, 'input é obrigatório'),
})

router.post('/nfe', authUser, wrap(async (req, res) => {
  const parsed = nfeScanSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  let nfe: Awaited<ReturnType<typeof parseNfe>>

  try {
    nfe = await parseNfe(parsed.data.input)
  } catch (err: any) {
    return res.status(422).json({
      error: err.message ?? 'Falha ao processar a nota fiscal',
      fallback: 'manual',
    })
  }

  let market: { id: string; name: string; city: string } | null = null
  if (nfe.emitter.cnpj) {
    const cnpjClean = nfe.emitter.cnpj.replace(/\D/g, '')
    const { rows: [m] } = await pool.query(
      `SELECT id, name, city FROM markets WHERE REPLACE(cnpj, '.', '') ILIKE $1 LIMIT 1`,
      [`%${cnpjClean}%`]
    )
    market = m ?? null
  }

  const enrichedItems = await Promise.all(
    nfe.items.map(async (item) => {
      let product: { id: string; name: string; category: string; unit: string } | null = null

      if (item.code) {
        const { rows: [p] } = await pool.query(
          `SELECT id, name, category, unit FROM products WHERE barcode = $1 LIMIT 1`,
          [item.code]
        )
        product = p ?? null
      }

      if (!product) {
        const { rows: [p] } = await pool.query(
          `SELECT id, name, category, unit FROM products WHERE name ILIKE $1 LIMIT 1`,
          [`%${item.name.slice(0, 20).trim()}%`]
        )
        product = p ?? null
      }

      return { ...item, product, matched: !!product }
    })
  )

  res.json({
    accessKey: nfe.accessKey,
    issuedAt: nfe.issuedAt,
    total: nfe.total,
    emitter: nfe.emitter,
    market,
    items: enrichedItems,
  })
}))

export default router
