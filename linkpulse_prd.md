# PRD — LinkPulse

## 1. Visão geral

### Nome do projeto

**LinkPulse**

### Tipo de projeto

App **fullstack monorepo** para encurtar, gerenciar, analisar links.

### Descrição curta

**LinkPulse** = plataforma fullstack de short links + analytics. Usuário autenticado cria link curto, define alias, expiração, max clicks, acompanha métricas em dashboard web.

### Descrição para portfólio

Projeto pratica stack real de mercado: backend **Node.js + Express + TypeScript**, frontend **React + TypeScript**, banco **PostgreSQL**, ORM **Prisma**, **Redis** para cache + rate limit. Foco: auth, autorização, domínio, HTTP redirect, analytics por eventos, paginação, filtros, validação, docs, testes, monorepo.

---

## 2. Objetivo do produto

Entregar app completa onde usuário pode:

- cadastrar conta;
- fazer login;
- criar link curto;
- configurar regras por link;
- compartilhar link curto;
- acompanhar métricas;
- ver gráficos + tabelas de analytics;
- gerenciar links em UI web.

Meta: mostrar domínio prático fullstack moderno. Não virar CRUD genérico.

---

## 3. Problema que o projeto resolve

Links longos = ruim para compartilhar, medir, controlar. Usuário quer saber:

- quantos acessos link teve;
- quando acessos aconteceram;
- quais links performam melhor;
- se link expira em data específica;
- se link aceita só X cliques;
- como gerenciar muitos links em painel.

LinkPulse resolve com shortener + controle + analytics.

---

## 4. Público-alvo

### Usuário principal

Criadores de conteúdo, estudantes, devs, marketing, pequenos negócios, qualquer pessoa que compartilha links e quer medir acessos.

### Usuário técnico do projeto

Recrutadores, tech leads, avaliadores de portfólio.

Projeto deve mostrar domínio em:

- backend além de CRUD;
- integração frontend-backend;
- modelagem de dados;
- autenticação;
- segurança básica;
- performance com cache;
- organização de código;
- documentação;
- testes;
- decisões arquiteturais.

---

## 5. Escopo do MVP

MVP = funcional, demonstrável, bem documentado.

### Funcionalidades incluídas no MVP

#### Autenticação

- cadastro;
- login;
- JWT;
- hash com bcrypt;
- rota `/me`;
- middleware auth;
- proteção de rotas privadas.

#### Gerenciamento de links

Usuário autenticado pode:

- criar link curto;
- informar URL original;
- definir alias opcional;
- definir título opcional;
- definir descrição opcional;
- definir expiração opcional;
- definir max clicks opcional;
- listar links;
- filtrar links;
- paginar links;
- ver detalhes;
- editar link;
- ativar/desativar;
- excluir.

#### Redirecionamento

Endpoint público:

```http
GET /r/:shortCode
```

Regra:

- se link válido, redirect para URL original;
- se link não existe, erro;
- se expirado, erro;
- se desativado, erro;
- se max clicks atingido, erro;
- se IP excede limite, erro 429.

#### Analytics básico

Registrar evento por clique válido:

- ID do link;
- data/hora;
- IP se houver;
- user-agent;
- referer se houver.

Usuário vê:

- total cliques por link;
- cliques hoje;
- cliques últimos 7 dias;
- gráfico por dia;
- últimos acessos;
- links mais acessados.

#### Redis

Uso:

- cache de redirecionamento;
- rate limit.

PostgreSQL segue como fonte de verdade.

#### Frontend

Frontend deve permitir:

- cadastro;
- login;
- logout;
- proteção de rotas privadas;
- dashboard;
- criação de links;
- listagem;
- filtros;
- paginação;
- edição;
- ativação/desativação;
- exclusão;
- cópia do link curto;
- analytics em cards, tabela, gráfico.

---

## 6. Fora do escopo do MVP

Não fazer na v1:

- refresh token;
- login social;
- recuperação de senha;
- verificação de e-mail;
- 2FA;
- planos pagos;
- times/organizações;
- domínio customizado;
- links com senha;
- QR Code;
- geolocalização por IP;
- bot detection avançado;
- analytics real-time;
- webhooks;
- CSV export;
- microservices;
- Kafka;
- RabbitMQ;
- CQRS completo.

---

## 7. Funcionalidades para V2

Possíveis evoluções:

- QR Code;
- tags;
- campanhas;
- grupos de links;
- export CSV;
- analytics por país/cidade;
- browser/OS detection;
- links com senha;
- expiração por tempo e clique;
- domínio customizado;
- webhooks;
- painel admin;
- recuperação de senha;
- refresh token;
- login Google;
- tela pública customizada para link inválido/expirado.

---

## 8. Decisões técnicas consolidadas

### Arquitetura geral

- **Monorepo fullstack**
- **Backend em monólito modular**
- **Frontend com feature-based architecture**
- **Camada de API separada no frontend**
- **Server state com React Query**

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Zod
- JWT
- bcrypt
- Redis
- Swagger/OpenAPI
- Vitest
- Supertest

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide React
- Sonner ou React Hot Toast
- Vitest
- React Testing Library

### Monorepo

- npm workspaces
- apps/api
- apps/web
- packages/shared
- docs

### Infra local

- Docker Compose
- PostgreSQL
- Redis

