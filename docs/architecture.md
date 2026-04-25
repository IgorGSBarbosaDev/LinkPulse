# Architecture — LinkPulse

## 1. Visão geral arquitetural

O **LinkPulse** será uma aplicação **fullstack monorepo**, contendo:

- backend em Node.js, Express e TypeScript;
- frontend em React e TypeScript;
- banco de dados PostgreSQL;
- ORM Prisma;
- Redis para cache e rate limit;
- pacote compartilhado para tipos, schemas ou constantes reutilizáveis;
- documentação técnica em `/docs`.

A arquitetura foi definida para equilibrar simplicidade, organização e aderência a práticas reais de mercado.

---

## 2. Objetivos arquiteturais

A arquitetura deve permitir:

- desenvolvimento local simples;
- separação clara entre frontend e backend;
- modularidade no backend;
- organização por features no frontend;
- facilidade para testes;
- evolução futura sem reescrita completa;
- baixa complexidade operacional;
- clareza para avaliação em portfólio.

---

## 3. Estrutura do monorepo

```txt
linkpulse/
│
├── apps/
│   ├── api/
│   └── web/
│
├── packages/
│   └── shared/
│
├── docs/
├── docker-compose.yml
├── package.json
└── README.md
```

### Responsabilidades

#### `apps/api`

Contém API REST, regras de negócio, autenticação, integração com PostgreSQL, Prisma, Redis, rate limit e documentação OpenAPI.

#### `apps/web`

Contém aplicação React, telas, componentes, hooks, consumo da API, formulários e dashboard.

#### `packages/shared`

Pode conter tipos, constantes e schemas compartilhados quando fizer sentido. O pacote não deve virar uma dependência artificial.

#### `docs`

Contém documentação técnica do projeto.

---

## 4. Arquitetura do backend

### Padrão escolhido

O backend seguirá um **monólito modular**.

A aplicação será implantada como uma única API, mas o código será organizado em módulos de domínio.

### Por que monólito modular?

O domínio do LinkPulse não justifica microserviços no MVP. Separar autenticação, links, analytics e redirecionamento em serviços independentes aumentaria a complexidade operacional sem trazer benefício proporcional.

O monólito modular permite:

- deploy simples;
- organização por domínio;
- menor acoplamento;
- facilidade de testes;
- evolução gradual.

---

## 5. Estrutura backend recomendada

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

---

## 6. Módulos do backend

### Auth

Responsável por:

- cadastro;
- login;
- geração de JWT;
- validação de credenciais;
- rota do usuário autenticado.

Não deve conter lógica de links ou analytics.

### Users

Responsável por:

- persistência de usuários;
- busca por e-mail;
- busca por ID;
- regras auxiliares relacionadas a usuário.

Não deve expor senha ou hash de senha para o frontend.

### Links

Responsável por:

- criação de link;
- validação de alias;
- geração de short code;
- listagem;
- filtros;
- paginação;
- edição;
- ativação/desativação;
- exclusão;
- regras de ownership.

### Redirects

Responsável por:

- receber acessos públicos em `/r/:shortCode`;
- buscar link em cache ou banco;
- validar se o link pode redirecionar;
- acionar registro de analytics;
- incrementar contador;
- responder com redirect HTTP.

### Analytics

Responsável por:

- registrar eventos de acesso;
- consultar total de cliques;
- consultar cliques por dia;
- consultar últimos acessos;
- consultar top links;
- garantir que usuário só consulte analytics dos próprios links.

### Rate Limit

Responsável por:

- limitar acessos por IP;
- limitar tentativas de login;
- limitar criação de links;
- usar Redis como armazenamento de contadores temporários.

---

## 7. Fluxos internos

### Requisição privada

```txt
HTTP request
  ↓
Route
  ↓
Auth middleware
  ↓
Validation middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

### Redirecionamento

```txt
GET /r/:shortCode
  ↓
Rate limit por IP
  ↓
Buscar no Redis
  ↓
Se cache miss, buscar no PostgreSQL
  ↓
Validar existência
  ↓
Validar active
  ↓
Validar expiresAt
  ↓
Validar maxClicks
  ↓
Registrar LinkAccessEvent
  ↓
Incrementar clickCount
  ↓
Responder 302 Location: originalUrl
```

---

## 8. Arquitetura do frontend

### Padrão escolhido

O frontend seguirá **feature-based architecture**.

### Estrutura recomendada

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
│   ├── dashboard/
│   ├── links/
│   └── analytics/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── utils/
│
├── styles/
│   └── globals.css
│
└── main.tsx
```

---

## 9. Camadas do frontend

### `app`

Configuração global:

- router;
- providers;
- query client;
- composição global.

### `features`

Módulos de interface ligados ao domínio:

- auth;
- dashboard;
- links;
- analytics.

Cada feature pode conter:

```txt
api/
components/
hooks/
pages/
schemas/
types.ts
```

### `shared`

Código reutilizável e genérico:

- cliente Axios;
- componentes de layout;
- componentes de feedback;
- helpers;
- utilitários.

---

## 10. Fluxo de dados do frontend

```txt
Page
  ↓
Component
  ↓
Custom Hook
  ↓
TanStack Query
  ↓
API Client
  ↓
Backend
```

Exemplo:

```txt
LinksPage
  ↓
LinksTable
  ↓
useLinks
  ↓
linksApi.getLinks()
  ↓
GET /api/v1/links
```

---

## 11. Estratégia de estado

### Server state

Será gerenciado com **TanStack Query**:

- links;
- detalhes de link;
- analytics;
- usuário autenticado;
- top links.

### Local state

Usado para estado de interface:

- abertura de modal;
- valor temporário de filtro;
- estado de sidebar;
- feedback visual.

### Form state

Gerenciado com:

- React Hook Form;
- Zod;
- @hookform/resolvers.

---

## 12. Banco de dados

O banco principal será PostgreSQL.

O acesso será feito via Prisma.

Entidades do MVP:

- User;
- ShortLink;
- LinkAccessEvent.

PostgreSQL será a fonte de verdade.

---

## 13. Redis

Redis será usado para:

- cache de redirecionamento;
- rate limit.

Redis não será fonte de verdade de analytics.

---

## 14. Segurança

A arquitetura deve contemplar:

- JWT para autenticação;
- bcrypt para hash de senha;
- middleware de autenticação;
- validação de entrada com Zod;
- CORS configurado;
- Helmet;
- rate limit;
- padrão global de erro;
- autorização por ownership.

Regra central:

```txt
Um usuário só pode visualizar, editar, excluir e consultar analytics dos próprios links.
```

---

## 15. Testabilidade

### Backend

Testar:

- services;
- endpoints com Supertest;
- middlewares;
- regras de redirect;
- regras de authorization.

### Frontend

Testar:

- formulários;
- componentes principais;
- protected routes;
- renderização de listas;
- renderização de analytics.

---

## 16. Justificativa final

A arquitetura escolhida evita overengineering e demonstra maturidade técnica.

O projeto não usará microserviços porque o escopo não justifica complexidade operacional. O monólito modular mantém organização por domínio, reduz acoplamento e permite evolução futura.

O frontend por features evita estrutura genérica e facilita manutenção à medida que novas telas forem criadas.

O monorepo centraliza backend, frontend, documentação e possíveis tipos compartilhados, facilitando execução local e avaliação do projeto.
