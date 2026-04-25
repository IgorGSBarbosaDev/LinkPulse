# API Contract — LinkPulse

## 1. Visão geral

Este documento descreve o contrato inicial da API REST do **LinkPulse**.

A API será construída com:

- Node.js;
- Express;
- TypeScript;
- Zod;
- JWT;
- Prisma;
- Redis.

Base URL local:

```txt
http://localhost:3000
```

Prefixo da API privada:

```txt
/api/v1
```

Endpoint público de redirecionamento:

```txt
/r/:shortCode
```

---

## 2. Autenticação

Rotas privadas devem receber JWT no header:

```http
Authorization: Bearer <token>
```

---

## 3. Padrão de erro

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `statusCode` | number | Código HTTP |
| `error` | string | Nome resumido do erro |
| `message` | string | Mensagem principal |
| `details` | array | Detalhes opcionais |

---

## 4. Status HTTP padronizados

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

# 5. Auth

## 5.1 Registrar usuário

```http
POST /api/v1/auth/register
```

### Request

```json
{
  "name": "Igor",
  "email": "igor@email.com",
  "password": "12345678"
}
```

### Validações

| Campo | Regra |
|---|---|
| `name` | obrigatório |
| `email` | obrigatório, formato válido, único |
| `password` | obrigatório, tamanho mínimo definido no backend |

### Response `201`

```json
{
  "id": "uuid",
  "name": "Igor",
  "email": "igor@email.com",
  "createdAt": "2026-04-23T20:00:00.000Z"
}
```

### Erros possíveis

| Caso | Status |
|---|---:|
| Dados inválidos | 400 |
| E-mail já cadastrado | 409 |
| Erro interno | 500 |

---

## 5.2 Login

```http
POST /api/v1/auth/login
```

### Request

```json
{
  "email": "igor@email.com",
  "password": "12345678"
}
```

### Response `200`

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

### Erros possíveis

| Caso | Status |
|---|---:|
| Dados inválidos | 400 |
| Credenciais inválidas | 401 |
| Rate limit excedido | 429 |

---

## 5.3 Usuário autenticado

```http
GET /api/v1/auth/me
```

### Headers

```http
Authorization: Bearer <token>
```

### Response `200`

```json
{
  "id": "uuid",
  "name": "Igor",
  "email": "igor@email.com"
}
```

---

# 6. Links

## 6.1 Criar link

```http
POST /api/v1/links
```

### Headers

```http
Authorization: Bearer <token>
```

### Request

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

### Campos

| Campo | Obrigatório | Descrição |
|---|---:|---|
| `originalUrl` | sim | URL original |
| `customAlias` | não | Alias personalizado |
| `title` | não | Título interno |
| `description` | não | Descrição interna |
| `expiresAt` | não | Data futura de expiração |
| `maxClicks` | não | Limite máximo de cliques |

### Validações

- `originalUrl` deve ser URL válida.
- `customAlias`, se informado, deve ser único.
- `customAlias` deve aceitar letras, números, hífen e underscore.
- `expiresAt`, se informado, deve ser data futura.
- `maxClicks`, se informado, deve ser maior que zero.

### Response `201`

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

## 6.2 Listar links

```http
GET /api/v1/links?page=1&limit=10&search=backend&active=true&sort=createdAt&order=desc
```

### Headers

```http
Authorization: Bearer <token>
```

### Query params

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `page` | number | não | Página atual |
| `limit` | number | não | Itens por página |
| `search` | string | não | Busca por título, alias ou URL |
| `active` | boolean | não | Filtra por status |
| `sort` | string | não | Campo de ordenação |
| `order` | `asc` ou `desc` | não | Direção |

### Response `200`

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

### Regra de autorização

A listagem deve retornar somente links do usuário autenticado.

---

## 6.3 Buscar link por ID

```http
GET /api/v1/links/:id
```

### Response `200`

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
  "clickCount": 120,
  "createdAt": "2026-04-23T20:00:00.000Z",
  "updatedAt": "2026-04-23T20:00:00.000Z"
}
```

Recomendação: retornar `404` quando o link não existir ou não pertencer ao usuário.

---

## 6.4 Atualizar link

```http
PATCH /api/v1/links/:id
```

### Request

```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "expiresAt": "2026-06-30T23:59:59.000Z",
  "maxClicks": 1000,
  "active": true
}
```

### Regras

- usuário precisa estar autenticado;
- link precisa pertencer ao usuário;
- atualização parcial deve ser permitida;
- cache do Redis deve ser invalidado.

### Response `200`

```json
{
  "id": "uuid",
  "title": "Novo título",
  "description": "Nova descrição",
  "active": true,
  "expiresAt": "2026-06-30T23:59:59.000Z",
  "maxClicks": 1000,
  "updatedAt": "2026-04-23T21:00:00.000Z"
}
```

---

## 6.5 Excluir link

```http
DELETE /api/v1/links/:id
```

### Regras

- usuário precisa estar autenticado;
- link precisa pertencer ao usuário;
- usar soft delete;
- cache deve ser invalidado.

### Response `204`

Sem body.

---

## 6.6 Ativar link

```http
PATCH /api/v1/links/:id/activate
```

### Response `200`

```json
{
  "id": "uuid",
  "active": true,
  "updatedAt": "2026-04-23T21:00:00.000Z"
}
```

---

## 6.7 Desativar link

```http
PATCH /api/v1/links/:id/deactivate
```

### Response `200`

```json
{
  "id": "uuid",
  "active": false,
  "updatedAt": "2026-04-23T21:00:00.000Z"
}
```

---

# 7. Redirecionamento

## 7.1 Acessar link curto

```http
GET /r/:shortCode
```

### Fluxo esperado

1. Aplicar rate limit por IP.
2. Buscar link no Redis.
3. Se não encontrado no Redis, buscar no PostgreSQL.
4. Validar existência.
5. Validar status ativo.
6. Validar expiração.
7. Validar limite de cliques.
8. Registrar evento de acesso.
9. Incrementar `clickCount`.
10. Redirecionar.

### Response válida

```http
302 Found
Location: https://example.com/artigo-backend
```

### Erros possíveis

| Caso | Status |
|---|---:|
| Link não encontrado | 404 |
| Link expirado | 410 |
| Link inativo | 410 |
| Limite de cliques atingido | 410 |
| Rate limit excedido | 429 |

---

# 8. Analytics

## 8.1 Resumo por link

```http
GET /api/v1/links/:id/analytics/summary
```

### Response `200`

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

## 8.2 Cliques por dia

```http
GET /api/v1/links/:id/analytics/clicks-by-day?from=2026-04-01&to=2026-04-23
```

### Response `200`

```json
[
  {
    "date": "2026-04-21",
    "clicks": 20
  },
  {
    "date": "2026-04-22",
    "clicks": 35
  }
]
```

---

## 8.3 Últimos acessos

```http
GET /api/v1/links/:id/analytics/events?page=1&limit=10
```

### Response `200`

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

## 8.4 Top links

```http
GET /api/v1/analytics/top-links
```

### Response `200`

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

# 9. Health check

```http
GET /health
```

### Response `200`

```json
{
  "status": "ok",
  "app": "LinkPulse API"
}
```

---

# 10. Observação final

Este contrato representa o MVP acordado. Mudanças futuras devem ser documentadas antes da implementação, especialmente se alterarem formato de resposta, nomes de campos, status HTTP, regras de autorização, paginação ou analytics.
