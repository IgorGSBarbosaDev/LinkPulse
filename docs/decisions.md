# Technical Decisions — LinkPulse

## 1. Objetivo

Este documento registra as principais decisões técnicas do projeto **LinkPulse**, incluindo motivos e trade-offs.

---

# 2. Monorepo

## Escolha

O projeto será desenvolvido como **fullstack monorepo**.

```txt
linkpulse/
├── apps/api
├── apps/web
├── packages/shared
└── docs
```

## Motivos

- manter backend e frontend no mesmo repositório;
- facilitar execução local;
- centralizar documentação;
- facilitar avaliação por recrutadores;
- permitir compartilhamento futuro de tipos, schemas ou constantes.

## Trade-offs

### Vantagens

- organização centralizada;
- documentação única;
- versionamento unificado;
- visão completa do projeto;
- mais simples para portfólio.

### Desvantagens

- repositório pode crescer;
- exige scripts bem definidos;
- deploy de backend e frontend continua separado;
- pacote `shared` pode gerar acoplamento se mal usado.

## Decisão final

Usar monorepo com **npm workspaces**.

---

# 3. npm workspaces

## Escolha

Gerenciador de pacotes:

```txt
npm
```

Monorepo:

```txt
npm workspaces
```

## Motivos

- simplicidade;
- npm já vem com Node.js;
- evita dependência inicial de pnpm/yarn;
- suficiente para o escopo.

## Trade-offs

### Vantagens

- instalação simples;
- menor barreira de entrada;
- compatível com a stack;
- fácil de reproduzir.

### Desvantagens

- menos eficiente que pnpm em monorepos grandes;
- alguns scripts podem exigir cuidado no Windows.

## Decisão final

Usar **npm workspaces**.

---

# 4. Backend com Node.js, Express e TypeScript

## Escolha

```txt
Node.js + Express + TypeScript
```

## Motivos

- stack comum em vagas backend júnior;
- boa curva de desenvolvimento;
- integração natural com Prisma, Zod e JWT;
- TypeScript melhora segurança e legibilidade;
- Express é simples e suficiente para o MVP.

## Trade-offs

### Vantagens

- produtividade;
- ecossistema amplo;
- baixo overhead;
- bom para APIs REST.

### Desvantagens

- Express é pouco opinativo;
- exige disciplina arquitetural;
- validação, erros e organização precisam ser configurados manualmente.

## Decisão final

Usar Express com organização modular e validação explícita com Zod.

---

# 5. Monólito modular

## Escolha

Backend em **monólito modular**.

Módulos principais:

- auth;
- users;
- links;
- redirects;
- analytics;
- rate-limit.

## Motivos

- domínio não justifica microserviços;
- reduz complexidade operacional;
- mantém deploy simples;
- permite separação por domínio;
- facilita testes e manutenção.

## Trade-offs

### Vantagens

- menor complexidade;
- implementação mais rápida;
- uma única aplicação para rodar;
- organização por contexto funcional.

### Desvantagens

- todos os módulos escalam juntos;
- fronteiras dependem de disciplina;
- não há isolamento físico entre domínios.

## Decisão final

Usar monólito modular e evitar microserviços no MVP.

---

# 6. Não usar microserviços no MVP

## Motivos

Separar em `auth-service`, `link-service`, `analytics-service` e `redirect-service` adicionaria:

- deploy separado;
- autenticação distribuída;
- comunicação entre serviços;
- observabilidade mais complexa;
- consistência distribuída;
- mais pontos de falha.

## Decisão final

Microserviços ficam fora do escopo.

---

# 7. PostgreSQL

## Escolha

```txt
PostgreSQL
```

## Motivos

- banco relacional robusto;
- adequado para usuários, links e eventos;
- bom suporte a filtros, ordenação e paginação;
- usado em ambientes reais;
- combina bem com Prisma.

## Trade-offs

### Vantagens

- confiável;
- relacional;
- transacional;
- maduro.

### Desvantagens

- analytics muito pesados podem exigir otimizações futuras;
- agregações por grande volume podem demandar índices e ajustes.

## Decisão final

Usar PostgreSQL como fonte de verdade.

---

# 8. Prisma

## Escolha

```txt
Prisma
```

## Motivos

- boa integração com TypeScript;
- geração de tipos;
- migrations;
- produtividade;
- adequado para portfólio.

## Trade-offs

### Vantagens

- tipagem;
- menos boilerplate;
- schema centralizado;
- migrations integradas.

### Desvantagens

- menos controle fino do SQL;
- queries complexas podem exigir cuidado;
- pode esconder detalhes de SQL se usado sem entendimento.

## Decisão final

Usar Prisma para acesso ao PostgreSQL.

---

# 9. Redis para cache e rate limit

## Escolha

Redis será usado para:

- cache de redirecionamento;
- rate limit.

## Motivos

O endpoint de redirecionamento tende a ser rota de alta leitura. Cachear `shortCode -> dados do link` reduz consultas ao PostgreSQL.

Rate limit com Redis permite controle por IP ou usuário com TTL.

## Trade-offs

### Vantagens

- melhora performance do redirect;
- reduz carga no banco;
- permite rate limit eficiente;
- adiciona competência relevante ao projeto.

### Desvantagens

- adiciona infraestrutura;
- exige invalidação;
- cache pode ficar desatualizado;
- precisa tratar indisponibilidade do Redis.

## Decisão final

Usar Redis como infraestrutura auxiliar, não fonte de verdade.

