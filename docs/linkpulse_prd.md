# PRD — LinkPulse

## 1. Visão geral

### Nome do projeto

**LinkPulse**

### Tipo de projeto

Aplicação **fullstack monorepo** para encurtamento, gerenciamento e análise de links.

### Descrição curta

O **LinkPulse** é uma plataforma fullstack de encurtamento de links com analytics. O sistema permite que usuários autenticados criem links curtos, configurem aliases customizados, definam expiração, limitem cliques e acompanhem métricas de acesso por meio de um dashboard web.

### Descrição para portfólio

O **LinkPulse** é uma aplicação fullstack desenvolvida em arquitetura monorepo, com backend em **Node.js, Express e TypeScript**, frontend em **React e TypeScript**, banco de dados **PostgreSQL**, ORM **Prisma** e **Redis** para cache e rate limit.

O projeto tem como objetivo praticar conceitos reais de desenvolvimento backend e frontend, incluindo autenticação, autorização, modelagem de domínio, redirecionamento HTTP, analytics baseado em eventos, cache, paginação, filtros, validação de dados, documentação de API, testes automatizados e organização de código em monorepo.

---

## 2. Objetivo do produto

Criar uma aplicação completa onde usuários possam:

- cadastrar uma conta;
- fazer login;
- criar links encurtados;
- configurar regras para cada link;
- compartilhar links curtos;
- acompanhar métricas de acesso;
- visualizar gráficos e tabelas de analytics;
- gerenciar seus links em uma interface web.

O projeto deve demonstrar domínio prático de desenvolvimento fullstack moderno, sem cair em um CRUD genérico.

---

## 3. Problema que o projeto resolve

Links longos são difíceis de compartilhar, acompanhar e controlar. Em muitos casos, usuários precisam saber:

- quantas pessoas acessaram um link;
- quando os acessos aconteceram;
- quais links performaram melhor;
- se um link deve expirar em determinada data;
- se um link deve aceitar apenas uma quantidade limitada de cliques;
- como gerenciar vários links em um painel organizado.

O LinkPulse resolve esse problema oferecendo uma plataforma simples para encurtamento de links com controle e analytics.

---

## 4. Público-alvo

### Usuário principal

Criadores de conteúdo, estudantes, desenvolvedores, profissionais de marketing, pequenos negócios ou qualquer usuário que precise compartilhar links curtos e acompanhar acessos.

### Usuário técnico do projeto

Recrutadores, tech leads e avaliadores técnicos que irão analisar o projeto como portfólio.

O projeto deve deixar claro que o desenvolvedor entende:

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

O MVP deve ser funcional, demonstrável e bem documentado.

### Funcionalidades incluídas no MVP

#### Autenticação

- Cadastro de usuário.
- Login.
- Autenticação com JWT.
- Hash de senha com bcrypt.
- Rota `/me` para obter dados do usuário autenticado.
- Middleware de autenticação.
- Proteção de rotas privadas.

#### Gerenciamento de links

Usuários autenticados poderão:

- criar links curtos;
- informar URL original;
- definir alias customizado opcional;
- definir título opcional;
- definir descrição opcional;
- definir data de expiração opcional;
- definir limite máximo de cliques opcional;
- listar seus links;
- filtrar links;
- paginar links;
- visualizar detalhes de um link;
- editar informações do link;
- ativar ou desativar um link;
- excluir um link.

#### Redirecionamento

O sistema deve expor um endpoint público para redirecionamento:

```http
GET /r/:shortCode
```

Comportamento esperado:

- se o link existir e estiver válido, redirecionar para a URL original;
- se o link não existir, retornar erro;
- se o link estiver expirado, retornar erro;
- se o link estiver desativado, retornar erro;
- se o link tiver atingido o limite máximo de cliques, retornar erro;
- se o IP exceder o limite de requisições, retornar erro de rate limit.

#### Analytics básico

O sistema deve registrar eventos de clique.

Para cada clique válido, registrar:

- ID do link;
- data e hora do acesso;
- endereço IP, se disponível;
- user-agent;
- referer, se disponível.

