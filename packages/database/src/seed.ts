import { Pool } from 'pg'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  // Mercados
  await pool.query(`
    INSERT INTO markets (name, address, city, cnpj, lat, lng) VALUES
      ('Atacadão Vila Madalena',    'R. Augusta, 1890',      'São Paulo', '00.000.000/0001-00', -23.5505, -46.6333),
      ('Extra Hiper Pinheiros',     'Av. Rebouças, 3970',    'São Paulo', '00.000.000/0002-00', -23.5629, -46.6544),
      ('Pão de Açúcar Jardins',     'Al. Lorena, 1100',      'São Paulo', '00.000.000/0003-00', -23.5711, -46.6532),
      ('Carrefour Faria Lima',      'Av. Faria Lima, 4300',  'São Paulo', '00.000.000/0004-00', -23.5676, -46.6924)
    ON CONFLICT DO NOTHING
  `)

  // Produtos
  await pool.query(`
    INSERT INTO products (name, category, barcode, unit) VALUES
      ('Arroz Camil 5kg',           'Grãos',      '7896006709406', 'kg'),
      ('Feijão Carioca Kicaldo 1kg','Grãos',      '7896004400678', 'kg'),
      ('Leite Integral Italac 1L',  'Laticínios', '7898949971029', 'L'),
      ('Frango Peito s/Osso 1kg',   'Carnes',      NULL,           'kg'),
      ('Ovos Caipira 12un',         'Ovos',        NULL,           'dúzia'),
      ('Óleo de Soja Liza 900ml',   'Óleos',      '7894000090016', 'ml'),
      ('Açúcar Cristal União 1kg',  'Mercearia',  '7891910000197', 'kg')
    ON CONFLICT DO NOTHING
  `)

  console.log('✓ Seed inserido com sucesso')
  await pool.end()
}

seed().catch((err) => {
  console.error('✗ Erro no seed:', err)
  process.exit(1)
})
