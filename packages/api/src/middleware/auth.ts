import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as any
    req.user = { id: payload.id, email: payload.email, role: payload.role }
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function requireRole(role: 'consumer' | 'partner') {
  return (req: Request, res: Response, next: NextFunction) => {
    authUser(req, res, () => {
      if (req.user?.role !== role) {
        return res.status(403).json({ error: 'Acesso não autorizado para este perfil' })
      }
      next()
    })
  }
}
