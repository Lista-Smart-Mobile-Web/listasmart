import { Router } from 'express'
import pool from '../db'
import { wrap } from '../middleware/asyncWrap'
import { authUser } from '../middleware/auth'

const router = Router()

// GET /prices/compare?product_id=<uuid>&list_id=<uuid>&lat=<num>&lng=<num>&radius=<km>
router.get('/compare', (req, res, next) => {
  if (req.query.list_id) {
    return authUser(req, res, next)
  }
  next()
}, wrap(async (req, res) => {
  const { product_id, list_id, lat, lng, radius } = req.query

  if (!product_id && !list_id) {
    return res.status(400).json({ error: 'product_id ou list_id é obrigatório' })
  }

  const useGeo = lat !== undefined && lng !== undefined
  const radiusKm = Number(radius) || 10

  if (useGeo && (isNaN(Number(lat)) || isNaN(Number(lng)))) {
    return res.status(400).json({ error: 'lat e lng devem ser números válidos' })
  }

  // --- CASE 1: Compare products in a List ---
  if (list_id) {
    // 1. Verify list ownership
    const { rows: [list] } = await pool.query(
      `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
      [list_id, req.user!.id]
    )
    if (!list) {
      return res.status(404).json({ error: 'Lista não encontrada' })
    }

    // 2. Fetch all products and quantities in the list
    const { rows: productsInList } = await pool.query(
      `SELECT li.product_id, p.name, li.quantity
       FROM list_items li
       JOIN products p ON p.id = li.product_id
       WHERE li.list_id = $1`,
      [list_id]
    )

    if (productsInList.length === 0) {
      return res.json([])
    }

    // 3. Fetch markets in range
    let markets: any[]
    if (useGeo) {
      const { rows: result } = await pool.query(
        `SELECT 
           m.id, 
           m.name, 
           m.lat, 
           m.lng,
           (6371 * acos(
             LEAST(1.0,
               cos(radians($1)) * cos(radians(m.lat)) *
               cos(radians(m.lng) - radians($2)) +
               sin(radians($1)) * sin(radians(m.lat))
             )
           )) AS distance_km
         FROM markets m
         WHERE (6371 * acos(
           LEAST(1.0,
             cos(radians($1)) * cos(radians(m.lat)) *
             cos(radians(m.lng) - radians($2)) +
             sin(radians($1)) * sin(radians(m.lat))
           )
         )) <= $3`,
        [Number(lat), Number(lng), radiusKm]
      )
      markets = result
    } else {
      const { rows: result } = await pool.query(
        `SELECT id, name, lat, lng FROM markets`
      )
      markets = result
    }

    if (markets.length === 0) {
      return res.json([])
    }

    // 4. Fetch the latest approved prices for these products
    const productIds = productsInList.map((p) => p.product_id)
    const { rows: prices } = await pool.query(
      `SELECT DISTINCT ON (p.product_id, p.market_id)
         p.product_id,
         p.market_id,
         p.value AS price
       FROM prices p
       WHERE p.status = 'approved' AND p.product_id = ANY($1)
       ORDER BY p.product_id, p.market_id, p.registered_at DESC`,
      [productIds]
    )

    // Calculate product stats
    const productStats: Record<string, { avgPrice: number; minPrice: number; name: string }> = {}
    for (const prod of productsInList) {
      const prodPrices = prices
        .filter((p: any) => p.product_id === prod.product_id)
        .map((p: any) => Number(p.price))

      if (prodPrices.length > 0) {
        const sum = prodPrices.reduce((a, b) => a + b, 0)
        const avg = sum / prodPrices.length
        const min = Math.min(...prodPrices)
        productStats[prod.product_id] = { avgPrice: avg, minPrice: min, name: prod.name }
      } else {
        productStats[prod.product_id] = { avgPrice: 0, minPrice: 0, name: prod.name }
      }
    }

    // Map prices: marketId -> productId -> price
    const priceMap: Record<string, Record<string, number>> = {}
    for (const p of prices) {
      if (!priceMap[p.market_id]) {
        priceMap[p.market_id] = {}
      }
      priceMap[p.market_id][p.product_id] = Number(p.price)
    }

    // Build comparison results
    const comparisons = markets
      .map((m: any) => {
        let totalPrice = 0
        let matchedCount = 0
        const items: any[] = []

        for (const prod of productsInList) {
          const marketPrice = priceMap[m.id]?.[prod.product_id]
          const stats = productStats[prod.product_id]

          const priceToUse = marketPrice !== undefined ? marketPrice : stats.avgPrice
          totalPrice += priceToUse * Number(prod.quantity)

          if (marketPrice !== undefined) {
            matchedCount++
          }

          items.push({
            productId: prod.product_id,
            productName: prod.name,
            price: priceToUse,
            isLowest: marketPrice !== undefined && marketPrice === stats.minPrice && marketPrice > 0,
            isEstimated: marketPrice === undefined,
          })
        }

        // If market has no prices registered for any list product, skip it
        if (matchedCount === 0) return null

        return {
          marketId: m.id,
          marketName: m.name,
          distance: m.distance_km !== undefined ? Number(Number(m.distance_km).toFixed(2)) : undefined,
          totalPrice: Number(totalPrice.toFixed(2)),
          savings: 0,
          savingsPercent: 0,
          items: items.map(item => ({
            ...item,
            price: Number(item.price.toFixed(2))
          })),
        }
      })
      .filter((c: any) => c !== null) as any[]

    if (comparisons.length > 0) {
      const maxPrice = Math.max(...comparisons.map((c) => c.totalPrice))
      for (const comp of comparisons) {
        comp.savings = Number((maxPrice - comp.totalPrice).toFixed(2))
        comp.savingsPercent = maxPrice > 0 ? Number(((comp.savings / maxPrice) * 100).toFixed(2)) : 0
      }
      comparisons.sort((a, b) => a.totalPrice - b.totalPrice)
    }

    return res.json(comparisons)
  }

  // --- CASE 2: Compare a single product (Original Logic) ---
  let rows: unknown[]

  if (useGeo) {
    const { rows: result } = await pool.query(
      `SELECT DISTINCT ON (p.market_id)
         p.id, p.value, p.registered_at,
         m.id   AS market_id,   m.name AS market_name,
         m.address, m.city,     m.lat,  m.lng,
         (6371 * acos(
           LEAST(1.0,
             cos(radians($2)) * cos(radians(m.lat)) *
             cos(radians(m.lng) - radians($3)) +
             sin(radians($2)) * sin(radians(m.lat))
           )
         )) AS distance_km
       FROM prices p
       JOIN markets m ON m.id = p.market_id
       WHERE p.product_id = $1
         AND p.status     = 'approved'
         AND (6371 * acos(
               LEAST(1.0,
                 cos(radians($2)) * cos(radians(m.lat)) *
                 cos(radians(m.lng) - radians($3)) +
                 sin(radians($2)) * sin(radians(m.lat))
               )
             )) <= $4
       ORDER BY p.market_id, p.registered_at DESC`,
      [product_id, Number(lat), Number(lng), radiusKm]
    )
    rows = result
  } else {
    const { rows: result } = await pool.query(
      `SELECT DISTINCT ON (p.market_id)
         p.id, p.value, p.registered_at,
         m.id   AS market_id,   m.name AS market_name,
         m.address, m.city,     m.lat,  m.lng
       FROM prices p
       JOIN markets m ON m.id = p.market_id
       WHERE p.product_id = $1 AND p.status = 'approved'
       ORDER BY p.market_id, p.registered_at DESC`,
      [product_id]
    )
    rows = result
  }

  rows.sort((a: any, b: any) => Number(a.value) - Number(b.value))
  res.json(rows)
}))

export default router
