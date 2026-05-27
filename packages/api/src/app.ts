import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import routes from './routes'

const app = express()

// ── CORS ──────────────────────────────────────────────────────────────────────
// Em dev aceita qualquer origem; em prod restringe à CORS_ORIGIN configurada
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:8081']

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (curl, Postman, apps mobile nativos)
      if (!origin) return callback(null, true)
      if (process.env.NODE_ENV !== 'production') return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS: origem não permitida — ${origin}`))
    },
    credentials: true,
  })
)

// Permite que browsers (Chrome ≥94) acessem localhost a partir de origens externas (Private Network Access)
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true')
  next()
})

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(morgan('dev'))        // loga cada request: método, rota, status, tempo
app.use(express.json())
app.use(cookieParser())

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/api/v1', routes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message ?? err)
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ error: err.message })
  }
  res.status(500).json({ error: 'Erro interno do servidor' })
})

export default app
