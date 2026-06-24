import { Pool } from 'pg'
import path from 'path'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  console.log('⏳ Iniciando seed...')

  // ─── Markets ─────────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO markets (id, name, address, city, cnpj, lat, lng) VALUES
      ('a1000000-0000-0000-0000-000000000001', 'Atacadão Vila Madalena',  'R. Augusta, 1890',      'São Paulo', '00.000.000/0001-00', -23.5505, -46.6333),
      ('a1000000-0000-0000-0000-000000000002', 'Extra Hiper Pinheiros',   'Av. Rebouças, 3970',    'São Paulo', '00.000.000/0002-00', -23.5629, -46.6544),
      ('a1000000-0000-0000-0000-000000000003', 'Pão de Açúcar Jardins',   'Al. Lorena, 1100',      'São Paulo', '00.000.000/0003-00', -23.5711, -46.6532),
      ('a1000000-0000-0000-0000-000000000004', 'Carrefour Faria Lima',    'Av. Faria Lima, 4300',  'São Paulo', '00.000.000/0004-00', -23.5676, -46.6924),
      ('a1000000-0000-0000-0000-000000000005', 'Mercadinho Bela Vista',   'R. 13 de Maio, 450',    'São Paulo', '00.000.000/0005-00', -23.5601, -46.6469)
    ON CONFLICT (id) DO NOTHING
  `)
  console.log('  ✓ Mercados inseridos')

  // ─── Products ────────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO products (id, name, category, barcode, unit) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'Arroz Camil 5kg',             'Grãos',       '7896006709406', 'kg'),
      ('b1000000-0000-0000-0000-000000000002', 'Feijão Carioca Kicaldo 1kg',  'Grãos',       '7896004400678', 'kg'),
      ('b1000000-0000-0000-0000-000000000003', 'Leite Integral Italac 1L',    'Laticínios',  '7898949971029', 'L'),
      ('b1000000-0000-0000-0000-000000000004', 'Frango Peito s/Osso 1kg',     'Carnes',      NULL,            'kg'),
      ('b1000000-0000-0000-0000-000000000005', 'Ovos Caipira 12un',           'Ovos',        NULL,            'dúzia'),
      ('b1000000-0000-0000-0000-000000000006', 'Óleo de Soja Liza 900ml',     'Óleos',       '7894000090016', 'ml'),
      ('b1000000-0000-0000-0000-000000000007', 'Açúcar Cristal União 1kg',    'Mercearia',   '7891910000197', 'kg'),
      ('b1000000-0000-0000-0000-000000000008', 'Macarrão Barilla 500g',       'Mercearia',   '8076800195057', 'g'),
      ('b1000000-0000-0000-0000-000000000009', 'Molho de Tomate Heinz 340g',  'Condimentos', '7894000011714', 'g'),
      ('b1000000-0000-0000-0000-000000000010', 'Manteiga Aviação 200g',       'Laticínios',  '7891962008270', 'g'),
      ('b1000000-0000-0000-0000-000000000011', 'Café Pelé 500g',              'Bebidas',     '7896004802021', 'g'),
      ('b1000000-0000-0000-0000-000000000012', 'Detergente Ypê 500ml',        'Limpeza',     '7896098900023', 'ml'),
      ('b1000000-0000-0000-0000-000000000013', 'Sabão em Pó Omo 1kg',        'Limpeza',     '7891150011329', 'kg'),
      ('b1000000-0000-0000-0000-000000000014', 'Iogurte Natural Danone 160g', 'Laticínios',  '7891025115765', 'g'),
      ('b1000000-0000-0000-0000-000000000015', 'Banana Prata (kg)',           'Frutas',      NULL,            'kg')
    ON CONFLICT (id) DO NOTHING
  `)
  console.log('  ✓ Produtos inseridos')

  // ─── Users ───────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('senha123', 10)
  const hashAdmin = await bcrypt.hash('admin123', 10)

  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, points, level) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'Maria Fernanda',  'maria@example.com',   '${hash}',      'consumer', 380,  'colaborador'),
      ('c1000000-0000-0000-0000-000000000002', 'João Carlos',     'joao@example.com',    '${hash}',      'consumer', 260,  'colaborador'),
      ('c1000000-0000-0000-0000-000000000003', 'Ana Souza',       'ana@example.com',     '${hash}',      'consumer', 190,  'iniciante'),
      ('c1000000-0000-0000-0000-000000000004', 'Carlos Lima',     'carlos@example.com',  '${hash}',      'consumer', 120,  'iniciante'),
      ('c1000000-0000-0000-0000-000000000005', 'Teste Dev',       'dev@listasmart.com',  '${hash}',      'consumer', 1500, 'embaixador'),
      ('c1000000-0000-0000-0000-000000000006', 'Pedro Costa',     'pedro@example.com',   '${hash}',      'consumer', 850,  'especialista'),
      ('c1000000-0000-0000-0000-000000000007', 'Juliana Silva',   'juliana@example.com', '${hash}',      'consumer', 600,  'especialista'),
      ('c1000000-0000-0000-0000-000000000008', 'Lucas Martins',   'lucas@example.com',   '${hash}',      'consumer', 450,  'verificado'),
      ('c1000000-0000-0000-0000-000000000009', 'Fernanda Lima',   'fernanda@example.com','${hash}',      'consumer', 310,  'verificado'),
      ('c1000000-0000-0000-0000-000000000011', 'Rafael Rocha',    'rafael@example.com',  '${hash}',      'consumer', 210,  'verificado'),
      ('c1000000-0000-0000-0000-000000000012', 'Bruna Gomes',     'bruna@example.com',   '${hash}',      'consumer', 80,   'iniciante')
    ON CONFLICT (id) DO UPDATE SET points = EXCLUDED.points, level = EXCLUDED.level
  `)

  // Partner user linked to Atacadão
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, market_id) VALUES
      ('c1000000-0000-0000-0000-000000000010', 'Parceiro Atacadão', 'parceiro@atacadao.com', '${hashAdmin}', 'partner', 'a1000000-0000-0000-0000-000000000001')
    ON CONFLICT (id) DO NOTHING
  `)
  console.log('  ✓ Usuários inseridos')

  // ─── Prices (realistic SP supermarket prices, May 2026) ──────────────────────
  // Arroz 5kg
  await pool.query(`
    INSERT INTO prices (product_id, market_id, value, source, status, registered_at) VALUES
      ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001', 22.90,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002', 24.99,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000003', 27.50,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000004', 23.80,'manual','approved', NOW() - INTERVAL '4 days'),
      ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000005', 25.90,'manual','approved', NOW() - INTERVAL '2 days'),
    -- Feijão 1kg
      ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001',  6.49,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000002',  7.20,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000003',  7.89,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000004',  6.99,'manual','approved', NOW() - INTERVAL '1 day'),
    -- Leite 1L
      ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000001',  4.29,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002',  4.59,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003',  4.99,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000004',  4.39,'qr_code','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000005',  4.69,'manual','approved', NOW() - INTERVAL '2 days'),
    -- Frango 1kg
      ('b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000001', 14.90,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000002', 16.50,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000003', 18.99,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004', 15.80,'qr_code','approved', NOW() - INTERVAL '3 days'),
    -- Ovos 12un
      ('b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000001', 12.90,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000002', 13.99,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000003', 15.50,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000005', 13.20,'manual','approved', NOW() - INTERVAL '1 day'),
    -- Óleo 900ml
      ('b1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000001',  7.49,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000002',  8.20,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000003',  8.99,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000004',  7.89,'qr_code','approved', NOW() - INTERVAL '2 days'),
    -- Açúcar 1kg
      ('b1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000001',  3.49,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000002',  3.79,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000003',  3.99,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000004',  3.59,'manual','approved', NOW() - INTERVAL '1 day'),
    -- Café 500g
      ('b1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000001', 18.90,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000002', 20.50,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000003', 22.90,'manual','approved', NOW() - INTERVAL '3 days'),
      ('b1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000004', 19.80,'qr_code','approved', NOW() - INTERVAL '1 day'),
    -- Banana (kg)
      ('b1000000-0000-0000-0000-000000000015','a1000000-0000-0000-0000-000000000001',  4.99,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000015','a1000000-0000-0000-0000-000000000002',  5.50,'manual','approved', NOW() - INTERVAL '2 days'),
      ('b1000000-0000-0000-0000-000000000015','a1000000-0000-0000-0000-000000000003',  6.20,'manual','approved', NOW() - INTERVAL '1 day'),
      ('b1000000-0000-0000-0000-000000000015','a1000000-0000-0000-0000-000000000005',  5.10,'manual','approved', NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING
  `)
  console.log('  ✓ Preços inseridos')

  // Historical prices (3 months back) for analytics/trend data
  for (const [productId, basePrice] of [
    ['b1000000-0000-0000-0000-000000000001', 22.00],   // Arroz
    ['b1000000-0000-0000-0000-000000000003', 4.20],    // Leite
    ['b1000000-0000-0000-0000-000000000004', 14.00],   // Frango
  ] as [string, number][]) {
    for (let weeksAgo = 12; weeksAgo >= 1; weeksAgo--) {
      // Slight random variation ±8%
      const variation = 1 + (Math.random() * 0.16 - 0.08)
      const value = (basePrice * variation).toFixed(2)
      await pool.query(
        `INSERT INTO prices (product_id, market_id, value, source, status, registered_at)
         VALUES ($1, 'a1000000-0000-0000-0000-000000000001', $2, 'manual', 'approved', NOW() - ($3 || ' weeks')::interval)
         ON CONFLICT DO NOTHING`,
        [productId, value, weeksAgo]
      )
    }
  }
  console.log('  ✓ Histórico de preços inserido')

  // ─── Contributions ───────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO contributions (user_id, type, product_id, market_id, price, status, points) VALUES
      ('c1000000-0000-0000-0000-000000000001','qr_code','b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001', 22.90,'approved', 30),
      ('c1000000-0000-0000-0000-000000000001','manual', 'b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000002',  4.59,'approved', 10),
      ('c1000000-0000-0000-0000-000000000002','manual', 'b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001',  6.49,'approved', 10),
      ('c1000000-0000-0000-0000-000000000002','confirm','b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004', 15.80,'approved',  5),
      ('c1000000-0000-0000-0000-000000000003','manual', 'b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000003', 15.50,'approved', 10),
      ('c1000000-0000-0000-0000-000000000004','qr_code','b1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000004', 19.80,'approved', 30),
      ('c1000000-0000-0000-0000-000000000005','qr_code','b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001', 23.90,'approved', 30),
      ('c1000000-0000-0000-0000-000000000005','qr_code','b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000002',  7.99,'approved', 30),
      ('c1000000-0000-0000-0000-000000000005','manual', 'b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003',  5.10,'approved', 10),
      ('c1000000-0000-0000-0000-000000000005','confirm','b1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004', 16.20,'approved', 5),
      ('c1000000-0000-0000-0000-000000000005','qr_code','b1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000001', 14.90,'approved', 30)
    ON CONFLICT DO NOTHING
  `)
  console.log('  ✓ Contribuições inseridas')

  // ─── Badges ──────────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO badges (user_id, badge_type) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'Preços confiáveis'),
      ('c1000000-0000-0000-0000-000000000001', '7 dias seguidos'),
      ('c1000000-0000-0000-0000-000000000002', 'Preços confiáveis'),
      ('c1000000-0000-0000-0000-000000000001', 'Top 10 da semana'),
      ('c1000000-0000-0000-0000-000000000005', 'Primeiro QR Code'),
      ('c1000000-0000-0000-0000-000000000005', 'Preços confiáveis'),
      ('c1000000-0000-0000-0000-000000000005', 'Top 10 da semana'),
      ('c1000000-0000-0000-0000-000000000005', '7 dias seguidos')
    ON CONFLICT (user_id, badge_type) DO NOTHING
  `)
  console.log('  ✓ Badges inseridas')

  // ─── Promotions ──────────────────────────────────────────────────────────────
  await pool.query(`
    INSERT INTO promotions (market_id, product_id, price, valid_until) VALUES
      ('a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 19.99, NOW() + INTERVAL '7 days'),
      ('a1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000003',  3.99, NOW() + INTERVAL '3 days'),
      ('a1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000004', 12.90, NOW() + INTERVAL '2 days')
    ON CONFLICT DO NOTHING
  `)
  console.log('  ✓ Promoções inseridas')

  // ─── Sample list for dev user ────────────────────────────────────────────────
  const { rows: devLists } = await pool.query(`
    INSERT INTO lists (id, user_id, name, created_at)
    VALUES 
      ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'Compras de Junho', NOW() - INTERVAL '2 days'),
      ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 'Festa de Aniversário', NOW() - INTERVAL '5 days'),
      ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 'Produtos de Limpeza', NOW() - INTERVAL '10 days')
    ON CONFLICT DO NOTHING
    RETURNING id
  `)
  if (devLists.length > 0) {
    await pool.query(`
      INSERT INTO list_items (list_id, product_id, quantity) VALUES
        ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 1),
        ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000002', 2),
        ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000003', 4),
        ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000005', 1),
        ('d1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000004', 3),
        ('d1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000007', 2),
        ('d1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000012', 4),
        ('d1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000013', 2)
      ON CONFLICT DO NOTHING
    `)
    console.log('  ✓ Listas de exemplo criadas para dev@listasmart.com')
  }

  console.log('\n✅ Seed concluído com sucesso!\n')
  console.log('Usuários de teste:')
  console.log('  Consumer:  dev@listasmart.com   / senha123')
  console.log('  Maria F.:  maria@example.com    / senha123')
  console.log('  Parceiro:  parceiro@atacadao.com / admin123')

  await pool.end()
}

seed().catch((err) => {
  console.error('✗ Erro no seed:', err)
  process.exit(1)
})