### Deploy sugerido

- Frontend: Vercel
- Backend: Render ou Railway
- PostgreSQL: Neon, Supabase ou Railway
- Redis: Upstash

---

## 9. Arquitetura do monorepo

### Estrutura recomendada

```txt
linkpulse/
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── web/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── Dockerfile
│       └── .env.example
│
├── packages/
│   └── shared/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   ├── database-model.md
│   ├── decisions.md
│   └── roadmap.md
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

### Justificativa

Separa backend, frontend, shared, docs, infra local. `apps/api` + `apps/web` dá cara profissional e facilita crescer depois.

---

## 10. Arquitetura do backend

### Modelo arquitetural

Backend = **monólito modular** por domínio.

### Estrutura sugerida

```txt
apps/api/src/
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schemas.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   │   ├── users.repository.ts
│   │   ├── users.service.ts
│   │   └── users.types.ts
│   │
│   ├── links/
│   │   ├── links.controller.ts
│   │   ├── links.routes.ts
│   │   ├── links.service.ts
│   │   ├── links.repository.ts
│   │   ├── links.schemas.ts
│   │   ├── links.mapper.ts
│   │   └── links.types.ts
│   │
│   ├── redirects/
│   │   ├── redirects.controller.ts
│   │   ├── redirects.routes.ts
│   │   └── redirects.service.ts
│   │
│   ├── analytics/
│   │   ├── analytics.controller.ts
│   │   ├── analytics.routes.ts
│   │   ├── analytics.service.ts
│   │   ├── analytics.repository.ts
│   │   ├── analytics.schemas.ts
│   │   └── analytics.types.ts
│   │
│   └── rate-limit/
│       └── rate-limit.service.ts
│
├── shared/
│   ├── config/
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   └── redis.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── error-handler.ts
│   │   └── error-codes.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validate-request.middleware.ts
│   │   └── rate-limit.middleware.ts
│   │
│   ├── utils/
│   │   ├── generate-short-code.ts
│   │   ├── normalize-url.ts
│   │   └── date.ts
│   │
│   └── http/
│       └── response.ts
│
├── app.ts
└── server.ts
```

### Fluxo padrão

```txt
Route
  ↓
Controller
  ↓
Schema validation
  ↓
Service
  ↓
Repository
  ↓
Database / Redis
```

### Responsabilidades

#### Routes

Definem endpoints e pluggam middlewares nos controllers.

#### Controllers

Recebem HTTP, chamam services. Sem regra pesada.

#### Services

Guardam regra de negócio + orquestração.

#### Repositories

Isolam acesso ao banco via Prisma.

#### Schemas

Validam body, params, query com Zod.

#### Middlewares

Auth, validação, erro, rate limit.

---

## 11. Arquitetura do frontend

### Modelo arquitetural

Frontend = **feature-based architecture** + camada API separada + TanStack Query para estado assíncrono.

### Estrutura sugerida

```txt
apps/web/src/
│
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── query-client.ts
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth-api.ts
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   ├── pages/
│   │   │   ├── login-page.tsx
│   │   │   └── register-page.tsx
│   │   ├── schemas/
│   │   │   └── auth-schemas.ts
│   │   └── types.ts
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── types.ts
│   │
│   ├── links/
│   │   ├── api/
│   │   │   └── links-api.ts
│   │   ├── components/
│   │   │   ├── create-link-form.tsx
│   │   │   ├── edit-link-form.tsx
│   │   │   ├── links-table.tsx
│   │   │   ├── link-filters.tsx
│   │   │   ├── link-status-badge.tsx
│   │   │   └── copy-short-url-button.tsx
│   │   ├── hooks/
│   │   │   ├── use-links.ts
│   │   │   ├── use-create-link.ts
│   │   │   └── use-update-link.ts
│   │   ├── pages/
│   │   │   ├── links-page.tsx
│   │   │   ├── create-link-page.tsx
│   │   │   ├── link-details-page.tsx
│   │   │   └── edit-link-page.tsx
│   │   ├── schemas/
│   │   │   └── link-schemas.ts
│   │   └── types.ts
│   │
│   └── analytics/
│       ├── api/
│       │   └── analytics-api.ts
│       ├── components/
│       │   ├── analytics-summary-cards.tsx
│       │   ├── clicks-by-day-chart.tsx
│       │   └── access-events-table.tsx
│       ├── hooks/
│       ├── pages/
│       │   └── link-analytics-page.tsx
│       └── types.ts
│
├── shared/
│   ├── api/
│   │   ├── axios.ts
│   │   └── api-error.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── ui/
│   │   └── feedback/
│   │       ├── loading-state.tsx
│   │       ├── empty-state.tsx
│   │       └── error-state.tsx
│   ├── hooks/
│   ├── lib/
│   └── utils/
│
├── styles/
│   └── globals.css
│
└── main.tsx
```

### Fluxo padrão no frontend

```txt
Page
  ↓
Component
  ↓
Hook com React Query
  ↓
API Client
  ↓
