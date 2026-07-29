# Funcionalidades atuais

## O que é o LinkPulse

O LinkPulse é uma aplicação fullstack para criar, administrar e acompanhar links curtos. O foco atual é o MVP de encurtamento de URLs com autenticação, controle dos próprios links e analytics básicos de cliques.

## Funcionalidades disponíveis

### Autenticação

- Cadastro com nome, e-mail e senha.
- Login com e-mail e senha.
- Senha armazenada com hash bcrypt.
- Autenticação das rotas privadas por JWT Bearer.
- Consulta do usuário autenticado em `GET /api/v1/auth/me`.
- Proteção de rotas públicas e privadas no frontend.
- Rate limit por IP para cadastro e login.

Não há verificação de e-mail, refresh token, login social ou recuperação de senha no estado atual.

### Links curtos

O usuário autenticado pode:

- criar links a partir de uma URL válida;
- receber um código curto aleatório;
- definir um alias personalizado;
- informar título e descrição internos;
- definir data de expiração;
- definir limite máximo de cliques;
- listar seus links com busca, filtro por status, ordenação e paginação;
- consultar os detalhes de um link;
- editar dados do link;
- ativar e desativar o redirecionamento;
- excluir o link por soft delete;
- copiar a URL curta.

Cada usuário só acessa e altera os próprios links. Alias e código curto são únicos.

### Redirecionamento público

O endpoint `GET /r/:shortCode` resolve o código curto e redireciona para a URL original com HTTP 302.

Antes do redirecionamento, o sistema verifica:

- se o link existe;
- se não foi excluído;
- se está ativo;
- se não expirou;
- se ainda não atingiu o limite de cliques.

A rota pública possui rate limit por IP. Acessos válidos registram um evento e incrementam o contador de cliques.

### Analytics

Cada redirecionamento válido pode registrar:

- link acessado;
- data e hora;
- endereço IP, quando disponível;
- user-agent;
- referer.

A API fornece:

- resumo de analytics por link;
- cliques agrupados por dia;
- eventos de acesso paginados;
- ranking de links mais acessados.
- endpoint agregado do dashboard com métricas, gráfico, top links e acessos recentes.

O frontend apresenta dashboard geral, cards de métricas, gráfico de cliques por dia, links recentes e uma página de analytics detalhada por link.

### Interface web

O frontend React possui:

- landing page;
- login e cadastro;
- dashboard protegido;
- listagem e gerenciamento de links;
- criação, edição e detalhes de link;
- página de analytics do link;
- tela de configurações com dados básicos da conta;
- estados de carregamento, vazio, erro, não encontrado, sem permissão e sessão expirada.

## Tecnologias e responsabilidades

- `apps/api`: API REST em Node.js, Express e TypeScript.
- `apps/web`: aplicação React com Vite, React Router e TanStack Query.
- PostgreSQL: fonte de verdade dos usuários, links e eventos de acesso.
- Prisma: acesso e persistência no PostgreSQL.
- Redis: cache de redirecionamentos e armazenamento temporário dos rate limits.
- `packages/shared`: espaço para código realmente compartilhado entre aplicações.

## Foco atual do projeto

O foco é entregar um encurtador de links funcional e seguro para uso individual, com:

1. autenticação simples;
2. gerenciamento dos próprios links;
3. redirecionamento público confiável;
4. registro de cliques;
5. analytics básicos;
6. dashboard web;
7. testes e documentação do MVP.

O projeto não inclui, neste escopo, equipes, planos pagos, domínios personalizados, QR Code, exportação, webhooks, analytics em tempo real ou detecção avançada de bots.
