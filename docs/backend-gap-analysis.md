# LinkPulse Backend Gap Analysis

Data da analise: 2026-05-01

Escopo:
- Comparacao entre `docs/linkpulse_prd.md` e implementacao atual de `apps/api`
- Backend only
- Fonte de verdade para estado atual: codigo em `apps/api`

Metodo usado:
- Leitura do PRD e docs tecnicos
- Revisao estatica de `apps/api/src`, `apps/api/prisma` e `apps/api/tests`
- Validacao local com `tsc --noEmit`: OK
- Tentativa de rodar `npm test -w apps/api`: nao validada neste ambiente por `spawn EPERM` do Vitest ao criar workers

## Resumo executivo

Estado atual do backend:
- Base do MVP backend existe
- Auth, links CRUD, redirect, analytics, Redis cache/rate limit e Swagger ja foram implementados
- Schema Prisma e migration inicial cobrem entidades do MVP

O que falta para considerar backend "pronto" frente ao PRD:
1. Alinhar contrato real de autenticacao com PRD/docs
2. Fechar readiness de infra: bootstrap e health real de PostgreSQL/Redis
3. Corrigir inconsistencias do modelo de erro
4. Completar cobertura de testes exigida pelo PRD
5. Eliminar drift entre runtime, Swagger e docs markdown

Leitura curta:
- Backend esta perto do MVP funcional
- Gap principal nao e "falta de endpoints"
- Gap principal e "acabamento tecnico para ficar entregavel"

## Matriz PRD x estado atual

| Area | PRD | Estado atual | Status |
|---|---|---|---|
| Backend base | Express, CORS, Helmet, Zod, erro global, Prisma, Redis, `/health` | Tudo existe, mas `/health` nao valida dependencias e bootstrap nao conecta infra explicitamente | Parcial |
| Modelagem | `User`, `ShortLink`, `LinkAccessEvent` + migration | Implementado em `apps/api/prisma/schema.prisma` e migration inicial | Pronto |
| Auth | register, login, JWT, bcrypt, `/me`, middleware auth | Implementado, mas resposta de login diverge do PRD/docs (`acessToken`) e expiracao JWT ignora env | Parcial |
| Links CRUD | create, list, details, update, delete, activate, deactivate | Endpoints e regras principais existem | Pronto funcionalmente |
| Filtros e paginacao | busca, filtro de status, paginacao | Implementado em schema + repository | Pronto |
| Redirect | `GET /r/:shortCode`, validacoes, evento, incremento, 302 | Implementado com transacao e cache | Pronto funcionalmente |
| Analytics | summary, clicks-by-day, events, top-links | Implementado com ownership | Pronto funcionalmente |
| Redis | cache redirect + rate limit | Implementado | Parcial de readiness |
| Swagger | `/docs` + schemas | Implementado, mas refletindo parte do contrato errado de auth | Parcial |
| Testes backend | auth, links, redirect, analytics, middlewares | Suite existe, mas cobertura ainda incompleta frente ao PRD | Parcial |

## O que ja esta pronto

Arquitetura e base:
- `apps/api/src/app.ts`
- `apps/api/src/shared/config/env.ts`
- `apps/api/src/shared/config/prisma.ts`
- `apps/api/src/shared/config/redis.ts`
- `apps/api/src/shared/errors/*`
- `apps/api/src/shared/middlewares/*`