Backend
```

### Justificativa

Evita pasta caótica de componentes/páginas/serviços. Cada domínio fica agrupado por feature.

---

## 12. Modelagem de domínio

### Entidade: User

Representa usuário da plataforma.

#### Campos

```txt
id
name
email
passwordHash
createdAt
updatedAt
```

#### Regras

- e-mail único;
- senha com hash;
- usuário só acessa próprios links;
- usuário não consulta analytics de terceiros.

---

### Entidade: ShortLink

Representa link encurtado.

#### Campos

```txt
id
userId
originalUrl
shortCode
customAlias
title
description
active
expiresAt
maxClicks
clickCount
createdAt
updatedAt
deletedAt
```

#### Regras

- `originalUrl` obrigatório;
- `originalUrl` válida;
- `shortCode` único;
- `customAlias` opcional e único;
- alias aceita letras, números, hífen, underscore;
- pode ter expiração;
- pode ter max clicks;
- pode ativar/desativar;
- excluído não aparece em listagem comum;
- expirado não redireciona;
- inativo não redireciona;
- max clicks atingido não redireciona.

---

### Entidade: LinkAccessEvent

Representa evento de acesso.

#### Campos

```txt
id
shortLinkId
accessedAt
ipAddress
userAgent
referer
```

#### Regras

- criar em clique válido;
- apontar para link existente;
- servir métricas + gráficos.

---

## 13. Modelo inicial do Prisma

Arquivo sugerido: `apps/api/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String      @id @default(uuid())
  name         String
  email        String      @unique
  passwordHash String
  links        ShortLink[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@map("users")
}

model ShortLink {
  id          String            @id @default(uuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])

  originalUrl String
  shortCode   String            @unique
  customAlias String?           @unique
  title       String?
  description String?

  active      Boolean           @default(true)
  expiresAt   DateTime?
  maxClicks   Int?
  clickCount  Int               @default(0)

  accessEvents LinkAccessEvent[]

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([shortCode])
  @@index([createdAt])
  @@map("short_links")
}

model LinkAccessEvent {
  id          String     @id @default(uuid())
  shortLinkId String
  shortLink   ShortLink  @relation(fields: [shortLinkId], references: [id])

  accessedAt  DateTime   @default(now())
  ipAddress   String?
  userAgent   String?
  referer      String?

  @@index([shortLinkId])
  @@index([accessedAt])
  @@map("link_access_events")
}
```

---

## 14. Regras de negócio detalhadas

### Cadastro de usuário

#### Entrada

- nome;
- e-mail;
- senha.

#### Regras

- nome obrigatório;
- e-mail obrigatório e válido;
- e-mail não pode repetir;
- senha com mínimo definido;
- salvar senha com bcrypt.

---

### Login

#### Entrada

- e-mail;
- senha.

#### Regras

- validar existência do usuário;
- comparar senha com bcrypt;
- gerar JWT;
- retornar token + dados básicos.

---

### Criação de link

#### Entrada

- URL original;
- alias customizado opcional;
- título opcional;
- descrição opcional;
- data de expiração opcional;
- limite máximo de cliques opcional.

#### Regras

- usuário autenticado;
- URL válida;
- alias, se existir, validar formato + unicidade;
- se alias vazio, gerar `shortCode`;
- `shortCode` único;
- `maxClicks` > 0;
- `expiresAt` futura;
- link nasce ativo;
- retornar URL curta completa.

---

### Redirecionamento

#### Endpoint público

```http
GET /r/:shortCode
```

#### Regras

- rate limit por IP;
- buscar no Redis;
- fallback PostgreSQL;
- cachear se veio do banco;
- validar existência;
- validar não excluído;
- validar ativo;
- validar não expirado;
- validar max clicks;
- registrar evento;
- incrementar contador;
- responder `302 Found`.

---

### Atualização de link

#### Regras

- usuário autenticado;
- link pertence ao usuário;
- permitir atualizar título, descrição, expiração, limite, status;
- se mudar alias/shortCode, validar unicidade;
- invalidar cache Redis.

---

### Exclusão de link

#### Regras

- usuário autenticado;
- link pertence ao usuário;
- preferir soft delete;
- invalidar cache Redis;
- link excluído não redireciona.

---

### Analytics

#### Regras

- usuário só consulta próprios links;
- dados vêm do PostgreSQL;
- métricas agregadas por consulta;
- frontend mostra cards + gráfico + tabela.

---

## 15. Status HTTP

### Tabela de respostas

| Caso | Status |
|---|---:|
| Criação bem-sucedida | 201 |
| Consulta bem-sucedida | 200 |
| Atualização bem-sucedida | 200 |
| Exclusão bem-sucedida | 204 |
| Redirecionamento bem-sucedido | 302 |
| Dados inválidos | 400 |
| Não autenticado | 401 |
| Sem permissão | 403 |
| Não encontrado | 404 |
| Link expirado | 410 |
| Limite de cliques atingido | 410 |
| Rate limit excedido | 429 |
| Erro interno | 500 |

---

## 16. Padrão de erro da API

Erro deve seguir formato consistente.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": [
    {
      "field": "originalUrl",
      "message": "Invalid URL"
    }
  ]
}
```

### Middleware global de erro

Middleware central precisa:

- capturar erros esperados;
- capturar Zod errors;
- capturar erros inesperados;
- esconder stack trace em prod;
- padronizar resposta.

---

## 17. Contrato inicial da API

### Auth

