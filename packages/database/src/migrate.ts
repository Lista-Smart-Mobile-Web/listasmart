import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function migrate() {
  const client = await pool.connect()

  try {
    // Garante que a tabela de controle existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMP   NOT NULL DEFAULT NOW()
      )
    `)

    // Lê todos os arquivos .sql ordenados por nome
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('Nenhum arquivo de migration encontrado em', MIGRATIONS_DIR)
      return
    }

    let applied = 0
    let skipped = 0

    for (const file of files) {
      const version = file.replace('.sql', '')

      // Verifica se já foi aplicada
      const { rows } = await client.query(
        `SELECT version FROM schema_migrations WHERE version = $1`,
        [version]
      )

      if (rows.length > 0) {
        console.log(`  ⏭  ${file} (já aplicada)`)
        skipped++
        continue
      }

      // Lê e executa o SQL dentro de uma transação
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          `INSERT INTO schema_migrations (version) VALUES ($1)`,
          [version]
        )
        await client.query('COMMIT')
        console.log(`  ✓  ${file}`)
        applied++
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log(`\n✅ Migrations concluídas — ${applied} aplicadas, ${skipped} ignoradas`)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('\n✗ Erro nas migrations:', err.message)
  process.exit(1)
})
