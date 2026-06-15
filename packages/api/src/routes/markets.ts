import { Router } from 'express'
import pool from '../db'
import { requireRole } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'
import { promotionSchema } from '@listasmart/shared'

const router = Router()

// ─── Public routes ────────────────────────────────────────────────────────────

router.get('/', wrap(async (req, res) => {
  const { city, lat, lng, radius } = req.query
  const useGeo = lat !== undefined && lng !== undefined
  const radiusKm = Number(radius) || 20

  if (useGeo) {
    const { rows } = await pool.query(
      `SELECT
         id, name, address, city, lat, lng,
         (6371 * acos(
           LEAST(1.0,
             cos(radians($1)) * cos(radians(lat)) *
             cos(radians(lng) - radians($2)) +
             sin(radians($1)) * sin(radians(lat))
           )
         )) AS distance_km
       FROM markets
       WHERE (6371 * acos(
               LEAST(1.0,
                 cos(radians($1)) * cos(radians(lat)) *
                 cos(radians(lng) - radians($2)) +
                 sin(radians($1)) * sin(radians(lat))
               )
             )) <= $3
       ORDER BY distance_km ASC`,
      [Number(lat), Number(lng), radiusKm]
    )
    return res.json(rows)
  }

  const params: unknown[] = []
  const where = city ? (params.push(`%${city}%`), `WHERE city ILIKE $1`) : ''
  const { rows } = await pool.query(
    `SELECT id, name, address, city, lat, lng FROM markets ${where} ORDER BY name`,
    params
  )
  res.json(rows)
}))

router.get('/:id', wrap(async (req, res) => {
  const { rows: [market] } = await pool.query(
    `SELECT id, name, address, city, cnpj, lat, lng, created_at
     FROM markets WHERE id = $1`,
    [req.params.id]
  )
  if (!market) return res.status(404).json({ error: 'Mercado não encontrado' })
  res.json(market)
}))

router.get('/:id/prices', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (p.id)
       pr.value, pr.registered_at,
       p.id AS product_id, p.name AS product_name, p.category, p.unit
     FROM prices pr
     JOIN products p ON p.id = pr.product_id
     WHERE pr.market_id = $1 AND pr.status = 'approved'
     ORDER BY p.id, pr.registered_at DESC`,
    [req.params.id]
  )
  res.json(rows)
}))

router.get('/:id/promotions', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pr.id, pr.price, pr.valid_until,
            p.id AS product_id, p.name AS product_name, p.category, p.unit
     FROM promotions pr
     JOIN products p ON p.id = pr.product_id
     WHERE pr.market_id = $1 AND pr.valid_until > NOW()
     ORDER BY pr.valid_until ASC`,
    [req.params.id]
  )
  res.json(rows)
}))

// ─── Partner-only routes ──────────────────────────────────────────────────────

router.get('/:id/dashboard', requireRole('partner'), wrap(async (req, res) => {
  const { id } = req.params

  const { rows: [market] } = await pool.query(
    `SELECT m.id FROM markets m
     JOIN users u ON u.market_id = m.id
     WHERE m.id = $1 AND u.id = $2`,
    [id, req.user!.id]
  )
  if (!market) return res.status(403).json({ error: 'Acesso negado a este mercado' })

  const [statsRes, topProductsRes, recentContribsRes, competitorsRes, promotionsRes] =
    await Promise.all([
      pool.query(
        `SELECT
           COUNT(DISTINCT pr.product_id)            AS total_products,
           COUNT(c.id)                              AS total_contributions_week,
           ROUND(AVG(pr.value)::numeric, 2)         AS avg_price,
           MAX(pr.registered_at)                    AS last_price_update
         FROM prices pr
         LEFT JOIN contributions c
           ON c.market_id = $1
          AND c.created_at > NOW() - INTERVAL '7 days'
         WHERE pr.market_id = $1 AND pr.status = 'approved'`,
        [id]
      ),
      pool.query(
        `SELECT p.name, p.category,
                COUNT(c.id) AS contribution_count,
                ROUND(AVG(pr.value)::numeric, 2) AS avg_price
         FROM contributions c
         JOIN products p ON p.id = c.product_id
         JOIN prices pr ON pr.product_id = p.id AND pr.market_id = c.market_id AND pr.status = 'approved'
         WHERE c.market_id = $1
         GROUP BY p.id, p.name, p.category
         ORDER BY contribution_count DESC
         LIMIT 10`,
        [id]
      ),
      pool.query(
        `SELECT c.type, c.price, c.status, c.created_at,
                p.name AS product_name
         FROM contributions c
         JOIN products p ON p.id = c.product_id
         WHERE c.market_id = $1
         ORDER BY c.created_at DESC
         LIMIT 20`,
        [id]
      ),
      pool.query(
        `SELECT
           p.name                                   AS product_name,
           pr_own.value                             AS our_price,
           ROUND(AVG(pr_others.value)::numeric, 2) AS market_avg,
           MIN(pr_others.value)                     AS cheapest_competitor,
           m_cheap.name                             AS cheapest_market
         FROM prices pr_own
         JOIN products p ON p.id = pr_own.product_id
         JOIN prices pr_others ON pr_others.product_id = p.id
           AND pr_others.market_id != $1
           AND pr_others.status = 'approved'
         LEFT JOIN LATERAL (
           SELECT m.name FROM prices px
           JOIN markets m ON m.id = px.market_id
           WHERE px.product_id = p.id AND px.market_id != $1 AND px.status = 'approved'
           ORDER BY px.value ASC LIMIT 1
         ) m_cheap ON true
         WHERE pr_own.market_id = $1 AND pr_own.status = 'approved'
         GROUP BY p.name, pr_own.value, m_cheap.name
         ORDER BY (pr_own.value - ROUND(AVG(pr_others.value)::numeric,2)) DESC
         LIMIT 15`,
        [id]
      ),
      pool.query(
        `SELECT pr.id, pr.price, pr.valid_until,
                p.name AS product_name
         FROM promotions pr
         JOIN products p ON p.id = pr.product_id
         WHERE pr.market_id = $1 AND pr.valid_until > NOW()
         ORDER BY pr.valid_until ASC`,
        [id]
      ),
    ])

  res.json({
    stats: statsRes.rows[0],
    top_products: topProductsRes.rows,
    recent_contributions: recentContribsRes.rows,
    competitiveness: competitorsRes.rows,
    active_promotions: promotionsRes.rows,
  })
}))