O usuário poderá visualizar:

- total de cliques por link;
- cliques de hoje;
- cliques dos últimos 7 dias;
- gráfico de cliques por dia;
- últimos acessos;
- links mais acessados.

#### Redis

Redis será usado para:

- cache de redirecionamento;
- rate limit.

O PostgreSQL continua sendo a fonte de verdade dos dados.

#### Frontend

O frontend deve permitir:

- cadastro;
- login;
- logout;
- proteção de rotas privadas;
- visualização de dashboard;
- criação de links;
- listagem de links;
- filtros;
- paginação;
- edição de links;
- ativação/desativação;
- exclusão;
- cópia do link curto;
- visualização de analytics em cards, tabela e gráfico.

---

## 6. Fora do escopo do MVP

Os itens abaixo não devem ser implementados na primeira versão, para evitar aumento excessivo de complexidade:

- refresh token;
- login social;
- recuperação de senha;
- verificação de e-mail;
- autenticação de dois fatores;
- planos pagos;
- times/organizações;
- domínio customizado;
- links protegidos por senha;
- QR Code;
- geolocalização por IP;
- detecção avançada de bots;
- analytics em tempo real;
- webhooks;
- exportação CSV;
- microserviços;
- Kafka;
- RabbitMQ;
- CQRS completo.

---

## 7. Funcionalidades para V2

Depois do MVP, o projeto pode evoluir com:

- QR Code para cada link;
- tags por link;
- campanhas;
- grupos de links;
- exportação de analytics em CSV;
- analytics por país e cidade;
- identificação de navegador e sistema operacional;
- links protegidos por senha;
- expiração por tempo e por clique;
- customização de domínio;
- webhooks;
- painel administrativo;
- recuperação de senha;
- refresh token;
- login com Google;
- tela pública de erro personalizada para links expirados ou inválidos.

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

Essa estrutura separa claramente:

- backend;
- frontend;
- código compartilhado;
- documentação;
- infraestrutura local.

O uso de `apps/api` e `apps/web` deixa o projeto com aparência profissional e facilita evolução futura.

---

## 10. Arquitetura do backend

### Modelo arquitetural

O backend seguirá um **monólito modular**, organizado por módulos de negócio.

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

Definem os endpoints e conectam middlewares aos controllers.

#### Controllers

Recebem a requisição HTTP e chamam os services. Não devem conter regra de negócio pesada.

#### Services

Concentram regras de negócio e orquestração.

#### Repositories

Isolam acesso ao banco de dados via Prisma.

#### Schemas

Validam body, params e query com Zod.

#### Middlewares

Cuidam de autenticação, validação, tratamento de erro e rate limit.

---

## 11. Arquitetura do frontend

### Modelo arquitetural

O frontend seguirá **feature-based architecture**, com camada de API separada e TanStack Query para gerenciamento de estado assíncrono.

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

Essa estrutura evita que o projeto vire uma mistura de componentes, páginas e serviços sem organização. Cada domínio do frontend fica agrupado por feature.

---

## 12. Modelagem de domínio

### Entidade: User

Representa o usuário da plataforma.

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

- e-mail deve ser único;
- senha deve ser armazenada com hash;
- usuário só pode acessar os próprios links;
- usuário não pode consultar analytics de links de outros usuários.

---

### Entidade: ShortLink

Representa um link encurtado.

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

- `originalUrl` é obrigatório;
- `originalUrl` deve ser uma URL válida;
- `shortCode` deve ser único;
- `customAlias`, quando informado, deve ser único;
- `customAlias` deve aceitar apenas letras, números, hífen e underscore;
- link pode ter data de expiração;
- link pode ter limite máximo de cliques;
- link pode ser ativado ou desativado;
- link excluído não deve aparecer em listagens comuns;
- link expirado não deve redirecionar;
- link inativo não deve redirecionar;
- link que atingiu o limite máximo de cliques não deve redirecionar.

---

### Entidade: LinkAccessEvent

Representa um evento de acesso a um link.

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

- deve ser criado quando um link válido for acessado;
- deve estar associado a um link existente;
- deve ser usado para gerar métricas e gráficos.

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

