-- ============================================================
-- 001__create_tables.sql
-- Lista Smart — schema inicial
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'consumer'
                CHECK (role IN ('consumer','partner')),
  market_id     UUID,
  points        INTEGER      NOT NULL DEFAULT 0,
  level         VARCHAR(20)  NOT NULL DEFAULT 'iniciante'
                CHECK (level IN ('iniciante','colaborador','verificado','especialista','embaixador')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── MARKETS ─────────────────────────────────────────────────────────────────
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

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL,
  category   VARCHAR(60)  NOT NULL,
  barcode    VARCHAR(30)  UNIQUE,
  unit       VARCHAR(20)  NOT NULL DEFAULT 'un',
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── LISTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lists (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(80) NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─── LIST ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS list_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID    NOT NULL REFERENCES lists(id)    ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (list_id, product_id)
);

-- ─── PRICES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prices (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID          NOT NULL REFERENCES products(id),
  market_id     UUID          NOT NULL REFERENCES markets(id),
  value         DECIMAL(10,2) NOT NULL CHECK (value > 0),
  source        VARCHAR(20)   NOT NULL DEFAULT 'manual'
                CHECK (source IN ('qr_code','manual','confirm')),
  status        VARCHAR(20)   NOT NULL DEFAULT 'approved'
                CHECK (status IN ('pending','approved','rejected')),
  registered_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── CONTRIBUTIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contributions (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID          NOT NULL REFERENCES users(id),
  type       VARCHAR(20)   NOT NULL CHECK (type IN ('qr_code','manual','confirm')),
  product_id UUID          NOT NULL REFERENCES products(id),
  market_id  UUID          NOT NULL REFERENCES markets(id),
  price      DECIMAL(10,2) NOT NULL CHECK (price > 0),
  status     VARCHAR(20)   NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','approved','rejected')),
  points     INTEGER       NOT NULL DEFAULT 0,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── BADGES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_type)
);

-- ─── PROMOTIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id   UUID          NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES products(id),
  price       DECIMAL(10,2) NOT NULL CHECK (price > 0),
  valid_until TIMESTAMP     NOT NULL
);

-- ─── LEADS ───────────────────────────────────────────────────────────────────
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

-- ─── FK users → markets ───────────────────────────────────────────────────────
-- Adicionada após markets porque a tabela é criada depois de users.
-- O bloco DO ignora silenciosamente se a constraint já existir (idempotente).
DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT fk_users_market
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prices_product_market ON prices(product_id, market_id);
CREATE INDEX IF NOT EXISTS idx_prices_registered_at  ON prices(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_user    ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_created ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_list_items_list       ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_markets_city          ON markets(city);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
