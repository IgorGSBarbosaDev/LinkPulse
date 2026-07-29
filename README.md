# LinkPulse

LinkPulse é uma aplicação fullstack para criação, gerenciamento e análise de links curtos.

## MVP

- cadastro e login simples com JWT e bcrypt;
- CRUD de links com alias, expiração e limite de cliques;
- filtros, paginação, ativação, desativação e soft delete;
- redirect público em `GET /r/:shortCode`;
- eventos de clique e analytics básicos;
- Redis para cache de redirect e rate limit;
- PostgreSQL como fonte de verdade;
- dashboard React com métricas, tabela e gráfico.
- dashboard agregado em uma única consulta autenticada;
- cobertura Vitest, CI GitHub Actions e fluxo E2E Playwright.

Verificação de e-mail, refresh token, login social, recuperação de senha, times, domínios customizados, QR Code, exportações e analytics avançados não fazem parte deste MVP.

## Stack e portas

| Serviço | Tecnologia | Endereço local |
|---|---|---|
| API | Node.js, Express, TypeScript | http://localhost:3000 |
| Web | React, Vite, TypeScript | http://localhost:5173 |
| PostgreSQL | Docker, PostgreSQL 16 | `localhost:55432` |
| Redis | Docker, Redis 7 | `localhost:6379` |

## Configuração

```powershell
npm install
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Ajuste `JWT_SECRET` em `apps/api/.env`. As URLs padrão são:

```env
DATABASE_URL=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse
DATABASE_URL_TEST=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse_test
REDIS_URL=redis://localhost:6379
VITE_API_BASE_URL=http://localhost:3000
```

## Executar localmente

```powershell
docker compose up -d postgres redis
npm run prisma:migrate
npm run dev
```

API: http://localhost:3000
Swagger: http://localhost:3000/docs
Web: http://localhost:5173

## Scripts

```powershell
npm run dev
npm run dev:api
npm run dev:web
npm run lint
npm run typecheck
npm run build
npm test
npm run coverage
npm run test:e2e
npm run prisma:generate
npm run prisma:migrate
```

## API principal

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
POST   /api/v1/links
GET    /api/v1/links
GET    /api/v1/links/:id
PATCH  /api/v1/links/:id
DELETE /api/v1/links/:id
PATCH  /api/v1/links/:id/activate
PATCH  /api/v1/links/:id/deactivate
GET    /r/:shortCode
GET    /api/v1/links/:id/analytics/summary
GET    /api/v1/links/:id/analytics/clicks-by-day
GET    /api/v1/links/:id/analytics/events
GET    /api/v1/analytics/dashboard?range=3m
GET    /api/v1/analytics/top-links
```

## Arquitetura

- `apps/api`: monólito modular Express/Prisma;
- `apps/web`: frontend React organizado por feature;
- `packages/shared`: workspace disponível para contratos realmente compartilhados;
- `docs`: funcionamento, funcionalidades atuais, arquitetura, contrato, modelo de dados, decisões e deploy.

## Documentação

- [Como funciona](docs/como-funciona.md)
- [Funcionalidades atuais](docs/funcionalidades-atuais.md)
- [Contrato da API](docs/api-contract.md)
- [Arquitetura](docs/architecture.md)
- [Modelo de dados](docs/database-model.md)
- [Decisões técnicas](docs/decisions.md)
- [Deploy](docs/deploy.md)

## Preparação para deploy

Os Dockerfiles da API e do web ficam em `apps/api/Dockerfile` e `apps/web/Dockerfile`. Variáveis de produção estão em `apps/api/.env.production.example` e `apps/web/.env.production.example`; o container da API executa `prisma migrate deploy` antes de iniciar. Consulte [docs/deploy.md](docs/deploy.md). Nenhum deploy externo é realizado pelo repositório.
