import pool from '../db'

const LEVELS = ['iniciante', 'colaborador', 'verificado', 'especialista', 'embaixador'] as const
const THRESHOLDS = [0, 100, 500, 1500, 5000]

const POINTS_MAP: Record<string, number> = {
  qr_code: 10,
  manual: 5,
  confirm: 2,
}

function resolveLevel(points: number): string {
  let level = LEVELS[0]
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (points >= THRESHOLDS[i]) level = LEVELS[i]
  }
  return level
}

export async function awardPoints(userId: string, type: 'qr_code' | 'manual' | 'confirm') {
  const pts = POINTS_MAP[type] ?? 0
  const { rows } = await pool.query<{ points: number }>(
    `UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points`,
    [pts, userId]
  )
  const newPoints = rows[0].points
  const newLevel = resolveLevel(newPoints)
  await pool.query(`UPDATE users SET level = $1 WHERE id = $2`, [newLevel, userId])
  return { points: newPoints, level: newLevel }
}
