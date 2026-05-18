# Lista Smart — Monorepo

Plataforma para comparação colaborativa de preços em supermercados.  
App mobile único com dois fluxos de login · Landing page institucional · Backend compartilhado.

---

## Dois fluxos dentro do mesmo app mobile

O app mobile detecta o tipo de conta no login e redireciona para a experiência correta:

| Tipo de conta | Experiência |
|---------------|-------------|
| Usuário comum | App do consumidor — listas, scanner, comparação de preços, ranking, dashboard de inteligência pessoal |
| Supermercado parceiro | Portal do parceiro — dashboard operacional, relatórios, promoções, comparação de competitividade |

> **Nunca há dois apps separados.** O login determina qual fluxo de telas o usuário verá.

---

## Estrutura do repositório

```
listasmart/
├── apps/
│   ├── mobile/          → React Native + Expo — app único, dois fluxos (P1)
│   └── web/             → Next.js 14 — landing page institucional (P2)
├── packages/
│   ├── api/             → Node.js + Express — backend compartilhado (P3)
│   ├── database/        → schema, migrations, seeds (P3)
│   └── shared/          → tipos TypeScript, validações zod (P3 define · todos importam)
└── docs/
    ├── api.md           → contratos de API
    └── decisions.md     → registro de decisões técnicas
```

---

## Divisão de responsabilidades

| Pessoa | Área | Pastas |
|--------|------|--------|
| P1 | App mobile (consumidor + parceiro) | `apps/mobile/` |
| P2 | Web (landing page) | `apps/web/` |
| P3 | Backend + banco + tipos compartilhados | `packages/api/` · `packages/database/` · `packages/shared/` |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8 — `npm install -g pnpm`
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [PostgreSQL](https://www.postgresql.org/) >= 15 (local ou Docker)

---

## Instalação

```bash
# 1. clonar o repositório
git clone https://github.com/Lista-Smart-Mobile-Web/listasmart.git
cd listasmart

# 2. instalar todas as dependências do workspace de uma vez
pnpm install

# 3. configurar variáveis de ambiente
cp .env.example .env
# edite o .env com suas configurações locais

# 4. criar o banco de dados e rodar as migrations
pnpm --filter @listasmart/database migrate

# 5. popular o banco com dados de teste
pnpm --filter @listasmart/database seed
```

---

## Rodando o projeto

Cada parte pode ser iniciada separadamente:

```bash
# backend (API)
pnpm --filter @listasmart/api dev
# disponível em http://localhost:3001

# web (Next.js)
pnpm --filter @listasmart/web dev
# disponível em http://localhost:3000

# mobile (Expo)
pnpm --filter @listasmart/mobile start
# escaneie o QR Code com o app Expo Go
```

Ou tudo ao mesmo tempo com Turborepo:

```bash
pnpm dev
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
# banco de dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/listasmart

# autenticação JWT (único segredo — role incluso no token)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# API (usada pelo web e mobile)
NEXT_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

> **Nunca commite o arquivo `.env` real.** Ele já está no `.gitignore`.

---

## Fluxo de trabalho com Git

### Branches

Cada funcionalidade deve ser desenvolvida em uma branch separada:

```
main                        → código estável, sempre funciona
feat/mobile-scanner         → nova funcionalidade
feat/portal-parceiro        → nova funcionalidade
fix/api-contributions       → correção de bug
```

### Convenção de commits

```
feat: adiciona scanner de QR Code
fix: corrige validação de preço no backend
chore: atualiza dependências
docs: adiciona contrato da rota /contributions
```

### Fluxo padrão

```bash
# 1. sempre partir da main atualizada
git checkout main
git pull

# 2. criar branch para a funcionalidade
git checkout -b feat/nome-da-funcionalidade

# 3. desenvolver, commitar com mensagens descritivas
git add .
git commit -m "feat: descrição do que foi feito"

# 4. enviar para o GitHub
git push origin feat/nome-da-funcionalidade

# 5. abrir Pull Request no GitHub para mesclar na main
```

> **Nunca faça push direto na `main`.** Todo código entra via Pull Request.

---

## Pacote shared — tipos compartilhados

O arquivo `packages/shared/src/types.ts` define as interfaces TypeScript usadas pelos três projetos. Qualquer mudança nele afeta mobile e web imediatamente.

```typescript
// exemplo de importação no mobile ou web
import type { Product, Market, Contribution } from '@listasmart/shared'
```

Antes de alterar tipos no `shared`, avise a equipe — é o arquivo com maior impacto no projeto.

---

## Prioridade na semana 1

O P3 precisa entregar antes dos outros poderem integrar:

- [ ] Schema do banco criado e migrations rodando
- [ ] Rotas `/auth/register` e `/auth/login` funcionando (com campo `role`: `consumer` | `partner`)
- [ ] Arquivo `packages/shared/src/types.ts` com os tipos base
- [ ] `.env.example` atualizado

Só depois disso o P1 e P2 conseguem começar a integrar com a API.

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Mobile (consumidor + parceiro) | React Native · Expo · expo-router · Zustand · React Query · SQLite |
| Web (landing) | Next.js 14 · Tailwind CSS · Framer Motion |
| Backend | Node.js · Express · JWT (com `role`) · Zod |
| Banco | PostgreSQL · (SQLite local no mobile) |
| Monorepo | pnpm workspaces · Turborepo |

---

## Documentação

- [`docs/api.md`](./docs/api.md) — contratos completos de cada rota da API
- [`docs/decisions.md`](./docs/decisions.md) — registro de decisões técnicas e justificativas

---

## Equipe

Projeto desenvolvido para as disciplinas de **Engenharia de Software** e **Programação para Dispositivos Móveis**.  
Case baseado na startup [Lista Smart](https://listasmart.com.br).
