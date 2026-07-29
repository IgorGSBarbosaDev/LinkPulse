# Roadmap — LinkPulse

## 1. Visão geral

Este documento define a ordem recomendada de desenvolvimento do **LinkPulse**.

A ordem prioriza:

1. estrutura do monorepo;
2. infraestrutura local;
3. backend funcional;
4. banco de dados;
5. autenticação;
6. links;
7. redirecionamento;
8. analytics;
9. Redis;
10. frontend;
11. testes;
12. documentação e acabamento.

---

# Fase 1 — Setup do monorepo

## Objetivo

Criar a estrutura inicial do projeto.

## Tarefas

- Criar repositório `linkpulse`.
- Inicializar `package.json` na raiz.
- Configurar `npm workspaces`.
- Criar `apps/api`.
- Criar `apps/web`.
- Criar `packages/shared`.
- Criar `docs`.
- Criar `.gitignore`.
- Criar `README.md`.
- Criar `docker-compose.yml`.
- Criar scripts principais na raiz.

## Critérios de aceite

- Estrutura do monorepo criada.
- `npm install` funciona na raiz.
- Workspaces são reconhecidos.
- Pastas principais existem.
- Scripts iniciais estão configurados.

---

# Fase 2 — Infraestrutura local

## Objetivo

Configurar PostgreSQL e Redis para desenvolvimento local.

## Tarefas

- Criar serviço PostgreSQL no Docker Compose.
- Criar serviço Redis no Docker Compose.
- Configurar volume do PostgreSQL.
- Expor portas locais.
- Criar `.env.example` da API.
- Criar `.env.example` do frontend.

## Critérios de aceite

- `docker compose up -d` sobe PostgreSQL e Redis.
- PostgreSQL acessível em `localhost:55432`.
- Redis acessível em `localhost:6379`.

---

# Fase 3 — Backend base

## Objetivo

Criar base da API Express com TypeScript.

## Tarefas

- Inicializar pacote `apps/api`.
- Instalar Express.
- Instalar TypeScript.
- Instalar tsx.
- Configurar `tsconfig.json`.
- Criar `src/app.ts`.
- Criar `src/server.ts`.
- Configurar dotenv.
- Configurar CORS.
- Configurar Helmet.
- Configurar JSON body parser.
- Criar endpoint `/health`.
- Criar estrutura inicial de pastas.

## Critérios de aceite

- `npm run dev:api` inicia a API.
- `GET /health` retorna `200`.
- API carrega variáveis de ambiente.
- CORS e Helmet estão configurados.

---

# Fase 4 — Prisma e banco

## Objetivo

Configurar Prisma e criar modelagem inicial.

## Tarefas

- Instalar Prisma e Prisma Client.
- Rodar `prisma init`.
- Configurar `DATABASE_URL`.
- Criar models:
  - `User`;
  - `ShortLink`;
  - `LinkAccessEvent`.
- Criar migration inicial.
- Rodar migration no PostgreSQL.
- Gerar Prisma Client.
- Criar conexão Prisma em `shared/config/prisma.ts`.

## Critérios de aceite

- Migration roda sem erro.
- Tabelas são criadas.
- Prisma Client é gerado.
- API consegue importar o client.

---

# Fase 5 — Erros e validação

## Objetivo

Criar infraestrutura interna antes dos módulos de negócio.

## Tarefas

- Criar classe `AppError`.
- Criar middleware global de erro.
- Criar middleware de validação com Zod.
- Padronizar formato de erro.
- Criar helpers de response, se necessário.

## Critérios de aceite

- Erros esperados retornam formato padronizado.
- Erros Zod retornam detalhes.
- Erros inesperados não expõem stack trace em produção.

---

# Fase 6 — Auth backend

## Objetivo

Implementar cadastro, login e autenticação JWT.

## Tarefas

- Criar módulo `auth`.
- Criar módulo `users`.
- Criar schemas Zod para register e login.
- Implementar cadastro.
- Validar e-mail único.
- Aplicar hash com bcrypt.
- Implementar login.
- Comparar senha com bcrypt.
- Gerar JWT.
- Criar middleware de autenticação.
- Criar rota `/api/v1/auth/me`.

## Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

## Critérios de aceite

- Usuário cadastra.
- Usuário faz login.
- Senha não é retornada.
- Token JWT é retornado.
- Rota `/me` exige token válido.
- E-mail duplicado é bloqueado.

---

# Fase 7 — Links backend

## Objetivo

Implementar gerenciamento de links.

## Tarefas

