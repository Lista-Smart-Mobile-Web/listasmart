# Contexto técnico — Lista Smart

Use este arquivo como referência ao trabalhar com IA no VS Code.  
Ele contém as decisões técnicas, regras de negócio e contratos do projeto.

---

## O que é o projeto

A Lista Smart é uma plataforma que ajuda consumidores a economizarem nas compras de supermercado. Os usuários organizam listas de compras, escaneiam cupons fiscais e colaboram com preços. O sistema compara preços entre mercados e sugere o mais barato para cada lista.

O app mobile é único, mas serve dois perfis distintos com experiências completamente separadas:

- **Usuário comum** → fluxo do consumidor (listas, scanner, comparação, ranking, dashboard pessoal)
- **Supermercado parceiro** → fluxo do parceiro (dashboard operacional, relatórios, promoções, análise de competitividade)

O tipo de conta é definido no cadastro e detectado no login. Após autenticar, o app redireciona para o conjunto de telas correspondente ao perfil.

---

## Arquitetura geral

Monorepo com pnpm workspaces + Turborepo.  
Um backend compartilhado atende o app mobile e o web.

```
listasmart/
├── apps/
│   ├── mobile/          → React Native + Expo — app único, dois fluxos de login (P1)
│   └── web/             → Next.js 14 — landing page institucional (P2)
├── packages/
│   ├── api/             → Node.js + Express (P3)
│   ├── database/        → PostgreSQL, migrations, seeds (P3)
│   └── shared/          → tipos TypeScript + schemas zod (P3)
└── docs/
```

---

## Divisão de pessoas

- **P1** — app mobile (fluxo consumidor + fluxo parceiro): `apps/mobile/`
- **P2** — web (landing page institucional): `apps/web/`
- **P3** — backend + banco + tipos compartilhados: `packages/`

---

## Stack por camada

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native · Expo · expo-router · Zustand · React Query · expo-sqlite |
| Web | Next.js 14 App Router · Tailwind CSS · Recharts · Framer Motion · next-auth/jose |
| Backend | Node.js · Express · JWT · Zod · PostgreSQL |
| Shared | TypeScript · Zod (schemas compartilhados) |
| Monorepo | pnpm workspaces · Turborepo |

---

## URLs de produção (web)

| URL | Módulo | Renderização |
|-----|--------|-------------|
| `listasmart.com/` | Landing page institucional | SSG (`force-static`) |

> O portal do parceiro e o dashboard de inteligência estão no **app mobile**, não no web. O web é exclusivamente a landing page institucional.

---

## Backend — rotas da API

Base URL: `http://localhost:3001` (dev) / `https://api.listasmart.com` (prod)

```
POST   /auth/register          → cadastro de usuário
POST   /auth/login             → login + JWT

GET    /users/me               → perfil + pontos + nível
PUT    /users/me               → atualiza perfil

GET    /lists                  → listas do usuário autenticado
POST   /lists                  → cria nova lista
GET    /lists/:id/items        → itens da lista + preço médio + mercado mais barato
POST   /lists/:id/items        → adiciona produto à lista
PUT    /lists/:id/items/:itemId → atualiza item (quantidade, is_checked)
DELETE /lists/:id/items/:itemId → remove item

GET    /products               → busca produtos (?q=nome&barcode=)
GET    /products/:id           → detalhe do produto + histórico de preços

GET    /prices/compare         → compara preços (?product_id=&lat=&lng=&radius=)
POST   /contributions          → envia colaboração de preço (QR ou manual)
GET    /contributions/history  → histórico de contribuições do usuário

GET    /markets                → lista mercados (?lat=&lng=&radius=)
GET    /markets/:id            → detalhe do mercado
GET    /markets/:id/dashboard  → visão do parceiro (auth role:partner)
POST   /markets/:id/promotions → cria promoção (auth role:partner)
GET    /markets/:id/report     → relatório exportável — PDF/CSV (auth role:partner)

GET    /ranking                → ranking semanal de colaboradores
GET    /analytics/overview     → resumo de inteligência do consumidor (auth role:consumer)
GET    /analytics/prices       → variação temporal (?product_id=&period=30d)
GET    /analytics/markets      → ranking de competitividade (auth role:partner)

POST   /api/leads              → formulário de contato da landing page
```

---

## Autenticação

Um único fluxo de autenticação no app mobile, com redirecionamento baseado em `role`:

**Login único — app mobile**
- Token JWT enviado no header: `Authorization: Bearer <token>`
- Armazenado no AsyncStorage
- O JWT inclui o campo `role`: `consumer` | `partner`
- Após login, o app verifica o `role` e navega para o fluxo correto:
  - `consumer` → telas do consumidor (`(tabs)/listas`, scanner, comparação, ranking, dashboard pessoal)
  - `partner` → telas do parceiro (`(partner)/dashboard`, relatórios, promoções, análise de competitividade)

**Web (landing page)**
- Sem autenticação — apenas SSG público

---

## Banco de dados — tabelas principais

```sql
users (
  id UUID PK, name, email, password_hash,
  role VARCHAR(20) DEFAULT 'consumer',   -- 'consumer' | 'partner'
  points INTEGER DEFAULT 0, level VARCHAR(20) DEFAULT 'iniciante',
  market_id UUID FK NULL,                -- preenchido apenas quando role='partner'
  created_at TIMESTAMP
)

lists (
  id UUID PK, user_id FK, name, is_active BOOLEAN, created_at
)

list_items (
  id UUID PK, list_id FK, product_id FK, quantity INTEGER, is_checked BOOLEAN
)

products (
  id UUID PK, name, category, barcode, unit, created_at
)

markets (
  id UUID PK, name, address, city, cnpj, lat FLOAT, lng FLOAT, created_at
)

prices (
  id UUID PK, product_id FK, market_id FK,
  value DECIMAL(10,2), source VARCHAR(20), status VARCHAR(20),
  registered_at TIMESTAMP
)

contributions (
  id UUID PK, user_id FK,
  type VARCHAR(20),      -- 'qr_code' | 'manual' | 'confirm'
  product_id FK, market_id FK,
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',  -- 'approved' | 'rejected'
  points INTEGER,
  created_at TIMESTAMP
)

badges (
  id UUID PK, user_id FK, badge_type VARCHAR(50), earned_at TIMESTAMP
)

promotions (
  id UUID PK, market_id FK, product_id FK,
  price DECIMAL(10,2), valid_until TIMESTAMP
)
```

---

## Tipos compartilhados — packages/shared/src/types.ts

Este arquivo é a fonte da verdade para os tipos. Mobile e web importam daqui.  
**Nunca duplique tipos — sempre importe de `@listasmart/shared`.**

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'consumer' | 'partner'
  points: number                          // relevante apenas para role:'consumer'
  level: 'iniciante' | 'colaborador' | 'verificado' | 'especialista' | 'embaixador'
  marketId?: string                       // preenchido apenas para role:'partner'
}

export interface Product {
  id: string
  name: string
  category: string
  barcode?: string
  unit: string
}