#### Registrar usuário

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Igor",
  "email": "igor@email.com",
  "password": "12345678"
}
```

Response:

```json
{
  "id": "uuid",
  "name": "Igor",
  "email": "igor@email.com",
  "createdAt": "2026-04-23T20:00:00.000Z"
}
```

---

#### Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "igor@email.com",
  "password": "12345678"
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "name": "Igor",
    "email": "igor@email.com"
  }
}
```

---

#### Usuário autenticado

```http
GET /api/v1/auth/me
```

Response:

```json
{
  "id": "uuid",
  "name": "Igor",
  "email": "igor@email.com"
}
```

---

### Links

#### Criar link

```http
POST /api/v1/links
```

Request:

```json
{
  "originalUrl": "https://example.com/artigo-backend",
  "customAlias": "backend-artigo",
  "title": "Artigo sobre Backend",
  "description": "Conteúdo sobre arquitetura backend",
  "expiresAt": "2026-05-30T23:59:59.000Z",
  "maxClicks": 500
}
```

Response:

```json
{
  "id": "uuid",
  "originalUrl": "https://example.com/artigo-backend",
  "shortCode": "backend-artigo",
  "shortUrl": "http://localhost:3000/r/backend-artigo",
  "title": "Artigo sobre Backend",
  "description": "Conteúdo sobre arquitetura backend",
  "active": true,
  "expiresAt": "2026-05-30T23:59:59.000Z",
  "maxClicks": 500,
  "clickCount": 0,
  "createdAt": "2026-04-23T20:00:00.000Z"
}
```

---

#### Listar links

```http
GET /api/v1/links?page=1&limit=10&search=backend&active=true&sort=createdAt&order=desc
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Artigo sobre Backend",
      "originalUrl": "https://example.com/artigo-backend",
      "shortCode": "backend-artigo",
      "shortUrl": "http://localhost:3000/r/backend-artigo",
      "active": true,
      "expired": false,
      "clickCount": 120,
      "expiresAt": "2026-05-30T23:59:59.000Z",
      "createdAt": "2026-04-23T20:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

---

#### Buscar link por ID

```http
GET /api/v1/links/:id
```

---

#### Atualizar link

```http
PATCH /api/v1/links/:id
```

Request:

```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "expiresAt": "2026-06-30T23:59:59.000Z",
  "maxClicks": 1000,
  "active": true
}
```

---

#### Excluir link

```http
DELETE /api/v1/links/:id
```

Response:

```http
204 No Content
```

---

#### Ativar link

```http
PATCH /api/v1/links/:id/activate
```

---

#### Desativar link

```http
PATCH /api/v1/links/:id/deactivate
```

---

### Redirecionamento

```http
GET /r/:shortCode
```

Resposta esperada em caso válido:

```http
302 Found
Location: https://example.com/artigo-backend
```

---

### Analytics

#### Resumo do link

```http
GET /api/v1/links/:id/analytics/summary
```

Response:

```json
{
  "linkId": "uuid",
  "shortCode": "backend-artigo",
  "totalClicks": 120,
  "clicksToday": 12,
  "clicksLast7Days": 84,
  "lastAccessAt": "2026-04-23T18:30:00.000Z"
}
```

---

#### Cliques por dia

```http
GET /api/v1/links/:id/analytics/clicks-by-day?from=2026-04-01&to=2026-04-23
```

Response:

```json
[
  {
    "date": "2026-04-21",
    "clicks": 20
  },
  {
    "date": "2026-04-22",
    "clicks": 35
  },
  {
    "date": "2026-04-23",
    "clicks": 12
  }
]
```

---

#### Últimos acessos

```http
GET /api/v1/links/:id/analytics/events?page=1&limit=10
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "accessedAt": "2026-04-23T18:30:00.000Z",
      "ipAddress": "192.168.0.10",
      "userAgent": "Mozilla/5.0",
      "referer": "https://google.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 120,
    "totalPages": 12
  }
}
```

---

#### Top links

```http
GET /api/v1/analytics/top-links
```

Response:

```json
[
  {
    "id": "uuid",
    "title": "Artigo sobre Backend",
    "shortCode": "backend-artigo",
    "shortUrl": "http://localhost:3000/r/backend-artigo",
    "clickCount": 120
  }
]
```

---

## 18. Redis

### Uso 1: Cache de redirecionamento

#### Chave

```txt
link:redirect:{shortCode}
```

#### Valor

```json
{
  "id": "uuid",
  "originalUrl": "https://example.com",
  "active": true,
  "expiresAt": "2026-05-30T23:59:59.000Z",
  "maxClicks": 500,
  "clickCount": 120
}
```

#### TTL

- se `expiresAt` existe, TTL = tempo restante;
- sem expiração, TTL padrão, ex.: 1h.

#### Invalidação

Invalidar quando:

- link editado;
- link desativado;
- link ativado;
- link excluído;
- max clicks alterado.

---

### Uso 2: Rate limit

#### Redirecionamento por IP

```txt
rate:redirect:{ip}
```

Regra sugerida:

```txt
100 requisições por minuto por IP
```

#### Criação de links por usuário

```txt
rate:create-link:{userId}
```

Regra sugerida:

```txt
20 links por hora por usuário
```

#### Login por IP ou e-mail

```txt
rate:login:{ip}
```

Regra sugerida:

```txt
10 tentativas por minuto por IP
```

---

## 19. Segurança

### Requisitos mínimos

- bcrypt para senha;
- JWT com segredo forte;
- segredo em env var;
- validação com Zod;
- middleware global de erro;
- rate limit;
- CORS configurado;
- Helmet;
- bloquear acesso a links de terceiros;
- nunca retornar `passwordHash`;
- nunca expor stack trace em prod.

### Bibliotecas sugeridas

```txt
bcrypt
jsonwebtoken
helmet
cors
zod
```

---

## 20. Variáveis de ambiente

### Backend

Arquivo: `apps/api/.env.example`

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://linkpulse:linkpulse@localhost:5432/linkpulse

REDIS_URL=redis://localhost:6379

JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1h

APP_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

RATE_LIMIT_REDIRECT_MAX=100
RATE_LIMIT_REDIRECT_WINDOW_SECONDS=60

RATE_LIMIT_CREATE_LINK_MAX=20
RATE_LIMIT_CREATE_LINK_WINDOW_SECONDS=3600
```

