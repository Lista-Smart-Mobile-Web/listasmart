import { Router } from 'express'
import pool from '../db'
import { authUser, requireRole } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'

const router = Router()

// ─── Consumer routes ──────────────────────────────────────────────────────────

// GET /analytics/overview — personal savings dashboard for the consumer
router.get('/overview', requireRole('consumer'), wrap(async (req, res) => {
  const userId = req.user!.id

  const [userRes, contribRes, savingsRes, weeklyRes] = await Promise.all([
    // User stats
    pool.query(
      `SELECT id, name, points, level FROM users WHERE id = $1`,
      [userId]
    ),
    // Contribution totals
    pool.query(
      `SELECT
         COUNT(*)::int                                         AS total_contributions,
         COUNT(*) FILTER (WHERE status = 'approved')::int     AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int     AS rejected,
         COUNT(*) FILTER (WHERE status = 'pending')::int      AS pending,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS this_week
       FROM contributions
       WHERE user_id = $1`,
      [userId]
    ),
    // Estimated savings: compare avg price vs cheapest price for items in user lists
    pool.query(
      `SELECT
         COALESCE(
           SUM(
             (avg_p.avg_value - min_p.min_value) * li.quantity
           ), 0
         )::numeric(10,2) AS estimated_savings
       FROM list_items li
       JOIN lists l ON l.id = li.list_id AND l.user_id = $1
       JOIN (
         SELECT product_id, AVG(value) AS avg_value
         FROM prices WHERE status = 'approved'
         GROUP BY product_id
       ) avg_p ON avg_p.product_id = li.product_id
       JOIN (
         SELECT product_id, MIN(value) AS min_value
         FROM prices WHERE status = 'approved'
         GROUP BY product_id
       ) min_p ON min_p.product_id = li.product_id`,
      [userId]
    ),
    // Weekly contribution trend (last 4 weeks)
    pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('week', created_at), 'DD/MM') AS week_start,
         COUNT(*)::int                                     AS contributions
       FROM contributions
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '28 days'
       GROUP BY DATE_TRUNC('week', created_at)
       ORDER BY DATE_TRUNC('week', created_at) ASC`,
      [userId]
    ),
  ])

  // Badges
  const { rows: badges } = await pool.query(
    `SELECT badge_type, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at DESC`,
    [userId]
  )

  res.json({
    user: userRes.rows[0],
    contributions: contribRes.rows[0],
    estimated_savings: savingsRes.rows[0]?.estimated_savings ?? 0,
    weekly_trend: weeklyRes.rows,
    badges,
  })
}))

// GET /analytics/prices?product_id=<uuid>&period=30d — price variation over time
router.get('/prices', authUser, wrap(async (req, res) => {
  const { product_id, period } = req.query

  if (!product_id) return res.status(400).json({ error: 'product_id é obrigatório' })

  const intervalMap: Record<string, string> = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    '1y': '1 year',
  }
  const interval = intervalMap[String(period)] ?? '30 days'

  const { rows } = await pool.query(
    `SELECT
       DATE_TRUNC('day', pr.registered_at)::date AS day,
       ROUND(AVG(pr.value)::numeric, 2)           AS avg_price,
       MIN(pr.value)                              AS min_price,
       MAX(pr.value)                              AS max_price,
       COUNT(pr.id)::int                          AS data_points
     FROM prices pr
     WHERE pr.product_id = $1
       AND pr.status      = 'approved'
       AND pr.registered_at > NOW() - $2::interval
     GROUP BY DATE_TRUNC('day', pr.registered_at)
     ORDER BY day ASC`,
    [product_id, interval]
  )

  // Also return current cheapest market
  const { rows: marketRows } = await pool.query(
    `SELECT DISTINCT ON (p.market_id)
       p.value, m.id AS market_id, m.name AS market_name, m.city
     FROM prices p
     JOIN markets m ON m.id = p.market_id
     WHERE p.product_id = $1 AND p.status = 'approved'
     ORDER BY p.market_id, p.registered_at DESC`,
    [product_id]
  )
  marketRows.sort((a, b) => Number(a.value) - Number(b.value))

  res.json({
    trend: rows,
    markets: marketRows,
    cheapest: marketRows[0] ?? null,
  })
}))

// ─── Partner routes ───────────────────────────────────────────────────────────

// GET /analytics/markets — competitive intelligence for the partner
router.get('/markets', requireRole('partner'), wrap(async (req, res) => {
  // Identify which market this partner owns
  const { rows: [partnerMarket] } = await pool.query(
    `SELECT market_id FROM users WHERE id = $1`,
    [req.user!.id]
  )
  if (!partnerMarket?.market_id) {
    return res.status(400).json({ error: 'Parceiro sem mercado associado' })
  }
  const marketId = partnerMarket.market_id

  const [rankingRes, competitorsRes, trendsRes] = await Promise.all([
    // Overall competitiveness ranking (average price vs others)
    pool.query(
      `SELECT
         m.id,
         m.name,
         m.city,
         ROUND(AVG(p.value)::numeric, 2) AS avg_price,
         COUNT(DISTINCT p.product_id)    AS product_count,
         RANK() OVER (ORDER BY AVG(p.value) ASC)::int AS price_rank
       FROM markets m
       JOIN prices p ON p.market_id = m.id AND p.status = 'approved'
       GROUP BY m.id, m.name, m.city
       ORDER BY avg_price ASC`
    ),
    // Products where this market is not the cheapest (opportunities)
    pool.query(
      `SELECT
         p.name                           AS product_name,
         pr_own.value                     AS our_price,
         MIN(pr_others.value)             AS cheapest_price,
         m_cheap.name                     AS cheapest_market,
         ROUND(
           ((pr_own.value - MIN(pr_others.value)) / pr_own.value * 100)::numeric, 1
         )                                AS gap_pct
       FROM prices pr_own
       JOIN products p ON p.id = pr_own.product_id
       JOIN prices pr_others
         ON pr_others.product_id = p.id
        AND pr_others.market_id != $1
        AND pr_others.status     = 'approved'
       LEFT JOIN LATERAL (
         SELECT m.name FROM prices px
         JOIN markets m ON m.id = px.market_id
         WHERE px.product_id = p.id AND px.market_id != $1 AND px.status = 'approved'
         ORDER BY px.value ASC LIMIT 1
       ) m_cheap ON true
       WHERE pr_own.market_id = $1 AND pr_own.status = 'approved'
       GROUP BY p.name, pr_own.value, m_cheap.name
       HAVING pr_own.value > MIN(pr_others.value)
       ORDER BY gap_pct DESC
       LIMIT 20`,
      [marketId]
    ),
    // Price trend for top products in this market (last 30 days)
    pool.query(
      `SELECT
         p.name                                AS product_name,
         DATE_TRUNC('week', pr.registered_at)::date AS week,
         ROUND(AVG(pr.value)::numeric, 2)      AS avg_price
       FROM prices pr
       JOIN products p ON p.id = pr.product_id
       WHERE pr.market_id   = $1
         AND pr.status      = 'approved'
         AND pr.registered_at > NOW() - INTERVAL '30 days'
       GROUP BY p.name, DATE_TRUNC('week', pr.registered_at)
       ORDER BY p.name, week ASC`,
      [marketId]
    ),
  ])

  res.json({
    my_market_id: marketId,
    ranking: rankingRes.rows,
    opportunities: competitorsRes.rows,
    trends: trendsRes.rows,
  })
}))

export default router
