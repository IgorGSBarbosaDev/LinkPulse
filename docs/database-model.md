# Database Model — LinkPulse

## 1. Visão geral

O banco de dados principal do **LinkPulse** será o **PostgreSQL**.

O acesso ao banco será feito com **Prisma**.

PostgreSQL será a fonte de verdade para:

- usuários;
- links;
- eventos de acesso;
- contadores persistentes;
- dados usados em analytics.

Redis será usado apenas para cache e rate limit.

---

## 2. Entidades do MVP

O MVP terá três entidades principais:

1. `User`
2. `ShortLink`
3. `LinkAccessEvent`

---

# 3. User

## Descrição

Representa um usuário cadastrado na aplicação.

Um usuário pode criar vários links.

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `id` | String UUID | sim | Identificador único |
| `name` | String | sim | Nome do usuário |
| `email` | String | sim | E-mail único |
| `passwordHash` | String | sim | Hash da senha |
| `createdAt` | DateTime | sim | Data de criação |
| `updatedAt` | DateTime | sim | Data da última atualização |

## Regras

- `email` deve ser único.
- `passwordHash` nunca deve ser retornado em responses.
- senha deve ser armazenada com bcrypt.
- usuário só pode acessar recursos próprios.

## Relacionamentos

```txt
User 1:N ShortLink
```

---

# 4. ShortLink

## Descrição

Representa um link encurtado criado por um usuário.

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `id` | String UUID | sim | Identificador único |
| `userId` | String UUID | sim | Dono do link |
| `originalUrl` | String | sim | URL original |
| `shortCode` | String | sim | Código curto usado no redirecionamento |
| `customAlias` | String nullable | não | Alias customizado opcional |
| `title` | String nullable | não | Título interno |
| `description` | String nullable | não | Descrição interna |
| `active` | Boolean | sim | Indica se está ativo |
| `expiresAt` | DateTime nullable | não | Data de expiração opcional |
| `maxClicks` | Int nullable | não | Limite máximo de cliques |
| `clickCount` | Int | sim | Contador persistente de cliques |
| `createdAt` | DateTime | sim | Data de criação |
| `updatedAt` | DateTime | sim | Data da última atualização |
| `deletedAt` | DateTime nullable | não | Soft delete |

## Regras

- `originalUrl` é obrigatório.
- `originalUrl` deve ser URL válida.
- `shortCode` deve ser único.
- `customAlias`, quando informado, deve ser único.
- `customAlias` deve aceitar letras, números, hífen e underscore.
- `expiresAt`, quando informado na criação, deve ser data futura.
- `maxClicks`, quando informado, deve ser maior que zero.
- `clickCount` inicia com zero.
- link criado inicia como ativo.
- link com `deletedAt` preenchido não deve aparecer em listagens padrão.
- link com `deletedAt` preenchido não deve redirecionar.
- link inativo não deve redirecionar.
- link expirado não deve redirecionar.
- link que atingiu `maxClicks` não deve redirecionar.

## Relacionamentos

```txt
ShortLink N:1 User
ShortLink 1:N LinkAccessEvent
```

---

# 5. LinkAccessEvent

## Descrição

Representa um evento de acesso válido a um link curto.

Cada vez que um link válido for acessado e redirecionado, um evento deve ser registrado.

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `id` | String UUID | sim | Identificador único |
| `shortLinkId` | String UUID | sim | Link acessado |
| `accessedAt` | DateTime | sim | Data e hora do acesso |
| `ipAddress` | String nullable | não | IP do visitante |
| `userAgent` | String nullable | não | User-Agent |
| `referer` | String nullable | não | Origem do acesso |

## Regras

- deve estar associado a um `ShortLink`;
- deve ser criado somente quando o redirecionamento for válido;
- deve alimentar os endpoints de analytics;
- não deve ser usado para autenticação ou autorização.

## Relacionamentos

```txt
LinkAccessEvent N:1 ShortLink
```

---

# 6. Schema Prisma inicial

Arquivo:

```txt
apps/api/prisma/schema.prisma
```

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

# 7. Índices

### `User.email`

```txt
@unique
```

Motivo:

- impedir cadastro duplicado;
- permitir busca eficiente por e-mail no login.

### `ShortLink.shortCode`

```txt
@unique
@@index([shortCode])
```

Motivo:

- garantir unicidade;
- otimizar busca no endpoint `/r/:shortCode`.

### `ShortLink.customAlias`

```txt
@unique
```

Motivo:

- impedir alias customizado duplicado.

### `ShortLink.userId`

```txt
@@index([userId])
```

Motivo:

- otimizar listagem de links do usuário autenticado.

### `ShortLink.createdAt`

```txt
@@index([createdAt])
```

Motivo:

- ajudar em ordenação e paginação.

### `LinkAccessEvent.shortLinkId`

```txt
@@index([shortLinkId])
```

Motivo:

- consultar eventos de um link.

### `LinkAccessEvent.accessedAt`

```txt
@@index([accessedAt])
```

Motivo:

- agregar cliques por dia;
- consultar últimos acessos;
- filtrar por período.

---

# 8. Regras de consulta

## Listagem de links

Sempre filtrar por:

```txt
userId = authenticatedUser.id
deletedAt = null
```

## Busca privada por ID

Correto:

```txt
WHERE id = linkId
AND userId = currentUserId
AND deletedAt IS NULL
```

## Redirecionamento

Buscar por:

```txt
shortCode = params.shortCode
deletedAt = null
```

Depois validar:

- `active`;
- `expiresAt`;
- `maxClicks`.

---

# 9. Soft delete

Quando usuário excluir link:

```txt
deletedAt = now()
```

Motivos:

- evita perda acidental;
- permite auditoria simples;
- preserva relação com eventos de acesso.

Links com `deletedAt` preenchido:

- não aparecem em listagens padrão;
- não podem ser editados;
- não podem redirecionar.

---

# 10. Contador de cliques

Ao acessar link válido:

1. criar `LinkAccessEvent`;
2. incrementar `clickCount`.

Quando possível, usar transação Prisma para criar evento e incrementar contador no mesmo fluxo.

---

# 11. Analytics

## Total de cliques

Pode usar:

```txt
ShortLink.clickCount
```

## Cliques por dia

Usar agregação em:

```txt
LinkAccessEvent.accessedAt
```

## Últimos acessos

Ordenar por:

```txt
accessedAt DESC
```

## Top links

Ordenar por:

```txt
clickCount DESC
```

Sempre respeitar:

```txt
userId = authenticatedUser.id
deletedAt = null
```

---

# 12. Redis e banco

Redis não substitui o banco.

## Cache de redirect

Chave:

```txt
link:redirect:{shortCode}
```

Valor sugerido:

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

## Invalidação

Invalidar cache quando:

- link for editado;
- link for ativado;
- link for desativado;
- link for excluído;
- limite de cliques for alterado;
- expiração for alterada.

---

# 13. Considerações futuras

Fora do MVP, o modelo pode evoluir com:

- tags;
- campanhas;
- QR Code;
- geolocalização;
- dados de navegador;
- dados de dispositivo;
- domínio customizado;
- organizações;
- membros;
- permissões.

---

# 14. Integração com backend

A modelagem será consumida pelo backend em **Node.js, Express e TypeScript** por meio do **Prisma Client**.

A validação de entrada não deve depender apenas do banco. As regras de formato, como URL válida, alias permitido, datas futuras e limites numéricos, devem ser verificadas antes da persistência usando **Zod**.

A autorização dos dados será feita no backend com base no usuário autenticado via **JWT**. Consultas privadas devem sempre respeitar o `userId` do usuário autenticado.

