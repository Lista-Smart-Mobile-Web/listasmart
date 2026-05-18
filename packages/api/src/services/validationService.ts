import pool from '../db'

const APPROVAL_THRESHOLD = 3
const REJECTION_THRESHOLD = 3

export async function evaluateContribution(contributionId: string) {
  const { rows: [contribution] } = await pool.query(
    `SELECT * FROM contributions WHERE id = $1`,
    [contributionId]
  )
  if (!contribution) return

  const { rows: recent } = await pool.query(
    `SELECT value FROM prices
     WHERE product_id = $1 AND market_id = $2
     ORDER BY registered_at DESC LIMIT 10`,
    [contribution.product_id, contribution.market_id]
  )

  if (recent.length < APPROVAL_THRESHOLD) return

  const avg = recent.reduce((s: number, r: any) => s + Number(r.value), 0) / recent.length
  const deviation = Math.abs(contribution.price - avg) / avg

  const status = deviation < 0.3 ? 'approved' : 'rejected'

  await pool.query(
    `UPDATE contributions SET status = $1 WHERE id = $2`,
    [status, contributionId]
  )

  if (status === 'approved') {
    await pool.query(
      `UPDATE prices SET status = 'approved'
       WHERE product_id = $1 AND market_id = $2 AND value = $3 AND status = 'pending'`,
      [contribution.product_id, contribution.market_id, contribution.price]
    )
  }

  return status
}