- nome é obrigatório;
- e-mail é obrigatório;
- e-mail deve ser válido;
- e-mail não pode estar em uso;
- senha deve ter tamanho mínimo definido;
- senha deve ser salva com hash bcrypt.

---

### Login

#### Entrada

- e-mail;
- senha.

#### Regras

- validar se o usuário existe;
- comparar senha com bcrypt;
- gerar JWT;
- retornar token e dados básicos do usuário.

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

- usuário precisa estar autenticado;
- URL original deve ser válida;
- se o alias for informado, validar formato e unicidade;
- se o alias não for informado, gerar `shortCode`;
- `shortCode` gerado deve ser único;
- `maxClicks`, se informado, deve ser maior que zero;
- `expiresAt`, se informado, deve ser uma data futura;
- link deve iniciar como ativo;
- retornar URL curta completa.

---

### Redirecionamento

#### Endpoint público

```http
GET /r/:shortCode
```

#### Regras

- aplicar rate limit por IP;
- buscar link no Redis;
- se não encontrar no Redis, buscar no PostgreSQL;
- se encontrar no PostgreSQL, salvar no Redis;
- validar se o link existe;
- validar se não foi excluído;
- validar se está ativo;
- validar se não está expirado;
- validar se não atingiu limite máximo de cliques;
- registrar evento de acesso;
- incrementar contador de cliques;
- redirecionar com `302 Found`.

---

### Atualização de link

#### Regras

- usuário precisa estar autenticado;
- link precisa pertencer ao usuário;
- permitir atualizar título, descrição, expiração, limite de cliques e status;
- se alterar alias ou shortCode, validar unicidade;
- invalidar cache do Redis após alteração.

---

### Exclusão de link

#### Regras

- usuário precisa estar autenticado;
- link precisa pertencer ao usuário;
- preferencialmente usar soft delete;
- invalidar cache no Redis;
- link excluído não deve redirecionar.

---

### Analytics

#### Regras

- usuário só pode consultar analytics dos próprios links;
- dados devem vir do PostgreSQL;
- métricas devem ser agregadas por consultas;
- o frontend deve exibir cards, gráfico e tabela.

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

Toda resposta de erro deve seguir formato consistente.

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

O backend deve ter um middleware centralizado para:

- capturar erros esperados;
- capturar erros de validação do Zod;
- capturar erros inesperados;
- evitar vazamento de stack trace em produção;
- padronizar respostas.

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

- se o link tiver `expiresAt`, usar TTL baseado no tempo restante;
- se não tiver expiração, usar TTL padrão, por exemplo 1 hora.

#### Invalidação

Invalidar cache quando:

- link for editado;
- link for desativado;
- link for ativado;
- link for excluído;
- limite máximo de cliques for alterado.

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

- senhas com bcrypt;
- JWT assinado com segredo forte;
- segredo armazenado em variável de ambiente;
- validação de entrada com Zod;
- middleware global de erro;
- rate limit;
- CORS configurado;
- Helmet para headers básicos de segurança;
- impedir acesso a links de outros usuários;
- não retornar `passwordHash` em nenhuma resposta;
- não expor stack trace em produção.

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

DATABASE_URL=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse
DATABASE_URL_TEST=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse_test

REDIS_URL=redis://localhost:6379

JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1h

APP_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

REDIRECT_CACHE_TTL_SECONDS=3600

RATE_LIMIT_REDIRECT_MAX=100
RATE_LIMIT_REDIRECT_WINDOW_SECONDS=60

RATE_LIMIT_LOGIN_MAX=10
RATE_LIMIT_LOGIN_WINDOW_SECONDS=60

RATE_LIMIT_REGISTER_MAX=5
RATE_LIMIT_REGISTER_WINDOW_SECONDS=3600

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
      - "55432:5432"
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

Para o MVP, é suficiente subir PostgreSQL e Redis pelo Docker e rodar backend/frontend localmente com npm.

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

O redirecionamento `/r/:shortCode` deve ficar no backend, não no frontend.

Motivo:

- é mais rápido;
- é mais correto para HTTP redirect;
- não depende de carregar React;
- permite registrar analytics no backend;
- permite aplicar cache e rate limit.

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
- confirmação de senha, opcional no MVP.

Ações:

- criar conta;
- ir para login.

Validações:

- nome obrigatório;
- e-mail válido;
- senha com tamanho mínimo.

---

### Dashboard

Cards:

- total de links;
- total de cliques;
- links ativos;
- links expirados;
- cliques nos últimos 7 dias.

Seções:

- gráfico de cliques por dia;
- links mais acessados;
- últimos acessos.

---

### Página de links

Elementos:

- botão “Novo link”;
- campo de busca;
- filtro por status;
- tabela de links;
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
- cliques nos últimos 7 dias;
- último acesso;
- gráfico de cliques por dia;
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

O frontend deve tratar:

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

- deve cadastrar usuário;
- não deve cadastrar e-mail duplicado;
- deve fazer login com credenciais válidas;
- não deve fazer login com senha inválida;
- deve retornar usuário autenticado.

#### Links

- deve criar link autenticado;
- não deve criar link com URL inválida;
- não deve permitir alias duplicado;
- deve listar apenas links do usuário autenticado;
- deve atualizar link do próprio usuário;
- não deve atualizar link de outro usuário;
- deve desativar link;
- deve excluir link.

#### Redirect

- deve redirecionar link válido;
- deve retornar 404 para shortCode inexistente;
- deve bloquear link expirado;
- deve bloquear link inativo;
- deve bloquear link que atingiu maxClicks;
- deve incrementar clickCount;
- deve registrar evento de analytics.

#### Analytics

- deve retornar resumo de analytics;
- deve retornar cliques por dia;
- deve retornar últimos eventos;
- deve impedir analytics de links de outro usuário.

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
- `CopyShortUrlButton` executa ação de copiar;
- `ProtectedRoute` bloqueia usuário sem token;
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
- estrutura do monorepo;
- como rodar localmente;
- variáveis de ambiente;
- endpoints principais;
- prints ou GIFs da interface;
- decisões técnicas;
- roadmap;
- testes;
- próximos passos.

---

## 28. Decisões arquiteturais para documentar

### Decisão 1: Monorepo

O projeto usa monorepo para manter backend, frontend, código compartilhado e documentação no mesmo repositório.

#### Trade-off

Vantagens:

- facilita avaliação do projeto;
- centraliza documentação;
- facilita desenvolvimento local;
- melhora organização fullstack.

Desvantagens:

- exige cuidado com scripts;
- pode ficar grande com o tempo;
- deploy de frontend e backend continua separado.

---

### Decisão 2: Backend em monólito modular

O backend usa monólito modular porque o domínio ainda não justifica microserviços.

#### Trade-off

Vantagens:

- menor complexidade operacional;
- deploy simples;
- desenvolvimento mais rápido;
- organização por módulos;
- fácil de testar.

Desvantagens:

- todos os módulos escalam juntos;
- exige disciplina para evitar acoplamento excessivo;
- não há isolamento físico entre domínios.

---

### Decisão 3: Frontend feature-based

O frontend é organizado por features para evitar estrutura genérica e difícil de manter.

#### Trade-off

Vantagens:

- domínios ficam agrupados;
- melhora manutenção;
- reduz pasta global de componentes;
- facilita evolução.

Desvantagens:

- exige disciplina para decidir o que é shared;
- pode gerar duplicação leve no início.

---

### Decisão 4: PostgreSQL como fonte de verdade

PostgreSQL será usado como banco principal.

#### Trade-off

Vantagens:

- relacional;
- confiável;
- bom para filtros e analytics;
- muito usado no mercado.

Desvantagens:

- analytics muito pesados podem exigir otimizações futuras;
- exige modelagem adequada e índices.

---

### Decisão 5: Redis apenas para cache e rate limit

Redis não será fonte de verdade de analytics.

#### Trade-off

Vantagens:

- melhora performance do redirecionamento;
- permite rate limit eficiente;
- mantém dados confiáveis no PostgreSQL.