---

# 10. Zod

## Escolha

```txt
Zod
```

## Motivos

- validação declarativa;
- integração com TypeScript;
- pode ser usado no backend e no frontend;
- boa integração com React Hook Form.

## Trade-offs

### Vantagens

- schemas legíveis;
- inferência de tipos;
- validação padronizada.

### Desvantagens

- schemas precisam ser mantidos;
- regras de domínio complexas não devem ficar apenas no Zod.

## Decisão final

Usar Zod para validar body, params, query e formulários.

---

# 11. JWT com bcrypt

## Escolha

- JWT;
- bcrypt.

## Motivos

- simples;
- comum no mercado;
- suficiente para MVP;
- fácil de integrar no frontend.

## Trade-offs

### Vantagens

- implementação direta;
- funciona bem com APIs REST;
- fácil de testar.

### Desvantagens

- sem refresh token, sessão é mais simples;
- revogação de tokens não será robusta no MVP.

## Decisão final

Usar JWT simples no MVP. Refresh token fica fora do escopo inicial.

---

# 12. React, TypeScript e Vite

## Escolha

```txt
React + TypeScript + Vite
```

## Motivos

- React é amplamente usado;
- TypeScript melhora manutenção;
- Vite é rápido e simples;
- não há necessidade de Next.js no MVP;
- backend já será responsável por API e redirecionamento.

## Trade-offs

### Vantagens

- setup simples;
- build rápido;
- boa experiência de desenvolvimento;
- suficiente para dashboard SaaS.

### Desvantagens

- sem SSR;
- roteamento e estrutura precisam ser definidos manualmente.

## Decisão final

Usar React com Vite.

---

# 13. Feature-based architecture no frontend

## Escolha

Organizar frontend por features:

- auth;
- dashboard;
- links;
- analytics.

## Motivos

- evita pasta global de componentes sem contexto;
- agrupa arquivos relacionados;
- melhora manutenção;
- facilita evolução.

## Trade-offs

### Vantagens

- maior coesão;
- leitura clara;
- fácil evoluir features.

### Desvantagens

- exige decidir o que é shared;
- pode gerar duplicação leve.

## Decisão final

Usar feature-based architecture.

---

# 14. TanStack Query

## Escolha

Gerenciamento de server state:

```txt
TanStack Query
```

## Motivos

- aplicação depende de dados da API;
- facilita cache, loading, error e refetch;
- evita gerenciar server state manualmente com `useEffect`.

## Trade-offs

### Vantagens

- melhora UX;
- reduz código manual;
- cache de requests;
- bom padrão de mercado.

### Desvantagens

- adiciona biblioteca;
- exige entender queries, mutations e invalidation.

## Decisão final

Usar TanStack Query.

---

# 15. React Hook Form + Zod

## Escolha

- React Hook Form;
- Zod;
- @hookform/resolvers.

## Motivos

- bom desempenho;
- integração com schemas;
- validação consistente;
- adequado para login, cadastro, criação e edição de links.

## Decisão final

Usar React Hook Form com Zod.

---

# 16. Tailwind CSS + shadcn/ui

## Escolha

- Tailwind CSS;
- shadcn/ui.

## Motivos

- UI moderna rapidamente;
- consistência visual;
- shadcn/ui combina com dashboard;
- Tailwind reduz CSS global complexo.

## Decisão final

Usar Tailwind CSS com shadcn/ui.

---

# 17. Recharts

## Escolha

```txt
Recharts
```

## Motivos

- simples para React;
- suficiente para gráficos de cliques por dia;
- boa integração com dashboard.

## Decisão final

Usar Recharts para analytics visual.

---

# 18. Backend redirect

## Escolha

O redirecionamento `/r/:shortCode` será feito no backend.

## Motivos

- mais correto semanticamente;
- não depende de carregar React;
- permite HTTP 302;
- permite analytics no servidor;
- permite Redis cache;
- permite rate limit por IP.

## Decisão final

Usar redirect no backend.

---

# 19. Analytics básico no MVP

## Escolha

Analytics do MVP:

- total de cliques;
- cliques hoje;
- cliques últimos 7 dias;
- cliques por dia;
- últimos acessos;
- top links.

Fora do MVP:

- país;
- cidade;
- dispositivo;
- navegador;
- sistema operacional;
- visitante único real;
- detecção de bot.

## Decisão final

Usar analytics baseado em eventos simples.

---

# 20. Soft delete para links

## Escolha

Links serão excluídos com `deletedAt`.

## Motivos

- mantém histórico;
- evita perda acidental;
- preserva relação com eventos de analytics.

## Decisão final

Usar soft delete em `ShortLink`.

---

# 21. Resumo das decisões

| Área | Decisão |
|---|---|
| Projeto | Fullstack monorepo |
| Workspaces | npm workspaces |
| Backend | Node.js + Express + TypeScript |
| Backend architecture | Monólito modular |
| Frontend | React + TypeScript + Vite |
| Frontend architecture | Feature-based architecture |
| Banco | PostgreSQL |
| ORM | Prisma |
| Validação | Zod |
| Auth | JWT + bcrypt |
| Cache | Redis |
| Rate limit | Redis |
| UI | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Charts | Recharts |
| Testes backend | Vitest + Supertest |
| Testes frontend | Vitest + React Testing Library |
| Redirect | Backend |
| Analytics | Eventos básicos no PostgreSQL |
| Exclusão de links | Soft delete |