Modelagem e persistencia:
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260424005959_init/migration.sql`

Modulos implementados:
- Auth: `apps/api/src/modules/auth/*`
- Links: `apps/api/src/modules/links/*`
- Redirects: `apps/api/src/modules/redirects/*`
- Analytics: `apps/api/src/modules/analytics/*`
- Rate limit: `apps/api/src/modules/rate-limit/rate-limit.service.ts`

Documentacao tecnica ja existente:
- `docs/linkpulse_prd.md`
- `docs/api-contract.md`
- `docs/database-model.md`
- `docs/architecture.md`

## Gaps bloqueantes para backend ficar pronto

### 1. Contrato de login esta divergente do PRD e da documentacao

Status:
- Implementacao existe
- Contrato exposto esta errado

Problema:
- PRD e `docs/api-contract.md` usam `accessToken`
- Runtime, types, Swagger e testes usam `acessToken`
- `JWT_EXPIRES_IN` existe no env, mas auth usa valor fixo `3600`

Arquivos afetados:
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.types.ts`
- `apps/api/src/shared/config/swagger.ts`
- `apps/api/tests/auth.routes.test.ts`
- `docs/api-contract.md`
- `docs/linkpulse_prd.md`

Evidencia:
- `apps/api/src/modules/auth/auth.service.ts:87`
- `apps/api/src/modules/auth/auth.service.ts:93`
- `apps/api/src/modules/auth/auth.service.ts:95`
- `apps/api/src/modules/auth/auth.service.ts:123`
- `apps/api/src/modules/auth/auth.types.ts:14`
- `apps/api/src/shared/config/swagger.ts:82`
- `apps/api/src/shared/config/swagger.ts:87`
- `apps/api/src/shared/config/env.ts:28`
- `docs/api-contract.md:158`
- `docs/linkpulse_prd.md:987`

Impacto:
- Frontend/consumidores vao quebrar se seguirem PRD/docs
- Swagger ensina payload diferente do contrato markdown
- `JWT_EXPIRES_IN` configurado no ambiente hoje nao muda comportamento real

O que fazer:
1. Renomear `acessToken` para `accessToken`
2. Renomear `generateAcessToken` para `generateAccessToken`
3. Usar `env.JWT_EXPIRES_IN` para assinatura do token
4. Definir de forma consistente como calcular `expiresIn` da response
5. Atualizar testes e Swagger para o nome correto

Sugestao de arquivos para alterar:
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.types.ts`
- `apps/api/src/shared/config/swagger.ts`
- `apps/api/tests/auth.routes.test.ts`

### 2. Readiness de infraestrutura ainda esta fraco

Status:
- Config Prisma e Redis existem
- Bootstrap e health ainda nao provam que infra esta pronta

Problema:
- `server.ts` so faz `app.listen(...)`
- `connectRedis()` existe, mas nao e chamado no bootstrap
- `/health` responde status fixo sem validar PostgreSQL nem Redis
- PRD da fase 2 pede API respondendo `/health`, Prisma conectando e Redis conectando

Arquivos afetados:
- `apps/api/src/server.ts`
- `apps/api/src/app.ts`
- `apps/api/src/shared/config/redis.ts`
- `apps/api/src/shared/config/prisma.ts`

Evidencia:
- `apps/api/src/server.ts:5`
- `apps/api/src/app.ts:32`
- `apps/api/src/shared/config/redis.ts:50`
- `apps/api/src/shared/config/redis.ts:73`

Impacto:
- Backend sobe "aparentemente ok", mesmo se dependencia estiver indisponivel
- `/health` nao serve como readiness real
- Mais dificil debugar deploy local/CI/producao

O que fazer:
1. No bootstrap, chamar `await prisma.$connect()` antes do `listen`
2. No bootstrap, chamar `await connectRedis()` antes do `listen`
3. Transformar `/health` em health real:
   - checar PostgreSQL com query simples
   - checar Redis com `PING`
   - retornar status por dependencia
4. Opcional: adicionar `SIGINT`/`SIGTERM` para `disconnectRedis()` e `prisma.$disconnect()`

Sugestao de arquivos para alterar:
- `apps/api/src/server.ts`
- `apps/api/src/app.ts`
- `apps/api/src/shared/config/redis.ts`

### 3. Modelo de erro ainda tem inconsistencias e um bug literal

Status:
- AppError existe
- Error handler global existe
- Ainda ha pontos fora do padrao

Problema:
- Handler do Prisma `P2025` retorna chave `erroe`, nao `error`
- `AuthController.me` monta resposta 401 manualmente em vez de usar `AppError`
- Isso quebra regra do PRD/AGENTS: manter tratamento consistente

Arquivos afetados:
- `apps/api/src/shared/errors/error-handler.ts`
- `apps/api/src/modules/auth/auth.controller.ts`

Evidencia:
- `apps/api/src/shared/errors/error-handler.ts:55`
- `apps/api/src/modules/auth/auth.controller.ts:49`
- `apps/api/src/modules/auth/auth.controller.ts:52`

Impacto:
- Resposta de erro pode ficar inconsistente dependendo da origem
- Consumidor pode depender de `error` e receber `undefined`
- Mais custo de manutencao no frontend

O que fazer:
1. Corrigir `erroe` para `error`
2. Padronizar `AuthController.me` para lancar `AppError.unauthorized(...)`
3. Opcional: adicionar testes do error handler para `P2002` e `P2025`

Sugestao de arquivos para alterar:
- `apps/api/src/shared/errors/error-handler.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- novo teste sugerido: `apps/api/tests/error-handler.test.ts`

### 4. Cobertura de testes ainda nao atende o nivel descrito no PRD

Status:
- Existem testes de analytics, redirect, rate-limit
- Auth e links ainda estao muito abaixo do necessario

Problema:
- O PRD pede cobertura minima clara para auth, links, redirect, analytics e middlewares
- Hoje os testes mais fracos sao justamente em auth e links core

Arquivos atuais:
- `apps/api/tests/auth.routes.test.ts`
- `apps/api/tests/links.routes.test.ts`
- `apps/api/tests/links.service.test.ts`
- `apps/api/tests/redirects.routes.test.ts`
- `apps/api/tests/redirects.service.test.ts`
- `apps/api/tests/analytics.routes.test.ts`
- `apps/api/tests/analytics.service.test.ts`
- `apps/api/tests/rate-limit.middleware.test.ts`
- `apps/api/tests/rate-limit.service.test.ts`

Evidencia de cobertura atual:
- `apps/api/tests/auth.routes.test.ts:25`
- `apps/api/tests/auth.routes.test.ts:41`
- `apps/api/tests/links.routes.test.ts:45`
- `apps/api/tests/links.routes.test.ts:60`
- `apps/api/tests/links.service.test.ts:44`

O que esta faltando por modulo:

Auth:
- register happy path
- register com email duplicado
- login com credenciais validas
- login com senha invalida
- `GET /me` autenticado
- `GET /me` sem token
- validacao do shape da response de login com `accessToken`

Arquivos para mexer:
- expandir `apps/api/tests/auth.routes.test.ts`
- opcional criar `apps/api/tests/auth.service.test.ts`

Links:
- create happy path
- create com URL invalida
- create com alias duplicado
- list retorna apenas links do dono
- list com paginacao e filtros
- `GET /:id` do proprio usuario
- `PATCH /:id` do proprio usuario
- `PATCH /:id` de link de outro usuario
- `DELETE /:id` soft delete
- activate/deactivate
- invalidacao de cache quando `expiresAt`/`maxClicks` mudam
- geracao de shortCode unico

Arquivos para mexer:
- expandir `apps/api/tests/links.routes.test.ts`
- expandir `apps/api/tests/links.service.test.ts`
- opcional criar `apps/api/tests/links.repository.integration.test.ts`

Redirect:
- Ja esta melhor coberto
- Ainda falta teste integrado do fluxo transacional:
  - cria evento
  - incrementa `clickCount`
  - bloqueia se estado mudar entre leitura e update

Arquivos para mexer:
- expandir `apps/api/tests/redirects.service.test.ts`
- opcional criar `apps/api/tests/redirects.repository.integration.test.ts`

Analytics:
- Resumo, eventos e top-links existem
- Ainda vale cobrir ownership em `clicks-by-day` e `events`
- Vale cobrir range default e range customizado com dados reais/integration

Arquivos para mexer:
- expandir `apps/api/tests/analytics.routes.test.ts`
- expandir `apps/api/tests/analytics.service.test.ts`

Backend base:
- Falta teste de `/health`
- Falta teste de `/docs`

Arquivos sugeridos:
- novo `apps/api/tests/app.routes.test.ts`

Observacao de ambiente:
- Neste ambiente, `npm test -w apps/api` falhou por `spawn EPERM` do Vitest ao abrir workers
- Isso nao prova bug do projeto, mas significa que suite nao foi validada end-to-end aqui

### 5. Runtime, Swagger e docs markdown estao com drift

Status:
- Docs existem
- Parte do contrato nao bate com runtime

Problema principal:
- Login: docs usam `accessToken`, runtime/Swagger usam `acessToken`

Outros drift provaveis:
- Register docs mostram `createdAt`, mas service de register hoje seleciona apenas `id`, `name`, `email`
- Activate/deactivate docs mostram payload reduzido; runtime retorna `Link` completo
- Update docs mostram payload reduzido; runtime retorna `Link` completo

Arquivos afetados:
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/shared/config/swagger.ts`
- `docs/api-contract.md`

Impacto:
- Frontend e QA nao sabem qual contrato seguir
- Swagger e markdown podem induzir implementacao errada no web app

O que fazer:
1. Escolher contrato final por endpoint
2. Ajustar runtime para esse contrato
3. Ajustar Swagger
4. Ajustar `docs/api-contract.md`
5. So depois integrar frontend em cima desse contrato consolidado

## Gaps secundarios / hardening

### 6. Auth ainda foge do padrao repository-first do projeto

Status:
- Funciona
- Arquitetura ainda nao esta consistente

Problema:
- `AuthService` usa `prisma` direto
- Regra do repo pede DB access concentrado em repositories

Arquivo afetado:
- `apps/api/src/modules/auth/auth.service.ts`

Impacto:
- Auth vira excecao arquitetural
- Dificulta mocks e testes unitarios finos

O que fazer:
1. Criar `auth.repository.ts` ou `users.repository.ts`
2. Mover queries de usuario para repository
3. Manter `AuthService` so com regra de negocio

Prioridade:
- Media
- Nao bloqueia MVP funcional, mas melhora manutencao

### 7. Cache de redirect nao atualiza `clickCount` apos acesso valido

Status:
- Fluxo funcional existe
- Cache fica defasado entre acessos

Problema:
- Cache grava `clickCount`
- Em redirect valido, DB incrementa contador, mas cache nao e atualizado
- Se houver `maxClicks`, decisao inicial pode ser tomada com `clickCount` stale; DB corrige no fluxo transacional, mas cache segue atrasado

Arquivos afetados:
- `apps/api/src/modules/redirects/redirects.service.ts`
- `apps/api/src/modules/redirects/redirects.repository.ts`

Evidencia:
- `apps/api/src/modules/redirects/redirects.service.ts:48`
- `apps/api/src/modules/redirects/redirects.service.ts:53`
- `apps/api/src/modules/redirects/redirects.service.ts:61`
- `apps/api/src/modules/redirects/redirects.repository.ts:30`

Impacto:
- Nao parece quebrar consistencia final, porque o repository revalida no banco
- Mas reduz qualidade do cache e pode gerar idas desnecessarias ao banco perto do limite de cliques

O que fazer:
1. Apos redirect valido, atualizar cache com `clickCount + 1`
2. Ou invalidar cache apos cada incremento
3. Ou remover `clickCount` do cache e deixar decisao de limite sempre no banco

Prioridade:
- Media
- Nao bloqueia MVP, mas melhora confiabilidade/performance

## Ordem recomendada para fechar os gaps

1. Corrigir contrato de auth
2. Corrigir error model
3. Fortalecer bootstrap + `/health`
4. Alinhar Swagger e `docs/api-contract.md`
5. Completar testes de auth e links
6. Completar testes base (`/health`, `/docs`)
7. Refinar cache de redirect
8. Opcional: refatorar auth para repository

## Plano de implementacao sugerido

### Sprint 1 - fechar blockers de contrato

Arquivos:
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.types.ts`
- `apps/api/src/shared/config/swagger.ts`
- `apps/api/src/shared/errors/error-handler.ts`
- `apps/api/src/modules/auth/auth.controller.ts`

Objetivo:
- Runtime e docs baterem
- Error shape ficar confiavel

### Sprint 2 - readiness de infra

Arquivos:
- `apps/api/src/server.ts`
- `apps/api/src/app.ts`
- `apps/api/src/shared/config/redis.ts`

Objetivo:
- Backend subir com conexoes reais
- `/health` refletir estado do sistema

### Sprint 3 - cobertura de testes

Arquivos:
- `apps/api/tests/auth.routes.test.ts`
- `apps/api/tests/links.routes.test.ts`
- `apps/api/tests/links.service.test.ts`
- `apps/api/tests/analytics.routes.test.ts`
- `apps/api/tests/analytics.service.test.ts`
- novo `apps/api/tests/app.routes.test.ts`

Objetivo:
- Cobrir criterios minimos do PRD

## Veredito final

Backend atual:
- Nao esta cru
- Nao esta faltando modulo inteiro
- Ja entrega quase todo escopo funcional do PRD backend

Backend ainda nao esta "pronto" por 5 motivos reais:
1. Contrato de auth divergente
2. Health/bootstrap sem readiness real
3. Error model inconsistente
4. Cobertura de testes ainda insuficiente no core
5. Drift entre runtime, Swagger e docs

Se esses 5 pontos forem fechados, backend passa de "MVP quase pronto" para "backend pronto para integrar e demonstrar com seguranca".