### Frontend

Arquivo: `apps/web/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=LinkPulse
```

---

## 21. Docker Compose

Arquivo: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: linkpulse-postgres
    environment:
      POSTGRES_DB: linkpulse
      POSTGRES_USER: linkpulse
      POSTGRES_PASSWORD: linkpulse
    ports:
      - "5432:5432"
    volumes:
      - linkpulse_postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: linkpulse-redis
    ports:
      - "6379:6379"

volumes:
  linkpulse_postgres_data:
```

Para MVP, basta subir PostgreSQL + Redis no Docker e rodar backend/frontend local via npm.

---

## 22. Páginas do frontend

### Rotas públicas

```txt
/login
/register
```

### Rotas privadas

```txt
/dashboard
/links
/links/new
/links/:id
/links/:id/edit
/links/:id/analytics
/settings
```

### Observação sobre redirecionamento

`/r/:shortCode` fica no backend, não frontend.

Motivo:

- mais rápido;
- mais correto para HTTP redirect;
- não depende de React;
- permite analytics no servidor;
- permite cache + rate limit.

---

## 23. Telas do frontend

### Login

Campos:

- e-mail;
- senha.

Ações:

- entrar;
- ir para cadastro.

Validações:

- e-mail obrigatório;
- e-mail válido;
- senha obrigatória.

---

### Cadastro

Campos:

- nome;
- e-mail;
- senha;
- confirmação de senha opcional no MVP.

Ações:

- criar conta;
- ir para login.

Validações:

- nome obrigatório;
- e-mail válido;
- senha com mínimo.

---

### Dashboard

Cards:

- total de links;
- total de cliques;
- links ativos;
- links expirados;
- cliques últimos 7 dias.

Seções:

- gráfico de cliques por dia;
- links mais acessados;
- últimos acessos.

---

### Página de links

Elementos:

- botão “Novo link”;
- busca;
- filtro status;
- tabela;
- paginação.

Colunas:

- título;
- link curto;
- URL original;
- status;
- cliques;
- expiração;
- criado em;
- ações.

Ações:

- copiar link;
- ver detalhes;
- ver analytics;
- editar;
- ativar/desativar;
- excluir.

---

### Página de criação de link

Campos:

- URL original;
- alias customizado;
- título;
- descrição;
- data de expiração;
- limite máximo de cliques.

---

### Página de edição de link

Campos editáveis:

- título;
- descrição;
- data de expiração;
- limite máximo de cliques;
- status.

---

### Página de analytics

Elementos:

- resumo do link;
- total de cliques;
- cliques hoje;
- cliques últimos 7 dias;
- último acesso;
- gráfico por dia;
- tabela de últimos acessos.

---

## 24. Componentes principais do frontend

### Layout

```txt
AppLayout
Sidebar
Header
PageContainer
ProtectedRoute
```

### Auth

```txt
LoginForm
RegisterForm
AuthGuard
```

### Links

```txt
CreateLinkForm
EditLinkForm
LinksTable
LinkFilters
LinkStatusBadge
CopyShortUrlButton
DeleteLinkDialog
DeactivateLinkDialog
```

### Dashboard

```txt
MetricCard
TopLinksTable
RecentClicksTable
ClicksChart
```

### Analytics

```txt
AnalyticsSummaryCards
ClicksByDayChart
AccessEventsTable
```

### Feedback

```txt
LoadingState
EmptyState
ErrorState
ConfirmDialog
Toast
```

---

## 25. Estados importantes da interface

Frontend deve tratar:

- carregando;
- erro;
- lista vazia;
- sessão expirada;
- link copiado com sucesso;
- erro de validação;
- erro de rede;
- erro 401;
- erro 403;
- erro 404;
- erro 429.

---

## 26. Testes

### Backend

Ferramentas:

- Vitest;
- Supertest.

Testes mínimos:

#### Auth

- cadastra usuário;
- bloqueia e-mail duplicado;
- login válido funciona;
- senha inválida falha;
- `/me` retorna usuário autenticado.

#### Links

- cria link autenticado;
- bloqueia URL inválida;
- bloqueia alias duplicado;
- lista só links do dono;
- atualiza só link próprio;
- bloqueia update de terceiro;
- desativa link;
- exclui link.

#### Redirect

- redireciona link válido;
- retorna 404 para shortCode ausente;
- bloqueia expirado;
- bloqueia inativo;
- bloqueia max clicks atingido;
- incrementa `clickCount`;
- registra analytics.

#### Analytics

- retorna resumo;
- retorna cliques por dia;
- retorna últimos eventos;
- bloqueia analytics de outro usuário.

---

### Frontend

Ferramentas:

- Vitest;
- React Testing Library;
- MSW, opcional.

Testes mínimos:

- `LoginForm` renderiza campos;
- `RegisterForm` valida e-mail inválido;
- `CreateLinkForm` valida URL inválida;
- `LinksTable` exibe links;
- `CopyShortUrlButton` copia link;
- `ProtectedRoute` bloqueia sem token;
- página de analytics renderiza cards principais.

---

## 27. Documentação

### Arquivos recomendados

```txt
README.md
docs/architecture.md
docs/api-contract.md
docs/database-model.md
docs/decisions.md
docs/roadmap.md
```

### README principal deve conter

- nome do projeto;
- descrição;
- funcionalidades;
- stack;
- arquitetura;
- estrutura monorepo;
- como rodar local;
- env vars;
- endpoints principais;
- prints/GIFs;
- decisões técnicas;
- roadmap;
- testes;
- próximos passos.

---

## 28. Decisões arquiteturais para documentar

### Decisão 1: Monorepo

Monorepo mantém backend, frontend, shared, docs no mesmo repo.

#### Trade-off

Vantagens:

- facilita avaliação;
- centraliza docs;
- facilita dev local;
- organiza fullstack.

Desvantagens:

- exige cuidado com scripts;
- pode crescer demais;
- deploy de web/api segue separado.

---

### Decisão 2: Backend em monólito modular

Domínio ainda não justifica microservices.

#### Trade-off

Vantagens:

- menor complexidade operacional;
- deploy simples;
- dev mais rápido;
- organização por módulos;
- fácil testar.

Desvantagens:

- módulos escalam juntos;
- exige disciplina contra acoplamento;
- sem isolamento físico entre domínios.

---

### Decisão 3: Frontend feature-based

Organizar por features evita estrutura genérica ruim de manter.

#### Trade-off

Vantagens:

- domínios agrupados;
- manutenção melhor;
- menos pasta global gigante;
- evolução mais simples.

Desvantagens:

- exige disciplina para decidir o que é shared;
- pode gerar leve duplicação no começo.

---

### Decisão 4: PostgreSQL como fonte de verdade

PostgreSQL = banco principal.

#### Trade-off

Vantagens:

- relacional;
- confiável;
- bom para filtros + analytics;
- muito usado.

Desvantagens:

- analytics pesados podem exigir otimização futura;
- precisa boa modelagem + índices.

---

### Decisão 5: Redis apenas para cache e rate limit

Redis não vira fonte de verdade de analytics.

#### Trade-off

Vantagens:

- acelera redirect;
- permite rate limit eficiente;
- mantém confiabilidade no PostgreSQL.

Desvantagens:

- exige invalidação de cache;
- adiciona infra;
- falha do Redis precisa tratamento.

---

## 29. Ordem recomendada de desenvolvimento

### Fase 1 — Setup do monorepo

Objetivo: criar base do projeto.

Tarefas:

- criar repo `linkpulse`;
- configurar npm workspaces;
- criar `apps/api`;
- criar `apps/web`;
- criar `packages/shared`;
- criar `docs`;
- configurar TypeScript no backend;
- configurar Vite React no frontend;
- criar Docker Compose com PostgreSQL + Redis;
- criar `.env.example`.

Critério de aceite:

- backend sobe;
- frontend sobe;
- Docker Compose sobe PostgreSQL + Redis;
- monorepo funciona.

---

### Fase 2 — Backend base

Objetivo: preparar API Express modular.

Tarefas:

- configurar Express;
- middlewares globais;
- CORS;
- Helmet;
- erro global;
- Zod;
- Prisma;
- PostgreSQL;
- Redis;
- health check.

Endpoint inicial:

```http
GET /health
```

Critério de aceite:

- `/health` responde;
- Prisma conecta;
- Redis conecta;
- erros padronizados.

---

### Fase 3 — Modelagem e migrations

Objetivo: criar banco.

Tarefas:

- schema Prisma;
- modelo `User`;
- modelo `ShortLink`;
- modelo `LinkAccessEvent`;
- migration;
- rodar migration;
- seed opcional.

Critério de aceite:

- tabelas criadas;
- Prisma Client gerado;
- app acessa banco.

---

### Fase 4 — Autenticação

Objetivo: auth completa do MVP.

Tarefas:

- cadastro;
- login;
- bcrypt;
- JWT;
- middleware auth;
- rota `/me`;
- proteger privadas.

Endpoints:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

Critério de aceite:

- usuário cadastra;
- usuário loga;
- token retorna;
- rota privada exige token;
- senha não sai em resposta.

---

### Fase 5 — Links core

Objetivo: CRUD principal de links.

Tarefas:

- módulo links;
- schemas Zod;
- repository;
- service;
- controller;
- gerar shortCode;
- validar alias;
- validar URL;
- listagem paginada;
- filtros;
- edição;
- ativação/desativação;
- soft delete.

Endpoints:

```http
POST /api/v1/links
GET /api/v1/links
GET /api/v1/links/:id
PATCH /api/v1/links/:id
DELETE /api/v1/links/:id
PATCH /api/v1/links/:id/activate
PATCH /api/v1/links/:id/deactivate
```

Critério de aceite:

- cria link;
- lista só próprios links;
- edita só próprios links;
- exclui só próprios links;
- alias duplicado bloqueado.

---

### Fase 6 — Redirecionamento

Objetivo: endpoint público de redirect.

Tarefas:

- módulo redirects;
- busca por `shortCode`;
- validar ativo;
- validar expiração;
- validar limite de cliques;
- incrementar contador;
- registrar acesso;
- retornar 302.

Endpoint:

```http
GET /r/:shortCode
```

Critério de aceite:

- válido redireciona;
- inexistente retorna 404;
- expirado retorna 410;
- desativado retorna erro;
- max clicks atingido retorna 410;
- clique válido incrementa contador;
- clique válido gera analytics.

---

### Fase 7 — Analytics backend

Objetivo: expor métricas para frontend.

Tarefas:

- módulo analytics;
- resumo por link;
- cliques por dia;
- últimos acessos;
- top links;
- ownership.

Endpoints:

```http
GET /api/v1/links/:id/analytics/summary
GET /api/v1/links/:id/analytics/clicks-by-day
GET /api/v1/links/:id/analytics/events
GET /api/v1/analytics/top-links
```

Critério de aceite:

- usuário consulta próprios analytics;
- usuário não acessa analytics de terceiro;
- agregados corretos.

---

### Fase 8 — Redis e rate limit

Objetivo: performance + proteção.

Tarefas:

- cache de redirect;
- salvar link no Redis após consulta ao banco;
- invalidar cache após alteração;
- rate limit por IP em redirect;
- rate limit em login;
- rate limit em criação de link.

Critério de aceite:

- redirect usa cache;
- cache invalida nas alterações;
- excesso retorna 429;
- falha do Redis não derruba API inteira, se possível.

---

### Fase 9 — Swagger/OpenAPI

Objetivo: documentar API.

Tarefas:

- configurar Swagger;
- documentar endpoints;
- documentar schemas;
- documentar JWT;
- documentar exemplos.

Endpoint sugerido:

```http
GET /docs
```

Critério de aceite:

- docs abrem no browser;
- principais endpoints documentados;
- schemas corretos;
- JWT testável.

---

### Fase 10 — Frontend base

Objetivo: estrutura visual + integração base.

Tarefas:

- React Router;
- TanStack Query;
- Axios;
- Tailwind;
- shadcn/ui;
- layout autenticado;
- sidebar;
- header;
- páginas vazias;
- ProtectedRoute.

Critério de aceite:

- navegação funciona;
- layout existe;
- rota privada bloqueia sem token;
- Axios usa base URL correta.

---

### Fase 11 — Auth frontend

Objetivo: integrar auth no frontend.

Tarefas:

- tela login;
- tela cadastro;
- integrar backend;
- salvar token;
- logout;
- tratar 401;
- redirecionar usuário autenticado.

Critério de aceite:

- cadastro pela UI;
- login pela UI;
- token usado nas chamadas;
- logout limpa sessão.

---

### Fase 12 — Links frontend

Objetivo: gerenciar links pela UI.

Tarefas:

- página de listagem;
- tabela;
- filtros;
- paginação;
- form criação;
- página detalhes;
- form edição;
- ações ativar/desativar;
- excluir;
- botão copiar.

Critério de aceite:

- usuário cria link;
- lista links;
- filtra links;
- edita link;
- copia link curto;
- exclui link.

---

### Fase 13 — Analytics frontend

Objetivo: exibir métricas no dashboard.

Tarefas:

- cards métricas;
- gráfico com Recharts;
- tabela últimos acessos;
- top links;
- dashboard principal;
- analytics por link.

Critério de aceite:

- dashboard mostra dados reais;
- gráfico renderiza cliques por dia;
- tabela mostra últimos eventos;
- página analytics funciona por link.

---

### Fase 14 — Testes

Objetivo: aumentar confiabilidade.

Tarefas backend:

- testar auth;
- testar links;
- testar redirect;
- testar analytics;
- testar middlewares.

Tarefas frontend:

- testar forms;
- testar ProtectedRoute;
- testar componentes principais;
- testar tabela + cards.

Critério de aceite:

- testes principais passam;
- erros críticos cobertos;
- projeto mostra preocupação com qualidade.

---

### Fase 15 — Documentação e acabamento

Objetivo: preparar para portfólio.

Tarefas:

- finalizar README;
- docs de arquitetura;
- docs de decisões técnicas;
- docs do banco;
- prints/GIFs;
- exemplos `.env`;
- revisar nomes;
- revisar mensagens de erro;
- revisar UX;
- revisar responsividade;
- preparar post LinkedIn.

Critério de aceite:

- projeto entendível por outra pessoa;
- comandos claros;
- decisões documentadas;
- GitHub apresentável.

---

## 30. Critérios de sucesso do projeto

Projeto bem-sucedido quando:

- usuário cadastra;
- usuário loga;
- usuário cria link curto;
- usuário compartilha link curto;
- endpoint público redireciona corretamente;
- cliques são registrados;
- dashboard exibe analytics;
- usuário não acessa dados de terceiro;
- Redis usado para cache + rate limit;
- PostgreSQL persiste dados;
- frontend consome API real;
- README completo;
- testes relevantes;
- documentação técnica suficiente.

---

## 31. Scripts sugeridos no monorepo

### `package.json` da raiz

```json
{
  "name": "linkpulse",
  "private": true,
  "workspaces": [
    "apps/api",
    "apps/web",
    "packages/shared"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=apps/api & npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "dev:web": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

Obs: no Windows, script com `&` pode precisar de `concurrently`.

Sugestão:

```bash
npm install -D concurrently
```

Script alternativo:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=apps/api\" \"npm run dev --workspace=apps/web\""
  }
}
```

---

## 32. Bibliotecas sugeridas

### Backend

```bash
npm install express cors helmet zod bcrypt jsonwebtoken dotenv @prisma/client ioredis
npm install -D typescript tsx prisma vitest supertest @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/supertest
```

### Frontend

```bash
npm install react-router-dom @tanstack/react-query axios react-hook-form zod @hookform/resolvers recharts lucide-react sonner
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### UI

