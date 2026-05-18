import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as any
    req.user = { id: payload.id, email: payload.email }
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function authPartner(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.partner_token
  if (!token) return res.status(401).json({ error: 'Não autenticado' })
  try {
    jwt.verify(token, process.env.JWT_PARTNER_SECRET!)
    next()
  } catch {
    res.status(401).json({ error: 'Sessão expirada' })
  }
}
