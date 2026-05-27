import pool from '../db'
import { deductPoints } from './pointsService'

const LEVELS_VERIFIED_PLUS = ['verificado', 'especialista', 'embaixador']
const PEER_CONFIRMATIONS_NEEDED = 2
const HISTORICAL_SAMPLE = 20     // how many past prices to sample
const MIN_SAMPLE_FOR_VALIDATION = 3  // need at least 3 prices to run interval check
const MAX_DEVIATION = 0.50       // ±50% of historical average

type ValidationResult = 'approved' | 'rejected' | 'pending'

export async function evaluateContribution(contributionId: string): Promise<ValidationResult> {
  const { rows: [contribution] } = await pool.query(
    `SELECT c.*, u.level AS user_level, u.id AS user_id
     FROM contributions c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [contributionId]
  )
  if (!contribution) return 'pending'

  // ── Rule 1: Spam guard (checked before insert in the route, but double-check here) ─────────
  // Already enforced at route level — skip duplicate check

  // ── Rule 2: Historical price interval check (±50% of avg) ────────────────────────────────
  const { rows: historical } = await pool.query<{ value: string }>(
    `SELECT value FROM prices
     WHERE product_id = $1 AND market_id = $2 AND status = 'approved'
     ORDER BY registered_at DESC
     LIMIT $3`,
    [contribution.product_id, contribution.market_id, HISTORICAL_SAMPLE]
  )

  if (historical.length >= MIN_SAMPLE_FOR_VALIDATION) {
    const avg =
      historical.reduce((sum, r) => sum + Number(r.value), 0) / historical.length
    const deviation = Math.abs(Number(contribution.price) - avg) / avg

    if (deviation > MAX_DEVIATION) {
      await pool.query(`UPDATE contributions SET status = 'rejected' WHERE id = $1`, [contributionId])
      await pool.query(
        `UPDATE prices SET status = 'rejected'
         WHERE product_id = $1 AND market_id = $2 AND value = $3 AND status = 'pending'`,
        [contribution.product_id, contribution.market_id, contribution.price]
      )
      // Deduct points penalty
      await deductPoints(contribution.user_id)
      return 'rejected'
    }
  }

  // ── Rule 3: Peer confirmation for Verificado+ users ──────────────────────────────────────
  // Price range window: ±10% of the submitted price counts as a "confirmation"
  if (LEVELS_VERIFIED_PLUS.includes(contribution.user_level)) {
    const { rows: [{ count }] } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM contributions
       WHERE product_id = $1
         AND market_id  = $2
         AND price BETWEEN ($3 * 0.90) AND ($3 * 1.10)
         AND user_id   != $4
         AND type       = 'confirm'
         AND created_at > NOW() - INTERVAL '7 days'`,
      [contribution.product_id, contribution.market_id, contribution.price, contribution.user_id]
    )
    if (Number(count) < PEER_CONFIRMATIONS_NEEDED) {
      // Leave as 'pending' — will re-evaluate when confirmations arrive
      return 'pending'
    }
  }

  // ── Approve ──────────────────────────────────────────────────────────────────────────────
  await pool.query(`UPDATE contributions SET status = 'approved' WHERE id = $1`, [contributionId])
  await pool.query(
    `UPDATE prices SET status = 'approved'
     WHERE product_id = $1 AND market_id = $2 AND value = $3 AND status = 'pending'`,
    [contribution.product_id, contribution.market_id, contribution.price]
  )
  return 'approved'
}

// Re-evaluate all pending contributions for a given product+market
// Called when a new 'confirm' type contribution arrives
export async function reEvaluatePending(productId: string, marketId: string) {
  const { rows: pending } = await pool.query(
    `SELECT id FROM contributions
     WHERE product_id = $1 AND market_id = $2 AND status = 'pending'`,
    [productId, marketId]
  )
  for (const row of pending) {
    await evaluateContribution(row.id)
  }
}