```bash
npm install tailwindcss
```

`shadcn/ui` deve seguir docs oficiais na hora de implantar.

---

## 33. Riscos técnicos

### Risco 1: Escopo crescer demais

Mitigação:

- manter V2 fora do MVP;
- priorizar backend funcional;
- analytics básico primeiro.

### Risco 2: Redis complicar o fluxo

Mitigação:

- primeiro sem Redis;
- adicionar Redis depois que redirect funcionar;
- PostgreSQL segue fonte de verdade.

### Risco 3: Frontend consumir endpoints ainda instáveis

Mitigação:

- documentar contrato API;
- criar Swagger;
- estabilizar endpoints principais antes do frontend completo.

### Risco 4: Regras de autorização falharem

Mitigação:

- endpoints privados sempre filtram por `userId`;
- testes para acesso indevido;
- nunca buscar link só por `id` sem validar dono.

### Risco 5: Analytics ficar inconsistente

Mitigação:

- registrar evento no banco;
- incrementar contador no mesmo fluxo;
- documentar trade-off se não usar transação no começo.

---

## 34. Trade-offs principais

### Monólito modular vs microserviços

Escolha: monólito modular.

Motivo:

- domínio pequeno;
- menor custo operacional;
- melhor para portfólio júnior;
- organização sem complexidade distribuída.

