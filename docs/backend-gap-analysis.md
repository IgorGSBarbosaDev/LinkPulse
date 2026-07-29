# LinkPulse — Backend audit

Data: 2026-07-28

Este documento substitui a análise histórica anterior e descreve o estado do backend em relação ao MVP definido em `docs/linkpulse_prd.md`.

## Estado atual

- Auth simples com cadastro, login, JWT, bcrypt e `/me`.
- Links CRUD com ownership, filtros, paginação, quota e soft delete.
- Redirect público com expiração, status, limite de cliques e evento transacional.
- Analytics básico baseado em eventos PostgreSQL.
- Redis usado para cache de redirect e rate limit.
- Swagger e health check disponíveis.
- Verificação de e-mail não faz parte do MVP e não está exposta no runtime.

## Configuração

- PostgreSQL local: `localhost:55432`.
- Redis local: `localhost:6379`.
- API: `localhost:3000`.
- Web: `localhost:5173`.
- Testes de integração usam `DATABASE_URL_TEST` quando configurado.
- A migration histórica de e-mail foi preservada para compatibilidade com bancos já migrados, mas seus campos não fazem parte do modelo Prisma atual nem do fluxo da aplicação.

## Pontos de atenção

- O cache de redirect é atualizado após cada clique válido com o `clickCount` retornado pela transação PostgreSQL, mantendo o PostgreSQL como fonte de verdade sem perder o cache persistente.
- O workspace `packages/shared` permanece disponível, com scripts válidos, mas não recebe tipos artificialmente duplicados sem necessidade real de reutilização.
- A execução completa depende de PostgreSQL e Redis acessíveis; sem essas dependências a suíte de quota e os fluxos manuais não podem ser considerados validados.

## Critério de aceite backend

Considerar o backend pronto somente após `npm run typecheck`, `npm run lint`, build, testes API completos, migrations locais, `/health` com dependências `up` e validação manual de redirect, analytics, cache, rate limit, ownership e persistência.
