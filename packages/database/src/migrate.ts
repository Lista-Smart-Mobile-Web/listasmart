import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(sql)
  console.log('✓ Migrations rodadas com sucesso')
  await pool.end()
}

migrate().catch((err) => {
  console.error('✗ Erro nas migrations:', err)
  process.exit(1)
})
