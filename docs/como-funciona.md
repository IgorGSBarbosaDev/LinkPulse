# Como o LinkPulse funciona

## Visão geral

O projeto é um monorepo com duas aplicações principais:

```text
Navegador
   ↓
Frontend React (apps/web)
   ↓ HTTP/JSON
API Express (apps/api)
   ├── Prisma → PostgreSQL
   └── Redis → cache e rate limit
```

O backend é um monólito modular. A aplicação é única, mas separa autenticação, links, redirecionamentos, analytics e rate limit em módulos próprios.

## Fluxo de autenticação

1. O usuário envia cadastro ou login pelo frontend.
2. A API valida os dados com Zod.
3. No cadastro, a senha é transformada em hash com bcrypt e o usuário é salvo no PostgreSQL.
4. No login, a API compara a senha informada com o hash salvo.
5. Em caso de sucesso, a API gera um JWT.
6. O frontend guarda o token e o envia no header `Authorization: Bearer <token>` nas chamadas privadas.
7. O middleware da API valida o JWT e identifica o usuário da requisição.

## Fluxo de criação e gerenciamento de links

1. O frontend envia os dados para `/api/v1/links`.
2. A API exige autenticação e valida a entrada.
3. A URL original é normalizada.
4. O sistema usa o alias informado ou gera um código curto aleatório.
5. A API verifica a unicidade do código e do alias.
6. O link é salvo no PostgreSQL associado ao usuário autenticado.
7. Alterações de URL, status, validade ou código invalidam o cache Redis correspondente.
8. Listagens e consultas sempre filtram pelo usuário autenticado.

Excluir um link não remove imediatamente seu registro: o sistema usa `deletedAt` para soft delete.

## Fluxo de um redirecionamento

Quando alguém acessa `GET /r/:shortCode`:

1. O rate limit por IP é consultado no Redis.
2. A API procura o link no cache Redis.
3. Se não encontrar, consulta o PostgreSQL.
4. O sistema valida existência, exclusão, status ativo, expiração e limite de cliques.
5. Em um acesso válido, grava um `LinkAccessEvent` no PostgreSQL e incrementa `clickCount` em uma transação.
6. O contador atualizado também é escrito no cache para evitar dados obsoletos.
7. A API responde com `302` e a URL original no header `Location`.

Redis acelera a resolução dos links, mas não é a fonte de verdade. Se o Redis falhar, a API tenta continuar o fluxo usando o PostgreSQL quando possível.

## Fluxo dos analytics

Os dados de analytics são derivados dos eventos gravados durante os redirecionamentos válidos.

- O resumo consulta contagens do link.
- A série diária agrupa eventos por data.
- A lista de eventos retorna os acessos com paginação.
- O ranking retorna os links mais acessados do usuário.

O dashboard usa `GET /api/v1/analytics/dashboard` para receber métricas, série diária, top links e acessos recentes em uma resposta agregada. Os endpoints analíticos por link continuam disponíveis para a página detalhada.

## Fluxo do frontend

O frontend organiza o código por funcionalidade:

```text
Página
  ↓
Componente
  ↓
Hook da feature
  ↓
TanStack Query
  ↓
Cliente HTTP
  ↓
API REST
```

O React Router controla as páginas públicas e privadas. O TanStack Query gerencia carregamento, cache e atualização dos dados vindos da API. Formulários usam validação no frontend e a API valida novamente no backend.

## Principais pontos de entrada

### API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/links`
- `GET /api/v1/links`
- `GET /api/v1/links/:id`
- `PATCH /api/v1/links/:id`
- `DELETE /api/v1/links/:id`
- `PATCH /api/v1/links/:id/activate`
- `PATCH /api/v1/links/:id/deactivate`
- `GET /r/:shortCode`
- `GET /api/v1/links/:id/analytics/summary`
- `GET /api/v1/links/:id/analytics/clicks-by-day`
- `GET /api/v1/links/:id/analytics/events`
- `GET /api/v1/analytics/top-links`

### Aplicação web

- `/`: landing page
- `/login`: login
- `/register`: cadastro
- `/dashboard`: visão geral
- `/links`: gerenciamento de links
- `/links/new`: criação
- `/links/:id`: detalhes
- `/links/:id/edit`: edição
- `/links/:id/analytics`: analytics do link
- `/settings`: dados da conta

## Persistência principal

O PostgreSQL possui três entidades centrais:

- `User`: conta e credenciais do usuário;
- `ShortLink`: URL original, código, status, validade e contador;
- `LinkAccessEvent`: histórico dos acessos válidos.

Assim, o PostgreSQL mantém os dados permanentes, enquanto o Redis serve apenas para acelerar redirecionamentos e controlar requisições temporariamente.
