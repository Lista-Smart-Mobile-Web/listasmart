import dotenv from 'dotenv'
import path from 'path'

// Prefer a local .env; if absent, walk up to the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()   // picks up packages/api/.env if it exists (overrides)

import app from './app'

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