### Prisma vs SQL puro

Escolha: Prisma.

Motivo:

- produtividade;
- tipagem;
- migrations;
- facilidade com TypeScript.

Trade-off:

- menos controle fino em query complexa.

### Redis como cache vs banco principal

Escolha: Redis só para cache + rate limit.

Motivo:

- Redis rápido, mas não deve virar fonte de verdade do analytics MVP.

### JWT simples vs refresh token

Escolha: JWT simples no MVP.

Motivo:

- menos complexidade;
- suficiente para portfólio.

Trade-off:

- controle de sessão menos robusto.

### Backend redirect vs frontend redirect

Escolha: backend redirect.

Motivo:

- mais rápido;
- mais correto tecnicamente;
- analytics, cache, rate limit vivem no servidor.

---

## 35. Como apresentar no LinkedIn

### Texto sugerido

```txt
Estou desenvolvendo o LinkPulse, uma aplicação fullstack para encurtamento, gerenciamento e análise de links.

A ideia do projeto é ir além de um CRUD tradicional, trabalhando conceitos mais próximos de uma aplicação real: autenticação, redirecionamento HTTP, analytics, cache, rate limit, paginação, filtros, validação de dados, testes e documentação.

Stack utilizada:

Backend:
Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, Zod, JWT e bcrypt.

Frontend:
React, TypeScript, Vite, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui e Recharts.

Arquitetura:
Monorepo com backend em monólito modular e frontend organizado por features.

O projeto tem como objetivo praticar integração fullstack, modelagem de domínio, segurança básica, performance com cache e organização de código em um cenário mais próximo do mercado.
```