- Criar módulo `links`.
- Criar schemas Zod.
- Criar repository.
- Criar service.
- Criar controller.
- Criar routes.
- Implementar criação.
- Implementar geração de shortCode.
- Implementar validação de alias.
- Implementar listagem paginada.
- Implementar filtros.
- Implementar busca por ID.
- Implementar edição.
- Implementar ativação.
- Implementar desativação.
- Implementar soft delete.
- Garantir ownership em todas as rotas privadas.

## Endpoints

```http
POST /api/v1/links
GET /api/v1/links
GET /api/v1/links/:id
PATCH /api/v1/links/:id
DELETE /api/v1/links/:id
PATCH /api/v1/links/:id/activate
PATCH /api/v1/links/:id/deactivate
```

## Critérios de aceite

- Usuário cria link.
- Alias duplicado é bloqueado.
- URL inválida é bloqueada.
- Usuário lista apenas os próprios links.
- Usuário não edita link de outro usuário.
- Soft delete funciona.
- Links deletados não aparecem na listagem padrão.

---

# Fase 8 — Redirect backend

## Objetivo

Implementar endpoint público de redirecionamento.

## Tarefas

- Criar módulo `redirects`.
- Criar rota pública `/r/:shortCode`.
- Buscar link por shortCode.
- Validar `deletedAt`.
- Validar `active`.
- Validar `expiresAt`.
- Validar `maxClicks`.
- Registrar evento de acesso.
- Incrementar `clickCount`.
- Retornar redirect 302.

## Endpoint

```http
GET /r/:shortCode
```

## Critérios de aceite

- Link válido redireciona.
- Link inexistente retorna 404.
- Link expirado retorna 410.
- Link inativo retorna 410.
- Link com limite de cliques atingido retorna 410.
- Clique válido cria `LinkAccessEvent`.
- Clique válido incrementa `clickCount`.

---

# Fase 9 — Analytics backend

## Objetivo

Expor métricas para o frontend.

## Tarefas

- Criar módulo `analytics`.
- Criar endpoint de resumo.
- Criar endpoint de cliques por dia.
- Criar endpoint de últimos acessos.
- Criar endpoint de top links.
- Garantir ownership nos endpoints.
- Criar queries agregadas com Prisma.

## Endpoints

```http
GET /api/v1/links/:id/analytics/summary
GET /api/v1/links/:id/analytics/clicks-by-day
GET /api/v1/links/:id/analytics/events
GET /api/v1/analytics/top-links
```

## Critérios de aceite

- Usuário vê analytics dos próprios links.
- Usuário não vê analytics de links de outro usuário.
- Total de cliques é retornado.
- Cliques por dia são retornados.
- Últimos acessos são paginados.
- Top links são retornados.

---

# Fase 10 — Redis e rate limit

## Objetivo

Adicionar cache e proteção contra abuso.

## Tarefas

- Configurar conexão Redis.
- Criar serviço de cache para redirect.
- Criar chave `link:redirect:{shortCode}`.
- Cachear dados após busca no banco.
- Invalidar cache ao editar link.
- Invalidar cache ao ativar/desativar.
- Invalidar cache ao excluir link.
- Implementar rate limit por IP no redirect.
- Implementar rate limit no login.
- Implementar rate limit na criação de links.

## Critérios de aceite

- Redirect usa cache após primeiro acesso.
- Alterações invalidam cache.
- Excesso de requisições retorna 429.
- API continua previsível.

---

# Fase 11 — Swagger/OpenAPI

## Objetivo

Documentar a API.

## Tarefas

- Instalar dependências de Swagger.
- Configurar `/docs`.
- Documentar Auth.
- Documentar Links.
- Documentar Redirect.
- Documentar Analytics.
- Documentar schemas.
- Documentar autenticação Bearer.

## Critérios de aceite

- `/docs` abre no navegador.
- Endpoints principais estão documentados.
- Requests e responses têm exemplos.
- JWT pode ser informado na documentação.

---

# Fase 12 — Frontend base

## Objetivo

Criar base da aplicação React.

## Tarefas

- Criar app com Vite React TypeScript.
- Configurar React Router.
- Configurar TanStack Query.
- Configurar Axios.
- Configurar Tailwind CSS.
- Configurar shadcn/ui.
- Criar estrutura por features.
- Criar layout autenticado.
- Criar sidebar.
- Criar header.
- Criar páginas vazias.
- Criar ProtectedRoute.

## Critérios de aceite

