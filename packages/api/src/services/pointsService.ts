import pool from '../db'

// Points per contribution type (context.md)
const POINTS_MAP: Record<string, number> = {
  qr_code: 30,
  manual: 10,
  confirm: 5,
}
const REJECTION_PENALTY = 15
const STREAK_BONUS = 50
const STREAK_DAYS = 7

// Level thresholds (context.md): iniciante 0-49, colaborador 50-199, verificado 200-499, especialista 500-999, embaixador 1000+
const LEVELS = ['iniciante', 'colaborador', 'verificado', 'especialista', 'embaixador'] as const
const THRESHOLDS = [0, 50, 200, 500, 1000]

function resolveLevel(points: number): typeof LEVELS[number] {
  let level: typeof LEVELS[number] = LEVELS[0]
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (points >= THRESHOLDS[i]) level = LEVELS[i]
  }
  return level
}

// Returns true if the user contributed on each of the last (STREAK_DAYS - 1) calendar days
async function checkStreak(userId: string): Promise<boolean> {
  const { rows } = await pool.query<{ day: Date }>(
    `SELECT DISTINCT DATE(created_at AT TIME ZONE 'America/Sao_Paulo') AS day
     FROM contributions
     WHERE user_id = $1
       AND status != 'rejected'
       AND created_at >= NOW() - INTERVAL '7 days'
     ORDER BY day DESC`,
    [userId]
  )
  if (rows.length < STREAK_DAYS) return false

  const today = new Date()
  for (let i = 1; i < STREAK_DAYS; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    const found = rows.some((r) => {
      const d = new Date(r.day)
      return d.toISOString().split('T')[0] === expectedStr
    })
    if (!found) return false
  }
  return true
}

async function updateLevel(userId: string, newPoints: number) {
  const newLevel = resolveLevel(newPoints)
  await pool.query(`UPDATE users SET level = $1 WHERE id = $2`, [newLevel, userId])
  return newLevel
}

async function grantBadge(userId: string, badgeType: string) {
  await pool.query(
    `INSERT INTO badges (user_id, badge_type)
     VALUES ($1, $2)
     ON CONFLICT (user_id, badge_type) DO UPDATE SET earned_at = NOW()`,
    [userId, badgeType]
  )
}

export async function awardPoints(
  userId: string,
  type: 'qr_code' | 'manual' | 'confirm'
): Promise<{ points: number; level: string; streakBonus: number; earned: number }> {
  const pts = POINTS_MAP[type] ?? 0

  // Check 7-day streak before committing today's contribution
  const hasStreak = await checkStreak(userId)
  const streakBonus = hasStreak ? STREAK_BONUS : 0

  const totalDelta = pts + streakBonus
  const { rows } = await pool.query<{ points: number }>(
    `UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points`,
    [totalDelta, userId]
  )
  const newPoints = rows[0].points
  const newLevel = await updateLevel(userId, newPoints)

  if (hasStreak) {
    await grantBadge(userId, '7 dias seguidos')
  }

  // Badge: Preços confiáveis — 10 contribuições aprovadas
  const { rows: contribRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM contributions WHERE user_id = $1 AND status = 'approved'`,
    [userId]
  )
  const approvedCount = Number(contribRows[0].count)
  if (approvedCount >= 10) await grantBadge(userId, 'Preços confiáveis')
  if (approvedCount >= 50) await grantBadge(userId, 'Especialista regional')

  return { points: newPoints, level: newLevel, streakBonus, earned: totalDelta }
}

// Called when a contribution is rejected — deducts penalty
export async function deductPoints(userId: string): Promise<{ points: number; level: string }> {
  const { rows } = await pool.query<{ points: number }>(
    // Floor at 0 — users can't go negative
    `UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2 RETURNING points`,
    [REJECTION_PENALTY, userId]
  )
  const newPoints = rows[0].points
  const newLevel = await updateLevel(userId, newPoints)
  return { points: newPoints, level: newLevel }
}
