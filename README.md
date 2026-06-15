# Lista Smart

Plataforma colaborativa de comparação de preços em supermercados.  
App mobile único com dois perfis (consumidor e parceiro) · Landing page institucional · API REST compartilhada.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ |
| pnpm | 8+ (`npm i -g pnpm`) |
| PostgreSQL | 15+ |

---

## Setup inicial (apenas na primeira vez)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Criar o banco de dados

No **pgAdmin**, clique com botão direito em **Databases → Create → Database** e crie o banco com o nome `listasmart`. Só o banco vazio — as tabelas serão criadas pelo migrate.

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (`listasmart/.env`):

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/listasmart
JWT_SECRET=uma_chave_secreta_qualquer_com_pelo_menos_32_chars
JWT_EXPIRES_IN=30d
PORT=3001
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

> Troque `postgres` e `SUA_SENHA` pelo usuário/senha do seu PostgreSQL local.

### 4. Criar as tabelas (migrations)

```bash
pnpm --filter @listasmart/database migrate
```

Saída esperada:
```
  ✓  001__create_tables.sql

✅ Migrations concluídas — 1 aplicadas, 0 ignoradas
```

### 5. Popular o banco com dados de teste

```bash
pnpm --filter @listasmart/database seed
```

---

## Rodando o projeto

### Backend (API)

```bash
# No terminal do IntelliJ ou VSCode, da raiz do monorepo:
pnpm --filter @listasmart/api dev

# API disponível em: http://localhost:3001
```

### Frontend web (landing page)

```bash
pnpm --filter @listasmart/web dev

# Disponível em: http://localhost:3000
```

### App mobile (Expo)

```bash
pnpm --filter @listasmart/mobile start

# Escaneie o QR Code com o Expo Go no celular
```

---

## Verificação rápida

Com a API rodando, teste o login pelo terminal:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"dev@listasmart.com\",\"password\":\"senha123\"}"
```

Deve retornar `{ "user": {...}, "token": "..." }`.

---

## Usuários de teste (criados pelo seed)

| E-mail | Senha | Perfil |
|---|---|---|
| `dev@listasmart.com` | `senha123` | Consumidor |
| `maria@example.com` | `senha123` | Consumidor (colaboradora, 380 pts) |
| `joao@example.com` | `senha123` | Consumidor (colaborador, 260 pts) |
| `parceiro@atacadao.com` | `admin123` | Parceiro (Atacadão Vila Madalena) |

---

## Migrations versionadas

As migrations ficam em `packages/database/src/migrations/` com numeração sequencial.

```
001__create_tables.sql   ← schema inicial
002__nome_da_mudanca.sql ← futuras alterações
```

Para criar uma nova migration:
1. Crie o arquivo `00N__descricao.sql` na pasta de migrations
2. Execute `pnpm --filter @listasmart/database migrate`

O runner controla quais migrations já foram aplicadas na tabela `schema_migrations`. Rodar o comando de novo é seguro — migrations já aplicadas são ignoradas.

---

## Portas

| Serviço | Porta |
|---|---|
| API (backend) | 3001 |
| Web (Next.js) | 3000 |
| Mobile (Expo) | 8081 |
| PostgreSQL | 5432 |

---

## Estrutura

```
listasmart/
├── apps/
│   ├── mobile/          → React Native + Expo (dois fluxos: consumer / partner)
│   └── web/             → Next.js 14 — landing page institucional
├── packages/
│   ├── api/             → Node.js + Express — todas as rotas
│   ├── database/        → migrations, seed, schema
│   └── shared/          → tipos TypeScript + schemas Zod (importados por todos)
└── docs/
    └── context.md       → regras de negócio e decisões técnicas
```

---

## Rotas da API

Base: `http://localhost:3001/api/v1`

```
POST   /auth/register
POST   /auth/login

GET    /users/me
PATCH  /users/me
GET    /users/me/badges

GET    /lists
POST   /lists
GET    /lists/:id
GET    /lists/:id/items
POST   /lists/:id/items
PATCH  /lists/:id/items/:itemId
DELETE /lists/:id/items/:itemId

GET    /products
GET    /products/:id
GET    /products/:id/prices

GET    /prices/compare?product_id=&lat=&lng=&radius=

POST   /contributions
GET    /contributions/history

GET    /markets
GET    /markets/:id
GET    /markets/:id/prices
GET    /markets/:id/promotions
GET    /markets/:id/dashboard    (role: partner)
POST   /markets/:id/promotions   (role: partner)
DELETE /markets/:id/promotions/:promoId (role: partner)
GET    /markets/:id/report       (role: partner, retorna CSV)

GET    /ranking

GET    /analytics/overview       (role: consumer)
GET    /analytics/prices?product_id=&period=30d
GET    /analytics/markets        (role: partner)

POST   /scanner/nfe

POST   /leads
```