Desvantagens:

- exige invalidação de cache;
- adiciona uma dependência de infraestrutura;
- precisa tratar falha do Redis com cuidado.

---

## 29. Ordem recomendada de desenvolvimento

### Fase 1 — Setup do monorepo

Objetivo: criar a base do projeto.

Tarefas:

- criar repositório `linkpulse`;
- configurar npm workspaces;
- criar `apps/api`;
- criar `apps/web`;
- criar `packages/shared`;
- criar `docs`;
- configurar TypeScript no backend;
- configurar Vite React no frontend;
- criar Docker Compose com PostgreSQL e Redis;
- criar `.env.example`.

Critério de aceite:

- backend inicia;
- frontend inicia;
- Docker Compose sobe PostgreSQL e Redis;
- estrutura do monorepo está funcionando.

---

### Fase 2 — Backend base

Objetivo: preparar API Express com estrutura modular.

Tarefas:

- configurar Express;
- configurar middlewares globais;
- configurar CORS;
- configurar Helmet;
- configurar tratamento global de erro;
- configurar Zod para validação;
- configurar Prisma;
- conectar no PostgreSQL;
- configurar Redis;
- criar health check.

Endpoint inicial:

```http
GET /health
```

Critério de aceite:

- API responde `/health`;
- Prisma conecta no banco;
- Redis conecta;
- erros são padronizados.

---

### Fase 3 — Modelagem e migrations

Objetivo: criar estrutura do banco.

Tarefas:

- criar schema Prisma;
- criar modelo `User`;
- criar modelo `ShortLink`;
- criar modelo `LinkAccessEvent`;
- gerar migration;
- rodar migration;
- criar seed opcional.

Critério de aceite:

- tabelas criadas no PostgreSQL;
- Prisma Client gerado;
- aplicação acessa o banco.

---

### Fase 4 — Autenticação

Objetivo: implementar auth completa do MVP.

Tarefas:

- criar cadastro;
- criar login;
- implementar bcrypt;
- implementar JWT;
- criar middleware de autenticação;
- criar rota `/me`;
- proteger rotas privadas.

Endpoints:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

Critério de aceite:

- usuário cadastra;
- usuário faz login;
- token é retornado;
- rota privada exige token;
- senha não aparece em resposta.

---

### Fase 5 — Links core

Objetivo: implementar CRUD principal de links.

Tarefas:

- criar módulo de links;
- criar schemas Zod;
- criar repository;
- criar service;
- criar controller;
- gerar shortCode;
- validar alias;
- validar URL;
- criar listagem paginada;
- criar filtros;
- criar edição;
- criar ativação/desativação;
- criar exclusão com soft delete.

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

- usuário cria link;
- usuário lista somente seus links;
- usuário edita somente seus links;
- usuário exclui somente seus links;
- alias duplicado é bloqueado.

---

### Fase 6 — Redirecionamento

Objetivo: criar endpoint público de redirect.

Tarefas:

- criar módulo de redirects;
- implementar busca por `shortCode`;
- validar link ativo;
- validar expiração;
- validar limite de cliques;
- incrementar contador;
- registrar evento de acesso;
- retornar redirect 302.

Endpoint:

```http
GET /r/:shortCode
```

Critério de aceite:

- link válido redireciona;
- link inexistente retorna 404;
- link expirado retorna 410;
- link desativado retorna erro;
- link com maxClicks atingido retorna 410;
- clique válido incrementa contador;
- clique válido gera evento de analytics.

---

### Fase 7 — Analytics backend

Objetivo: expor métricas para o frontend.

Tarefas:

- criar módulo de analytics;
- criar resumo por link;
- criar cliques por dia;
- criar últimos acessos;
- criar top links;
- garantir ownership.

Endpoints:

```http
GET /api/v1/links/:id/analytics/summary
GET /api/v1/links/:id/analytics/clicks-by-day
GET /api/v1/links/:id/analytics/events
GET /api/v1/analytics/top-links
```

Critério de aceite:

- usuário consulta analytics dos próprios links;
- usuário não acessa analytics de outro usuário;
- dados agregados são retornados corretamente.

