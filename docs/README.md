# LinkPulse

## Visão geral

**LinkPulse** é uma aplicação fullstack monorepo para encurtamento, gerenciamento e análise de links.

O sistema permite que usuários autenticados criem links curtos, configurem aliases customizados, definam data de expiração, limitem a quantidade máxima de cliques e acompanhem métricas de acesso por meio de um dashboard web.

A proposta é ir além de um CRUD tradicional, praticando conceitos reais de desenvolvimento backend e frontend: autenticação, autorização, redirecionamento HTTP, analytics baseado em eventos, cache com Redis, rate limit, paginação, filtros, validação, documentação de API, testes automatizados e organização fullstack em monorepo.

---

## Objetivo do projeto

Construir uma aplicação demonstrável para portfólio, com foco em práticas comuns de mercado para desenvolvimento web moderno.

O projeto deve demonstrar:

- construção de APIs REST;
- integração frontend-backend;
- modelagem de domínio;
- persistência com banco relacional;
- uso de ORM;
- validação de entrada;
- autenticação e segurança básica;
- separação de responsabilidades;
- arquitetura modular;
- consumo de API no frontend;
- cache e otimização de leitura;
- documentação técnica.

---

## Escopo do MVP

### Autenticação

- Cadastro de usuário.
- Login.
- Geração de token JWT.
- Hash de senha com bcrypt.
- Rota para obter o usuário autenticado.
- Proteção de rotas privadas.
- Logout no frontend.

### Gerenciamento de links

Usuários autenticados poderão:

- criar links encurtados;
- informar URL original;
- definir alias customizado opcional;
- definir título opcional;
- definir descrição opcional;
- definir data de expiração opcional;
- definir limite máximo de cliques opcional;
- listar links;
- buscar links por texto;
- filtrar links por status;
- visualizar detalhes de um link;
- editar dados de um link;
- ativar/desativar um link;
- excluir um link.

### Redirecionamento

Endpoint público:

```http
GET /r/:shortCode
```

O endpoint deve:

- buscar o link pelo código curto;
- validar existência;
- validar status ativo;
- validar expiração;
- validar limite de cliques;
- registrar evento de acesso;
- incrementar contador;
- redirecionar para a URL original com status `302`.

### Analytics

Métricas do MVP:

- total de cliques;
- cliques de hoje;
- cliques dos últimos 7 dias;
- gráfico de cliques por dia;
- últimos acessos;
- links mais acessados.

### Cache e rate limit

Redis será usado para:

- cache do fluxo de redirecionamento;
- rate limit em endpoints sensíveis.

PostgreSQL continuará sendo a fonte de verdade.

---

## Fora do escopo do MVP

- refresh token;
- login social;
- recuperação de senha;
- verificação de e-mail;
- autenticação de dois fatores;
- planos pagos;
- times/organizações;
- domínio customizado;
- QR Code;
- links protegidos por senha;
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

## Tech stack

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
- `apps/api`
- `apps/web`
- `packages/shared`
- `docs`

### Infra local

- Docker Compose
- PostgreSQL
- Redis

---

## Arquitetura

### Visão geral

```txt
linkpulse/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── shared/
├── docs/
├── docker-compose.yml
├── package.json
└── README.md
```

### Backend

O backend seguirá uma arquitetura de **monólito modular**.

Módulos principais:

- `auth`;
- `users`;
- `links`;
- `redirects`;
- `analytics`;
- `rate-limit`.

Fluxo base:

```txt
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database / Redis
```

### Frontend

O frontend seguirá **feature-based architecture**.

Features principais:

- `auth`;
- `dashboard`;
- `links`;
- `analytics`;
- `settings`.

Fluxo base:

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

---

## Estrutura sugerida

```txt
linkpulse/
│
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── shared/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── features/
│       │   ├── shared/
│       │   ├── styles/
│       │   └── main.tsx
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   └── shared/
│       ├── src/
│       └── package.json
│
├── docs/
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Entidades principais

### User

- `id`
- `name`
- `email`
- `passwordHash`
- `createdAt`
- `updatedAt`

### ShortLink

- `id`
- `userId`
- `originalUrl`
- `shortCode`
- `customAlias`
- `title`
- `description`
- `active`
- `expiresAt`
- `maxClicks`
- `clickCount`
- `createdAt`
- `updatedAt`
- `deletedAt`

### LinkAccessEvent

- `id`
- `shortLinkId`
- `accessedAt`
- `ipAddress`
- `userAgent`
- `referer`

---

## Scripts sugeridos

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "dev:api": "npm run dev -w apps/api",
    "dev:web": "npm run dev -w apps/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "prisma:generate": "npm run prisma:generate -w apps/api",
    "prisma:migrate": "npm run prisma:migrate -w apps/api",
    "prisma:studio": "npm run prisma:studio -w apps/api"
  }
}
```

---

## Como rodar localmente

```bash
git clone <repo-url>
cd linkpulse
npm install
docker compose up -d
npm run prisma:migrate -- --name init
npm run dev
```

URLs locais:

```txt
API: http://localhost:3000
WEB: http://localhost:5173
```

Swagger/OpenAPI:

```txt
Docs UI: http://localhost:3000/docs
```

Para autorizar endpoints protegidos no Swagger UI:
- FaÃ§a login em `POST /api/v1/auth/login`.
- Copie valor de `acessToken` retornado.
- Clique em **Authorize** no Swagger UI.
- Informe: `Bearer <seu_token>`.

---

## Variáveis de ambiente

### Backend

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

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=LinkPulse
```

---

## Endpoints principais

### Auth

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Links

```http
POST   /api/v1/links
GET    /api/v1/links
GET    /api/v1/links/:id
PATCH  /api/v1/links/:id
DELETE /api/v1/links/:id
PATCH  /api/v1/links/:id/activate
PATCH  /api/v1/links/:id/deactivate
```

### Redirect

```http
GET /r/:shortCode
```

### Analytics

```http
GET /api/v1/links/:id/analytics/summary
GET /api/v1/links/:id/analytics/clicks-by-day
GET /api/v1/links/:id/analytics/events
GET /api/v1/analytics/top-links
```

---

## Ordem recomendada de desenvolvimento

1. Setup do monorepo.
2. Backend base.
3. Prisma e modelagem do banco.
4. Autenticação.
5. CRUD de links.
6. Redirecionamento.
7. Analytics backend.
8. Redis e rate limit.
9. Swagger/OpenAPI.
10. Frontend base.
11. Autenticação no frontend.
12. Gerenciamento de links no frontend.
13. Analytics no frontend.
14. Testes.
15. Documentação e acabamento.

---

## Critérios de sucesso

O projeto será considerado funcional quando:

- usuário conseguir se cadastrar;
- usuário conseguir fazer login;
- usuário conseguir criar link curto;
- usuário conseguir acessar link curto publicamente;
- o backend redirecionar corretamente;
- cliques forem registrados;
- dashboard exibir métricas reais;
- usuário não conseguir acessar dados de outro usuário;
- Redis for usado para cache e rate limit;
- PostgreSQL persistir os dados;
- o frontend consumir a API real;
- o projeto tiver documentação suficiente para execução e avaliação.