export interface Market {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

export interface Price {
  id: string
  productId: string
  marketId: string
  value: number
  registeredAt: string
}

export interface Contribution {
  id: string
  userId: string
  type: 'qr_code' | 'manual' | 'confirm'
  productId: string
  marketId: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  points: number
  createdAt: string
}

export interface ListItem {
  productId: string
  name: string
  quantity: number
  isChecked: boolean
  avgPrice?: number
  cheapestMarket?: Pick<Market, 'id' | 'name'>
}
```

---

## Regras de negócio — pontuação

| Ação | Pontos |
|------|--------|
| Enviar cupom fiscal (QR Code completo) | +30 |
| Cadastrar preço manualmente | +10 |
| Confirmar preço de outro usuário | +5 |
| Sequência de 7 dias colaborando | +50 |
| Preço rejeitado como incoerente | −15 |

**Níveis de colaborador:**

| Nível | Pontos |
|-------|--------|
| Iniciante | 0–49 |
| Colaborador | 50–199 |
| Verificado | 200–499 |
| Especialista | 500–999 |
| Embaixador | 1000+ |

A lógica de pontos fica exclusivamente em `packages/api/src/services/pointsService.ts`.  
Nunca calcule pontos diretamente nas rotas.

---

## Regras de negócio — validação de preços

Antes de aprovar uma contribuição, o backend verifica:

1. **Intervalo histórico** — o preço está dentro de ±50% da média histórica daquele produto naquele mercado? Se não → rejeita + −15 pts
2. **Spam** — o mesmo usuário enviou o mesmo produto + mercado nas últimas 24h? Se sim → rejeita
3. **Confirmação por pares** — para usuários Verificado e acima, pelo menos 2 outros usuários precisam confirmar o preço antes do peso total ser aplicado

A lógica de validação fica em `packages/api/src/services/validationService.ts`.

---

## Decisões técnicas

**Por que monorepo?**
O `packages/shared` precisa ser acessado por mobile e web simultaneamente. Com repos separados isso exigiria publicar um pacote npm privado e versionar — complexidade desnecessária no prazo do projeto.

**Por que pnpm?**
Workspaces nativos, instalação mais rápida que npm/yarn, e o comando `pnpm --filter @listasmart/api dev` para rodar pacotes individualmente.

**Por que Next.js App Router com SSG/SSR?**
- Landing page é SSG (`force-static`) — zero requisição ao banco, máxima performance e SEO
- Portal parceiro e dashboard são SSR — dados frescos a cada acesso, autenticação verificada no servidor
- Gráficos Recharts precisam de `'use client'` porque dependem de JS no browser. Tudo que não tem interação ou usa `window` fica como Server Component

**Por que cookie httpOnly para parceiros?**
XSS não consegue ler cookies httpOnly. Para o portal web do parceiro é mais seguro que localStorage. O app mobile usa Bearer token no header porque não tem contexto de browser.

**Por que um único app com dois fluxos por `role`?**
Um único app mobile reduz custo de manutenção, reutiliza componentes comuns (ex: busca de produtos, mapa de mercados) e simplifica distribuição nas lojas. O campo `role` no JWT determina qual conjunto de telas o expo-router renderiza após o login — consumidores nunca enxergam as rotas `(partner)` e vice-versa.

**Por que pointsService separado?**
Centraliza a lógica de gamificação. Facilita testes unitários e evita lógica espalhada pelas rotas.

---

## Estrutura do app mobile — telas principais

O app usa expo-router com grupos de rotas separados por perfil:

**Fluxo comum (pré-login)**
```
(auth)/login.tsx          → email + senha + link "esqueci senha" (detecta role no login)
(auth)/cadastro.tsx       → nome, email, senha, tipo de conta (consumidor ou parceiro)
```

**Fluxo consumidor** — acessível somente com `role: consumer`
```
(tabs)/listas.tsx         → lista de todas as listas + botão criar nova
(tabs)/scanner.tsx        → câmera QR Code + fallback manual
(tabs)/comparar.tsx       → seleciona lista, vê mercado mais barato no total
(tabs)/ranking.tsx        → ranking semanal + posição do usuário
(tabs)/dashboard.tsx      → dashboard de inteligência pessoal (histórico de economia, tendências)
(tabs)/perfil.tsx         → pontos, nível, selos, histórico

lista/[id].tsx            → itens da lista + preços + marcar comprado
```

**Fluxo parceiro** — acessível somente com `role: partner`
```
(partner)/dashboard.tsx   → visão geral do mercado (produtos mais buscados, competitividade)
(partner)/precos.tsx      → comparação de preços vs concorrentes, oportunidades
(partner)/promocoes.tsx   → criar, editar e publicar promoções
(partner)/relatorios.tsx  → exportação de relatórios (PDF / CSV)
(partner)/perfil.tsx      → dados do mercado, endereço, horário, logo
```

**Modais (consumidor):**
- `AdicionarProdutoModal` — busca por nome ou leitura de código de barras
- `CadastrarPrecoModal` — produto + mercado + preço + data (fallback do scanner)
- `NotificacoesModal` — queda de preço, produto mais barato em outro mercado

---

## Estrutura do web — páginas principais

O web é exclusivamente a landing page institucional. Portal do parceiro e dashboard estão no app mobile.

```
/                         → landing page institucional (SSG)
```

---

## Fluxo offline — mobile

1. `NetInfo` detecta ausência de conexão → banner "modo offline"
2. Ações salvas no SQLite local (`services/storage.ts`)
3. Quando conexão volta → `services/sync.ts` envia fila pendente para a API
4. Conflitos resolvidos por timestamp — o mais recente vence

---

## Variáveis de ambiente necessárias

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/listasmart
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## Portas locais

| Serviço | Porta |
|---------|-------|
| API (backend) | 3001 |
| Web (Next.js) | 3000 |
| Mobile (Expo) | 8081 |
| PostgreSQL | 5432 |
