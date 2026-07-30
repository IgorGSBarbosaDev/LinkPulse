# LinkPulse

LinkPulse é uma aplicação fullstack para criar, gerenciar e acompanhar links curtos. O MVP combina autenticação, gerenciamento individual de links, redirecionamento público, registro de cliques e analytics básicos.

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack e arquitetura](#stack-e-arquitetura)
- [Executar localmente](#executar-localmente)
- [Comandos](#comandos)
- [E2E](#e2e)
- [Endpoints e rotas](#endpoints-e-rotas)
- [Fluxos principais](#fluxos-principais)
- [Contribuição](#contribuição)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Documentação](#documentação)
- [Licença](#licença)

## Visão geral

O projeto é um monorepo com frontend React e API REST em um monólito modular. O PostgreSQL mantém os dados permanentes; o Redis é usado como infraestrutura auxiliar para cache de redirecionamentos e rate limit.

## Funcionalidades

- cadastro, login e consulta do usuário autenticado;
- autenticação de rotas privadas com JWT e senhas protegidas por bcrypt;
- criação de links com código curto, alias personalizado, título, descrição, expiração e limite de cliques;
- listagem com busca, filtros, ordenação e paginação;
- edição, ativação, desativação e soft delete de links próprios;
- redirecionamento público com HTTP 302, validação de status, expiração e limite de cliques;
- registro de eventos de acesso e contador de cliques;
- dashboard com métricas, cliques por dia, top links e acessos recentes;
- analytics detalhado por link com resumo, série diária e eventos paginados;
- estados de carregamento, vazio, erro, não encontrado, sem permissão e sessão expirada no frontend.

## Stack e arquitetura

| Camada | Tecnologias e responsabilidade |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS e Recharts |
| Backend | Node.js, Express 5, TypeScript, Zod, JWT, bcrypt e Swagger UI/OpenAPI |
| Persistência | PostgreSQL 16, Prisma e migrations em `apps/api/prisma/migrations` |
| Infraestrutura auxiliar | Redis 7 para cache e rate limit |
| Testes | Vitest, Supertest, React Testing Library e Playwright |
| Monorepo | npm workspaces |

O backend é um monólito modular organizado por domínio (`auth`, `links`, `redirects`, `analytics` e `rate-limit`). O frontend é organizado por features. O PostgreSQL é a fonte de verdade e o Redis não substitui o banco.

### Estrutura principal

```text
LinkPulse/
├── apps/
│   ├── api/                 # API Express, módulos, Prisma e configuração
│   └── web/                 # aplicação React/Vite organizada por features
├── packages/
│   └── shared/              # código compartilhado quando realmente necessário
├── docs/                    # contrato, arquitetura, funcionamento e decisões
├── e2e/                     # cenários Playwright
├── docker-compose.yml       # PostgreSQL e Redis locais
├── playwright.config.ts
└── package.json             # scripts e npm workspaces
```

## Executar localmente

### Pré-requisitos

- Node.js compatível com as dependências do projeto (Node.js 22 é usado no CI);
- npm;
- Docker Desktop com Docker Compose;
- Git.

### Fork, clone e instalação

1. No GitHub, faça um fork de [`IgorGSBarbosaDev/LinkPulse`](https://github.com/IgorGSBarbosaDev/LinkPulse).
2. Clone o seu fork e entre no diretório:

```powershell
git clone https://github.com/<seu-usuario>/LinkPulse.git
Set-Location LinkPulse
npm install
```

### Variáveis de ambiente

Copie os exemplos versionados:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

O backend valida as variáveis na inicialização. O conteúdo local pode ser conferido em [`apps/api/.env.example`](apps/api/.env.example):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse
DATABASE_URL_TEST=postgresql://linkpulse:linkpulse@localhost:55432/linkpulse_test
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-secret-with-at-least-16-characters
JWT_EXPIRES_IN=1h
APP_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
APP_VERSION=0.1.0
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

No frontend, [`apps/web/.env.example`](apps/web/.env.example) define `VITE_API_BASE_URL=http://localhost:3000` e `VITE_APP_NAME=LinkPulse`. Troque `JWT_SECRET` por um segredo local com pelo menos 16 caracteres. Durante os testes, defina `NODE_ENV=test` para que o Prisma use `DATABASE_URL_TEST`.

### PostgreSQL e Redis

Suba os serviços locais:

```powershell
docker compose up -d postgres redis
```

O Compose expõe PostgreSQL em `localhost:55432` e Redis em `localhost:6379`. O banco `linkpulse` é criado automaticamente. Para preparar o banco isolado dos testes, crie `linkpulse_test` uma vez:

```powershell
docker exec linkpulse-postgres createdb -U linkpulse linkpulse_test
```

Se o banco de testes já existir, a mensagem de banco duplicado pode ser ignorada.

### Migrations e preparação do banco

Gere o Prisma Client e aplique as migrations do banco de desenvolvimento:
```powershell
npm run prisma:generate
npm run prisma:migrate
```

Para aplicar as mesmas migrations ao banco de testes:

```powershell
$env:DATABASE_URL = "postgresql://linkpulse:linkpulse@localhost:55432/linkpulse_test"
npm run prisma:migrate
Remove-Item Env:DATABASE_URL
```

O script `prisma:migrate` executa `prisma migrate deploy` no workspace `apps/api`. Para abrir o Prisma Studio, use `npm run prisma:studio`.

### Backend e frontend

Suba os dois serviços em paralelo:

```powershell
npm run dev
```

Ou execute cada um separadamente:

```powershell
npm run dev:api
npm run dev:web
```

Endereços locais:

- API: <http://localhost:3000>
- Health check: <http://localhost:3000/health>
- Swagger UI: <http://localhost:3000/docs>
- Web: <http://localhost:5173>

### Swagger/OpenAPI

A documentação interativa fica disponível em `/docs` e a especificação bruta em `/docs.json`.
Para testar rotas protegidas:

1. Execute `POST /api/v1/auth/login` em `/docs` com o e-mail e a senha da conta.
2. Copie o valor de `accessToken` retornado, sem o prefixo `Bearer`.
3. Clique em `Authorize`, cole o token no campo `BearerAuth` e confirme.
4. Execute as operações protegidas; o Swagger enviará automaticamente `Authorization: Bearer <token>`.

O endereço do servidor exibido pelo Swagger é derivado de `APP_BASE_URL` em `apps/api/.env`, permitindo usar a mesma documentação no desenvolvimento e no build de produção.

## Comandos

Os comandos abaixo são definidos no `package.json` raiz ou nos workspaces:

| Objetivo | Comando |
|---|---|
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Testes | `$env:NODE_ENV="test"; npm test` |
| Coverage | `$env:NODE_ENV="test"; npm run coverage` |
| Build | `npm run build` |
| Prisma Client | `npm run prisma:generate` |
| Migrations | `npm run prisma:migrate` |
| Prisma Studio | `npm run prisma:studio` |

No PowerShell, remova a variável de teste ao terminar se a sessão continuar sendo usada para desenvolvimento:

```powershell
Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
```

Os relatórios de coverage são gerados pelos workspaces em `apps/api/coverage` e `apps/web/coverage`.

## E2E

Com PostgreSQL, Redis, migrations e dependências instalados, instale o navegador do Playwright:

```powershell
npx playwright install chromium
npm run test:e2e
```

O Playwright inicia ou reutiliza a API em `http://127.0.0.1:3000` e o web em `http://127.0.0.1:5173`, conforme [`playwright.config.ts`](playwright.config.ts). O cenário cobre cadastro, login, criação de link, redirect e consulta de analytics. Os serviços precisam estar acessíveis e o banco de desenvolvimento deve estar migrado.

## Endpoints e rotas

### API

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/health` | público |
| `POST` | `/api/v1/auth/register` | público |
| `POST` | `/api/v1/auth/login` | público |
| `GET` | `/api/v1/auth/me` | JWT |
| `POST` | `/api/v1/links` | JWT |
| `GET` | `/api/v1/links` | JWT |
| `GET` | `/api/v1/links/:id` | JWT |
| `PATCH` | `/api/v1/links/:id` | JWT |
| `DELETE` | `/api/v1/links/:id` | JWT |
| `PATCH` | `/api/v1/links/:id/activate` | JWT |
| `PATCH` | `/api/v1/links/:id/deactivate` | JWT |
| `GET` | `/r/:shortCode` | público |
| `GET` | `/api/v1/links/:id/analytics/summary` | JWT |
| `GET` | `/api/v1/links/:id/analytics/clicks-by-day` | JWT |
| `GET` | `/api/v1/links/:id/analytics/events` | JWT |
| `GET` | `/api/v1/analytics/dashboard` | JWT |
| `GET` | `/api/v1/analytics/top-links` | JWT |

O contrato detalhado e os schemas estão em [`docs/api-contract.md`](docs/api-contract.md) e na documentação interativa em `/docs`.

### Rotas web

`/`, `/login`, `/register`, `/dashboard`, `/links`, `/links/new`, `/links/:id`, `/links/:id/edit`, `/links/:id/analytics` e `/settings`.

## Fluxos principais

### Redirecionamento

Em `GET /r/:shortCode`, a API aplica rate limit por IP, consulta primeiro o cache Redis e recorre ao PostgreSQL quando necessário. Ela bloqueia links inexistentes, excluídos, inativos, expirados ou que atingiram `maxClicks`. Em um acesso válido, grava `LinkAccessEvent`, incrementa `clickCount` em transação, atualiza o cache e responde com HTTP `302` e o header `Location`.

### Analytics

Os analytics são derivados dos eventos de acessos válidos. O backend calcula resumo, cliques por dia, eventos paginados, top links e o dashboard agregado. O frontend consome esses dados por TanStack Query e apresenta cards, tabelas e gráfico de cliques.

## Contribuição

1. Faça um fork e crie uma branch para a mudança.
2. Mantenha o escopo alinhado ao MVP e preserve autenticação, ownership e contratos existentes.
3. Atualize testes e documentação quando o comportamento ou contrato mudar.
4. Rode `npm run lint`, `npm run typecheck`, `$env:NODE_ENV="test"; npm test`, `$env:NODE_ENV="test"; npm run coverage` e `npm run build` antes de abrir o pull request.
5. Descreva a mudança, a validação executada e eventuais dependências de Docker, banco ou navegador.

## Limitações e próximos passos

O estado atual não inclui refresh token, verificação de e-mail, login social, recuperação de senha, 2FA, times, planos pagos, domínios personalizados, QR Code, exportação CSV, webhooks, analytics em tempo real ou detecção avançada de bots.

Esses itens podem ser considerados em evoluções futuras, junto de melhorias de escala e analytics, mas não fazem parte do MVP implementado. O estado funcional deve ser conferido em [`docs/funcionalidades-atuais.md`](docs/funcionalidades-atuais.md).

## Documentação

- [Como funciona](docs/como-funciona.md)
- [Funcionalidades atuais](docs/funcionalidades-atuais.md)
- [Contrato da API](docs/api-contract.md)
- [Arquitetura](docs/architecture.md)
- [Modelo de dados](docs/database-model.md)
- [Decisões técnicas](docs/decisions.md)
- [Deploy](docs/deploy.md)

## Licença

O projeto é distribuído sob a licença `ISC`, disponível no arquivo [`LICENSE`](LICENSE).
