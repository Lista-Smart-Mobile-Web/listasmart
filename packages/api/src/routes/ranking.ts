import { Router } from 'express'
import pool from '../db'
import { authUser } from '../middleware/auth'
import { wrap } from '../middleware/asyncWrap'

const router = Router()

router.get('/', authUser, wrap(async (req, res) => {
  const userId = req.user!.id

  const { rows: leaderboard } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.level,
       COUNT(c.id)::int                    AS contributions_this_week,
       COALESCE(SUM(c.points), 0)::int     AS points_this_week,
       RANK() OVER (
         ORDER BY COUNT(c.id) DESC, COALESCE(SUM(c.points), 0) DESC
       )::int                              AS rank
     FROM users u
     LEFT JOIN contributions c
       ON c.user_id    = u.id
      AND c.status     = 'approved'
      AND c.created_at >= DATE_TRUNC('week', NOW())
     WHERE u.role = 'consumer'
     GROUP BY u.id, u.name, u.level
     ORDER BY rank ASC
     LIMIT 50`
  )

  // User's own rank: count how many consumer users beat them this week
  const { rows: [me] } = await pool.query(
    `WITH my_week AS (
       SELECT COUNT(c.id) AS cnt
       FROM contributions c
       WHERE c.user_id = $1
         AND c.status = 'approved'
         AND c.created_at >= DATE_TRUNC('week', NOW())
     ),
     beats AS (
       SELECT COUNT(DISTINCT u2.id)::int AS ahead
       FROM users u2
       LEFT JOIN contributions c2
         ON c2.user_id    = u2.id
        AND c2.status     = 'approved'
        AND c2.created_at >= DATE_TRUNC('week', NOW())
       WHERE u2.role = 'consumer'
         AND u2.id  != $1
       GROUP BY u2.id
       HAVING COUNT(c2.id) > (SELECT cnt FROM my_week)
     )
     SELECT
       u.id,
       u.name,
       u.level,
       u.points                             AS total_points,
       (SELECT COUNT(c.id)::int
          FROM contributions c
          WHERE c.user_id = u.id
            AND c.status = 'approved'
            AND c.created_at >= DATE_TRUNC('week', NOW()))
                                             AS contributions_this_week,
       (SELECT COALESCE(SUM(c.points), 0)::int
          FROM contributions c
          WHERE c.user_id = u.id
            AND c.status = 'approved'
            AND c.created_at >= DATE_TRUNC('week', NOW()))
                                             AS points_this_week,
       COALESCE((SELECT ahead FROM beats LIMIT 1), 0) + 1
                                             AS rank
     FROM users u
     WHERE u.id = $1`,
    [userId]
  )

  res.json({ leaderboard, me: me ?? null })
}))

export default router