router.post('/:id/promotions', requireRole('partner'), wrap(async (req, res) => {
  const parsed = promotionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { rows: [market] } = await pool.query(
    `SELECT m.id FROM markets m
     JOIN users u ON u.market_id = m.id
     WHERE m.id = $1 AND u.id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!market) return res.status(403).json({ error: 'Acesso negado a este mercado' })

  const { productId, price, validUntil } = parsed.data
  const { rows: [promo] } = await pool.query(
    `INSERT INTO promotions (market_id, product_id, price, valid_until)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.params.id, productId, price, validUntil]
  )
  res.status(201).json(promo)
}))

router.delete('/:id/promotions/:promoId', requireRole('partner'), wrap(async (req, res) => {
  const { rows: [market] } = await pool.query(
    `SELECT m.id FROM markets m JOIN users u ON u.market_id = m.id
     WHERE m.id = $1 AND u.id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!market) return res.status(403).json({ error: 'Acesso negado a este mercado' })

  const { rowCount } = await pool.query(
    `DELETE FROM promotions WHERE id = $1 AND market_id = $2`,
    [req.params.promoId, req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Promoção não encontrada' })
  res.status(204).end()
}))

router.get('/:id/report', requireRole('partner'), wrap(async (req, res) => {
  const { rows: [market] } = await pool.query(
    `SELECT m.id, m.name FROM markets m JOIN users u ON u.market_id = m.id
     WHERE m.id = $1 AND u.id = $2`,
    [req.params.id, req.user!.id]
  )
  if (!market) return res.status(403).json({ error: 'Acesso negado a este mercado' })

  const periodMap: Record<string, string> = {
    '7d': '7 days',
    '90d': '90 days',
  }
  const period = periodMap[String(req.query.period)] ?? '30 days'

  const { rows } = await pool.query(
    `SELECT
       p.name                     AS produto,
       p.category                 AS categoria,
       p.unit                     AS unidade,
       pr.value                   AS preco,
       pr.source                  AS origem,
       pr.status                  AS status,
       TO_CHAR(pr.registered_at, 'DD/MM/YYYY HH24:MI') AS data_registro
     FROM prices pr
     JOIN products p ON p.id = pr.product_id
     WHERE pr.market_id = $1
       AND pr.registered_at > NOW() - $2::interval
     ORDER BY pr.registered_at DESC`,
    [req.params.id, period]
  )

  const headers = ['Produto', 'Categoria', 'Unidade', 'Preço (R$)', 'Origem', 'Status', 'Data']
  const csv = [
    `# Relatório de Preços — ${market.name}`,
    `# Período: últimos ${period}`,
    '',
    headers.join(';'),
    ...rows.map((r) =>
      [r.produto, r.categoria, r.unidade, r.preco, r.origem, r.status, r.data_registro].join(';')
    ),
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="relatorio_${market.name.replace(/\s+/g, '_')}.csv"`
  )
  res.send('﻿' + csv) // BOM for Excel compatibility
}))

export default router