- `npm run dev:web` inicia o frontend.
- Rotas públicas funcionam.
- Rotas privadas existem.
- Layout base está criado.
- Axios aponta para `VITE_API_BASE_URL`.

---

# Fase 13 — Auth frontend

## Objetivo

Integrar autenticação na interface.

## Tarefas

- Criar página de login.
- Criar página de cadastro.
- Criar schemas Zod.
- Criar formulários com React Hook Form.
- Integrar login com backend.
- Integrar cadastro com backend.
- Salvar token.
- Enviar token nas requisições privadas.
- Implementar logout.
- Tratar erro 401.

## Critérios de aceite

- Usuário cadastra pela interface.
- Usuário faz login pela interface.
- Usuário acessa dashboard autenticado.
- Logout remove sessão.
- Rotas privadas bloqueiam usuário sem token.

---

# Fase 14 — Links frontend

## Objetivo

Permitir gerenciamento completo de links pela interface.

## Tarefas

- Criar página `/links`.
- Criar tabela de links.
- Criar filtros.
- Criar paginação.
- Criar página `/links/new`.
- Criar formulário de criação.
- Criar página de detalhes.
- Criar página de edição.
- Criar ação de copiar link curto.
- Criar ação de ativar/desativar.
- Criar ação de excluir.
- Tratar loading, empty e error states.

## Critérios de aceite

- Usuário cria link pela interface.
- Usuário lista links reais da API.
- Usuário filtra links.
- Usuário copia link curto.
- Usuário edita link.
- Usuário ativa/desativa link.
- Usuário exclui link.

---

# Fase 15 — Analytics frontend

## Objetivo

Exibir métricas no dashboard e na página de analytics.

## Tarefas

- Criar cards de métricas.
- Criar gráfico de cliques por dia.
- Criar tabela de últimos acessos.
- Criar top links.
- Criar dashboard principal.
- Criar página `/links/:id/analytics`.
- Integrar com endpoints de analytics.

## Critérios de aceite

- Dashboard mostra métricas reais.
- Gráfico renderiza dados reais.
- Tabela mostra últimos acessos.
- Página de analytics por link funciona.

---

# Fase 16 — Testes backend

## Objetivo

Cobrir regras críticas do backend.

## Tarefas

- Testar cadastro.
- Testar login.
- Testar rota `/me`.
- Testar criação de link.
- Testar alias duplicado.
- Testar URL inválida.
- Testar ownership.
- Testar redirect válido.
- Testar redirect inválido.
- Testar analytics.

## Critérios de aceite

- Testes rodam com `npm run test -w apps/api`.
- Regras críticas estão cobertas.
- Falhas de autorização são testadas.

---

# Fase 17 — Testes frontend

## Objetivo

Cobrir principais fluxos da interface.

## Tarefas

- Testar formulário de login.
- Testar formulário de cadastro.
- Testar formulário de criação de link.
- Testar tabela de links.
- Testar ProtectedRoute.
- Testar botão de copiar link.
- Testar renderização de cards de analytics.

## Critérios de aceite

- Testes rodam com `npm run test -w apps/web`.
- Componentes principais têm testes.
- Validações básicas são testadas.

---

# Fase 18 — Documentação final

## Objetivo

Preparar o projeto para GitHub e LinkedIn.

## Tarefas

- Finalizar README.
- Revisar `architecture.md`.
- Revisar `api-contract.md`.
- Revisar `database-model.md`.
- Revisar `decisions.md`.
- Revisar `roadmap.md`.
- Adicionar prints.
- Adicionar GIF curto, se possível.
- Documentar comandos de execução.
- Documentar variáveis de ambiente.
- Documentar trade-offs.
- Criar texto para LinkedIn.

## Critérios de aceite

- Qualquer pessoa consegue rodar o projeto.
- Decisões técnicas estão claras.
- Escopo do MVP está explícito.
- Projeto está apresentável como portfólio.

---

# Ordem resumida

```txt
1. Monorepo
2. Docker Compose
3. Backend base
4. Prisma e banco
5. Erros e validação
6. Auth backend
7. Links backend
8. Redirect backend
9. Analytics backend
10. Redis e rate limit
11. Swagger
12. Frontend base
13. Auth frontend
14. Links frontend
15. Analytics frontend
16. Testes backend
17. Testes frontend
18. Documentação final
```

---

# Regra principal

Não começar por funcionalidades visuais avançadas antes de ter:

- API funcionando;
- banco modelado;
- autenticação pronta;
- criação e redirecionamento de links funcionando.

O frontend deve consumir uma API real e estável, não dados simulados permanentes.
