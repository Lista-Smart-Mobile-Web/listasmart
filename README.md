# Lista Smart

Plataforma colaborativa e avançada de comparação de preços em supermercados. Desenvolvida para conectar consumidores em busca de economia a mercados em busca de visibilidade e fidelização de clientes.

O ecossistema do projeto é formado por um aplicativo móvel (atendendo tanto usuários finais quanto lojistas), uma API REST centralizada e uma Landing Page institucional.

---

## Principais Funcionalidades

### Para o Consumidor (Consumer)
- **Comparação Inteligente:** Mapeamento e exibição dos menores preços para produtos na região do usuário.
- **Listas Colaborativas:** Criação e compartilhamento de listas de compras sincronizadas em tempo real.
- **Leitor de Código de Barras (Scanner):** Adição de produtos e verificação ágil de preços.
- **Gamificação e Ranking:** Sistema de incentivos onde o usuário ganha pontos e insígnias ao contribuir com atualizações de preços na comunidade.
- **Modo Offline-first:** Suporte a cache inteligente (utilizando React Query) e armazenamento local, garantindo usabilidade mesmo sem conexão à internet.
- **Interface Premium:** Experiência de usuário fluida com suporte a micro-animações (Moti/Reanimated), Haptic Feedback e Skeleton Loaders.

### Para o Parceiro (Partner / Supermercados)
- **Dashboard Analítico:** Visualização de tendências do mercado, produtos mais buscados e performance de precificação.
- **Gestão de Promoções:** Publicação de ofertas exclusivas diretamente na plataforma para atração de clientes nas proximidades.
- **Exportação de Relatórios:** Geração de relatórios gerenciais das operações em formato CSV.

---

## Tecnologias Utilizadas

A arquitetura do projeto baseia-se em um Monorepo gerenciado pelo Turborepo e pnpm.

- **Aplicativo Mobile:** React Native, Expo (SDK 54), Expo Router, Zustand (Gerenciamento de Estado), TanStack React Query (Cache e Offline-first), Moti & Reanimated (Animações), Zod.
- **Backend (API):** Node.js, Express, PostgreSQL, Zod para validação.
- **Frontend (Web):** Next.js 14, React.
- **Pacotes Compartilhados (Shared):** Centralização de Tipagens (TypeScript) e Schemas (Zod).

---

## Pré-requisitos do Sistema

| Ferramenta | Versão Mínima Recomendada |
|---|---|
| Node.js | 18+ |
| pnpm | 8+ (`npm install -g pnpm`) |
| PostgreSQL | 15+ |

---

## Configuração do Ambiente (Primeira Execução)

### 1. Instalação de Dependências
```bash
pnpm install
```

### 2. Configuração do Banco de Dados
No seu servidor PostgreSQL (por exemplo, via pgAdmin), crie um banco de dados vazio com o nome `listasmart`.

### 3. Variáveis de Ambiente
Crie um arquivo `.env` no diretório raiz do projeto. Utilize as variáveis abaixo como referência:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/listasmart
JWT_SECRET=sua_chave_secreta_criptografica
JWT_EXPIRES_IN=30d
PORT=3001
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```
*(As credenciais de `postgres` e `SUA_SENHA` devem refletir a configuração do seu ambiente local).*

### 4. Configuração da Estrutura do Banco (Migrations e Schema)

O projeto possui um sistema automatizado para gerar as tabelas. Na raiz do projeto, execute os comandos abaixo:
```bash
pnpm --filter @listasmart/database migrate
pnpm --filter @listasmart/database seed
```

Caso você esteja configurando o projeto em um novo computador e não consiga utilizar o script de migration automático (ou prefira inicializar o banco de dados manualmente), nós disponibilizamos um script SQL completo e independente que cria as tabelas e já insere os dados iniciais de teste (seed).

Para executá-lo, utilize o comando `psql` (certifique-se de que o PostgreSQL está rodando e de que o banco `listasmart` já foi criado vazio):

```bash
psql -U postgres -d listasmart -f packages/database/setup.sql
```
*(Caso seu usuário tenha senha ou seja diferente de `postgres`, ajuste o comando conforme a necessidade. O terminal solicitará a senha, se houver).*

---

## Inicialização do Projeto

O Turborepo permite iniciar todos os serviços simultaneamente ou de maneira individualizada.

### Inicialização Completa
```bash
pnpm dev
```

### Inicialização Individualizada:

**Backend (API)**
```bash
pnpm --filter @listasmart/api dev
# Disponível em: http://localhost:3001
```

**Aplicativo Mobile (Expo)**
```bash
pnpm --filter @listasmart/mobile start
# Comandos interativos: Pressione 'a' para emulador Android, 'i' para iOS ou utilize o aplicativo Expo Go.
```

**Web (Landing Page)**
```bash
pnpm --filter @listasmart/web dev
# Disponível em: http://localhost:3000
```

---

## Contas de Teste e Homologação

Para propósitos de testes e validação, o script de *seed* gera as seguintes contas predefinidas (todas as senhas de consumidores são `senha123` e parceiros `admin123`):

| E-mail | Senha | Perfil | Nível / Pontuação |
|---|---|---|---|
| `dev@listasmart.com` | `senha123` | Consumidor | Padrão |
| `maria@example.com` | `senha123` | Consumidor | Colaboradora (380 pts) |
| `joao@example.com` | `senha123` | Consumidor | Colaborador (260 pts) |
| `parceiro@atacadao.com` | `admin123` | Parceiro | Gestor Comercial |

---

## Estrutura de Diretórios (Monorepo)

```
listasmart/
├── apps/
│   ├── mobile/          → Código fonte do App (React Native + Expo)
│   └── web/             → Código fonte da Landing Page (Next.js 14)
├── packages/
│   ├── api/             → Código fonte do Backend (Node + Express + DB logic)
│   ├── database/        → Scripts de Migrations, Seeders e SQL Schemas
│   └── shared/          → Tipos globais TypeScript e Zod Schemas
└── docs/
    └── context.md       → Documentação técnica detalhada e regras de negócio
```

---

## Endpoints da API (Base Path: `/api/v1`)

- **Autenticação:** `POST /auth/register`, `POST /auth/login`
- **Gestão de Usuário:** `GET /users/me`, `GET /users/me/badges`
- **Gestão de Listas:** `GET /lists`, `POST /lists`, `GET /lists/:id/items`
- **Catálogo de Produtos:** `GET /products`, `GET /prices/compare`
- **Gamificação e Comunidade:** `POST /contributions`, `GET /ranking`
- **Portal do Parceiro:** `GET /markets/:id/dashboard`, `POST /markets/:id/promotions`

---

## Equipe de Desenvolvimento

Projeto desenvolvido por:
- **Gustavo Constante**
- **João Marcos Vieira**
- **Brayan Miguel Favarin**