---

## 36. Nome do repositório

Opção recomendada:

```txt
linkpulse
```

Alternativas:

```txt
linkpulse-fullstack
linkpulse-url-shortener
linkpulse-url-shortener-analytics
```

Melhor escolha:

```txt
linkpulse
```

Motivo:

- curto;
- limpo;
- cara de produto;
- fácil para LinkedIn + GitHub.

---

## 37. Resumo executivo

**LinkPulse** será app fullstack monorepo para encurtamento de links com analytics.

Backend: **Node.js, Express, TypeScript**, **PostgreSQL**, **Prisma**, **Zod**, **JWT**, **Redis**.

Frontend: **React, TypeScript**, **React Router**, **TanStack Query**, **Axios**, **React Hook Form**, **Zod**, **Tailwind CSS**, **shadcn/ui**, **Recharts**.

Arquitetura:

- monorepo com npm workspaces;
- backend em monólito modular;
- frontend por features;
- camada API separada no frontend;
- docs técnicas em `/docs`.

MVP inclui:

- cadastro;
- login;
- criação de links;
- alias customizado;
- expiração;
- limite de cliques;
- redirecionamento;
- analytics básico;
- dashboard;
- cache;
- rate limit;
- paginação;
- filtros;
- testes;
- documentação.

Desenvolvimento por etapas: base monorepo, backend, auth, links, redirect, analytics, Redis, frontend, testes, docs finais.
