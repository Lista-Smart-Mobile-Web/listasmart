-- =============================================================================
-- Lista Smart — Schema Completo e Seed de Dados Iniciais
-- Utilize este script para inicializar o banco de dados manualmente
-- Comando de execução (exemplo):
-- psql -U postgres -d listasmart -f packages/database/setup.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer','partner')),
  market_id     UUID,
  points        INTEGER      NOT NULL DEFAULT 0,
  level         VARCHAR(20)  NOT NULL DEFAULT 'iniciante' CHECK (level IN ('iniciante','colaborador','verificado','especialista','embaixador')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS markets (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL,
  address    VARCHAR(255) NOT NULL,
  city       VARCHAR(80)  NOT NULL,
  cnpj       VARCHAR(18)  UNIQUE,
  lat        FLOAT        NOT NULL,
  lng        FLOAT        NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL,
  category   VARCHAR(60)  NOT NULL,
  barcode    VARCHAR(30)  UNIQUE,
  unit       VARCHAR(20)  NOT NULL DEFAULT 'un',
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lists (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS list_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID    NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (list_id, product_id)
);

CREATE TABLE IF NOT EXISTS prices (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID          NOT NULL REFERENCES products(id),
  market_id     UUID          NOT NULL REFERENCES markets(id),
  value         DECIMAL(10,2) NOT NULL CHECK (value > 0),
  source        VARCHAR(20)   NOT NULL DEFAULT 'manual' CHECK (source IN ('qr_code','manual','confirm')),
  status        VARCHAR(20)   NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  registered_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contributions (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL REFERENCES users(id),
  type       VARCHAR(20)   NOT NULL CHECK (type IN ('qr_code','manual','confirm')),
  product_id UUID          NOT NULL REFERENCES products(id),
  market_id  UUID          NOT NULL REFERENCES markets(id),
  price      DECIMAL(10,2) NOT NULL CHECK (price > 0),
  status     VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  points     INTEGER       NOT NULL DEFAULT 0,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_type)
);

CREATE TABLE IF NOT EXISTS promotions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id   UUID          NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES products(id),
  price       DECIMAL(10,2) NOT NULL CHECK (price > 0),
  valid_until TIMESTAMP     NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name   VARCHAR(120) NOT NULL,
  city         VARCHAR(80)  NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  email        VARCHAR(255) NOT NULL,
  store_count  VARCHAR(30)  NOT NULL,
  message      TEXT,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT fk_users_market
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_prices_product_market ON prices(product_id, market_id);
CREATE INDEX IF NOT EXISTS idx_prices_registered_at  ON prices(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_user    ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_created ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_list_items_list       ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_markets_city          ON markets(city);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);

-- =============================================================================
-- ─── INSERÇÃO DE DADOS INICIAIS (SEED) ───────────────────────────────────────
-- =============================================================================

-- 1. Mercados
INSERT INTO markets (id, name, address, city, cnpj, lat, lng) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Atacadão Vila Madalena',  'R. Augusta, 1890',      'São Paulo', '00.000.000/0001-00', -23.5505, -46.6333),
  ('a1000000-0000-0000-0000-000000000002', 'Extra Hiper Pinheiros',   'Av. Rebouças, 3970',    'São Paulo', '00.000.000/0002-00', -23.5629, -46.6544),
  ('a1000000-0000-0000-0000-000000000003', 'Pão de Açúcar Jardins',   'Al. Lorena, 1100',      'São Paulo', '00.000.000/0003-00', -23.5711, -46.6532),
  ('a1000000-0000-0000-0000-000000000004', 'Carrefour Faria Lima',    'Av. Faria Lima, 4300',  'São Paulo', '00.000.000/0004-00', -23.5676, -46.6924),
  ('a1000000-0000-0000-0000-000000000005', 'Mercadinho Bela Vista',   'R. 13 de Maio, 450',    'São Paulo', '00.000.000/0005-00', -23.5601, -46.6469)
ON CONFLICT (id) DO NOTHING;

-- 2. Produtos
INSERT INTO products (id, name, category, barcode, unit) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Arroz Camil 5kg',             'Grãos',       '7896006709406', 'kg'),
  ('b1000000-0000-0000-0000-000000000002', 'Feijão Carioca Kicaldo 1kg',  'Grãos',       '7896004400678', 'kg'),
  ('b1000000-0000-0000-0000-000000000003', 'Leite Integral Italac 1L',    'Laticínios',  '7898949971029', 'L'),
  ('b1000000-0000-0000-0000-000000000004', 'Frango Peito s/Osso 1kg',     'Carnes',      NULL,            'kg'),
  ('b1000000-0000-0000-0000-000000000005', 'Ovos Caipira 12un',           'Ovos',        NULL,            'dúzia'),
  ('b1000000-0000-0000-0000-000000000006', 'Óleo de Soja Liza 900ml',     'Óleos',       '7894000090016', 'ml'),
  ('b1000000-0000-0000-0000-000000000007', 'Açúcar Cristal União 1kg',    'Mercearia',   '7891910000197', 'kg'),
  ('b1000000-0000-0000-0000-000000000011', 'Café Pelé 500g',              'Bebidas',     '7896004802021', 'g'),
  ('b1000000-0000-0000-0000-000000000015', 'Banana Prata (kg)',           'Frutas',      NULL,            'kg')
ON CONFLICT (id) DO NOTHING;

-- 3. Usuários (As senhas geradas utilizam Bcrypt hash. senhas dos consumers = 'senha123', parceiro = 'admin123')
INSERT INTO users (id, name, email, password_hash, role, points, level) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Maria Fernanda',  'maria@example.com',   '$2a$10$RfyZhZitQZIGzGq8dTolz.LSR2dU92z54cxMt7MCGvQqZ7DPO1QIe', 'consumer', 380,  'colaborador'),
  ('c1000000-0000-0000-0000-000000000002', 'João Carlos',     'joao@example.com',    '$2a$10$RfyZhZitQZIGzGq8dTolz.LSR2dU92z54cxMt7MCGvQqZ7DPO1QIe', 'consumer', 260,  'colaborador'),
  ('c1000000-0000-0000-0000-000000000005', 'Teste Dev',       'dev@listasmart.com',  '$2a$10$RfyZhZitQZIGzGq8dTolz.LSR2dU92z54cxMt7MCGvQqZ7DPO1QIe', 'consumer', 1500, 'embaixador')
ON CONFLICT (id) DO UPDATE SET points = EXCLUDED.points, level = EXCLUDED.level;

INSERT INTO users (id, name, email, password_hash, role, market_id) VALUES
  ('c1000000-0000-0000-0000-000000000010', 'Parceiro Atacadão', 'parceiro@atacadao.com', '$2a$10$Ywd6Z1TZ99SooU30TVrDr.9fRhfMPdBvco6PrrP4IWP3PnEVnNREG', 'partner', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 4. Preços, Listas de Exemplo e Promoções
INSERT INTO prices (product_id, market_id, value, source, status, registered_at) VALUES
  ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001', 22.90,'manual','approved', NOW() - INTERVAL '2 days'),
  ('b1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001',  6.49,'manual','approved', NOW() - INTERVAL '1 day'),
  ('b1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000001',  4.29,'manual','approved', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO promotions (market_id, product_id, price, valid_until) VALUES
  ('a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 19.99, NOW() + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

INSERT INTO lists (id, user_id, name, created_at) VALUES 
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'Compras de Junho', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

INSERT INTO list_items (list_id, product_id, quantity) VALUES
  ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 1),
  ('d1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000003', 4)
ON CONFLICT DO NOTHING;