---

### Fase 8 — Redis e rate limit

Objetivo: adicionar performance e proteção.

Tarefas:

- implementar cache de redirect;
- salvar link no Redis após consulta ao banco;
- invalidar cache após alteração;
- implementar rate limit por IP em redirect;
- implementar rate limit em login;
- implementar rate limit em criação de link.

Critério de aceite:

- redirect usa cache;
- cache é invalidado em alterações;
- excesso de requisições retorna 429;
- falha no Redis não deve derrubar completamente a API, quando possível.

---

### Fase 9 — Swagger/OpenAPI

Objetivo: documentar a API.

Tarefas:

- configurar Swagger;
- documentar endpoints;
- documentar schemas;
- documentar autenticação JWT;
- documentar exemplos de request/response.

Endpoint sugerido:

```http
GET /docs
```

Critério de aceite:

- documentação abre no navegador;
- endpoints principais estão documentados;
- schemas aparecem corretamente;
- autenticação JWT pode ser testada.

---

### Fase 10 — Frontend base

Objetivo: criar estrutura visual e integração base.

Tarefas:

- configurar React Router;
- configurar TanStack Query;
- configurar Axios;
- configurar Tailwind;
- configurar shadcn/ui;
- criar layout autenticado;
- criar sidebar;
- criar header;
- criar páginas vazias;
- criar ProtectedRoute.

Critério de aceite:

- navegação funciona;
- layout principal existe;
- rota privada bloqueia usuário sem token;
- Axios usa base URL correta.

---

### Fase 11 — Auth frontend

Objetivo: integrar autenticação no frontend.

Tarefas:

- criar tela de login;
- criar tela de cadastro;
- integrar com backend;
- salvar token;
- implementar logout;
- tratar erro 401;
- redirecionar usuário autenticado.

Critério de aceite:

- usuário cadastra pela interface;
- usuário faz login pela interface;
- token é usado nas chamadas;
- logout remove sessão.

---

### Fase 12 — Links frontend

Objetivo: permitir gerenciamento de links pela interface.

Tarefas:

- criar página de listagem;
- criar tabela;
- criar filtros;
- criar paginação;
- criar formulário de criação;
- criar página de detalhes;
- criar formulário de edição;
- criar ações de ativar/desativar;
- criar ação de excluir;
- criar botão de copiar link.

Critério de aceite:

- usuário cria link pela interface;
- usuário lista links;
- usuário filtra links;
- usuário edita link;
- usuário copia link curto;
- usuário exclui link.

---

### Fase 13 — Analytics frontend

Objetivo: exibir métricas no dashboard.

Tarefas:

- criar cards de métricas;
- criar gráfico de cliques por dia com Recharts;
- criar tabela de últimos acessos;
- criar top links;
- criar dashboard principal;
- criar página de analytics por link.

Critério de aceite:

- dashboard mostra dados reais;
- gráfico renderiza cliques por dia;
- tabela mostra últimos eventos;
- página de analytics funciona por link.

---

### Fase 14 — Testes

Objetivo: aumentar confiabilidade do projeto.

Tarefas backend:

- testar auth;
- testar links;
- testar redirect;
- testar analytics;
- testar middlewares.

Tarefas frontend:

- testar formulários;
- testar ProtectedRoute;
- testar componentes principais;
- testar renderização de tabela e cards.

Critério de aceite:

- testes principais passam;
- erros críticos estão cobertos;
- projeto demonstra preocupação com qualidade.

---

### Fase 15 — Documentação e acabamento

Objetivo: preparar o projeto para portfólio.

Tarefas:

- finalizar README;
- criar docs de arquitetura;
- criar docs de decisões técnicas;
- criar docs do banco;
- adicionar prints/GIFs;
- adicionar exemplos de `.env`;
- revisar nomes de arquivos;
- revisar mensagens de erro;
- revisar UX;
- revisar responsividade;
- preparar post para LinkedIn.

Critério de aceite:

- projeto pode ser entendido por outra pessoa;
- comandos de execução estão claros;
- decisões técnicas estão documentadas;
- projeto está apresentável no GitHub.

