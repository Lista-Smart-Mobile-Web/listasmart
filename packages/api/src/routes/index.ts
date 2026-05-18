import { Router } from 'express'
import auth from './auth'
import users from './users'
import lists from './lists'
import products from './products'
import prices from './prices'
import contributions from './contributions'
import markets from './markets'
import ranking from './ranking'
import analytics from './analytics'
import leads from './leads'

const router = Router()

router.use('/auth', auth)
router.use('/users', users)
router.use('/lists', lists)
router.use('/products', products)
router.use('/prices', prices)
router.use('/contributions', contributions)
router.use('/markets', markets)
router.use('/ranking', ranking)
router.use('/analytics', analytics)
router.use('/leads', leads)

export default router