---

## 30. Critérios de sucesso do projeto

O projeto será considerado bem-sucedido quando:

- usuário conseguir se cadastrar;
- usuário conseguir fazer login;
- usuário conseguir criar link curto;
- usuário conseguir compartilhar link curto;
- endpoint público redirecionar corretamente;
- cliques forem registrados;
- dashboard exibir analytics;
- usuário não conseguir acessar dados de outro usuário;
- Redis for usado para cache e rate limit;
- PostgreSQL persistir dados;
- frontend consumir API real;
- projeto tiver README completo;
- projeto tiver testes relevantes;
- projeto tiver documentação técnica suficiente.

---

## 31. Scripts do monorepo

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
    "dev": "concurrently -k \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm run dev -w apps/api",
    "dev:web": "npm run dev -w apps/web",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces",
    "test": "npm run test --workspaces"
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

shadcn/ui deve ser configurado conforme documentação oficial durante a implementação.

---

## 33. Riscos técnicos

### Risco 1: Escopo crescer demais

Mitigação:

- manter V2 fora do MVP;
- priorizar backend funcional;
- implementar analytics básico primeiro.

### Risco 2: Redis complicar o fluxo

Mitigação:

- implementar primeiro sem Redis;
- adicionar Redis depois que redirect funcionar;
- manter PostgreSQL como fonte de verdade.

### Risco 3: Frontend consumir endpoints ainda instáveis

Mitigação:

- documentar contrato da API;
- criar Swagger;
- estabilizar endpoints principais antes do frontend completo.

### Risco 4: Regras de autorização falharem

Mitigação:

- todos os endpoints privados devem filtrar por `userId`;
- criar testes para acesso indevido;
- nunca buscar link apenas por `id` sem validar dono.

### Risco 5: Analytics ficar inconsistente

Mitigação:

- registrar evento no banco;
- incrementar contador de cliques no mesmo fluxo;
- documentar trade-off caso não use transação no começo.

---

## 34. Trade-offs principais

### Monólito modular vs microserviços

Escolha: monólito modular.

Motivo:

- domínio pequeno;
- menor custo operacional;
- mais adequado para portfólio júnior;
- mantém organização sem complexidade distribuída.

### Prisma vs SQL puro

Escolha: Prisma.

Motivo:

- produtividade;
- tipagem;
- migrations;
- facilidade com TypeScript.

Trade-off:

- menos controle fino em queries complexas.

### Redis como cache vs banco principal

Escolha: Redis apenas como cache e rate limit.

Motivo:

- Redis é rápido, mas não deve ser fonte de verdade para analytics no MVP.

### JWT simples vs refresh token

Escolha: JWT simples no MVP.

Motivo:

- reduz complexidade;
- suficiente para projeto de portfólio.

Trade-off:

- controle de sessão menos robusto.

### Backend redirect vs frontend redirect

Escolha: backend redirect.

Motivo:

- mais rápido;
- tecnicamente mais correto;
- permite cache, rate limit e analytics diretamente no servidor.

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
- com aparência de produto;
- fácil de usar no LinkedIn e GitHub.

---

## 37. Resumo executivo

O **LinkPulse** será uma aplicação fullstack monorepo para encurtamento de links com analytics.

O backend será construído com **Node.js, Express e TypeScript**, usando **PostgreSQL** como banco principal, **Prisma** como ORM, **Zod** para validação, **JWT** para autenticação e **Redis** para cache e rate limit.

O frontend será construído com **React e TypeScript**, usando **React Router**, **TanStack Query**, **Axios**, **React Hook Form**, **Zod**, **Tailwind CSS**, **shadcn/ui** e **Recharts**.

A arquitetura será composta por:

- monorepo com npm workspaces;
- backend em monólito modular;
- frontend por features;
- camada de API separada no frontend;
- documentação técnica em `/docs`.

O MVP incluirá:

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

Este projeto deve ser desenvolvido em etapas, começando pela base do monorepo e backend, depois autenticação, links, redirect, analytics, Redis, frontend, testes e documentação final.
