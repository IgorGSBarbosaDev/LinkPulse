# Deploy do MVP

Este documento prepara o LinkPulse para deploy, mas não executa nenhuma publicação externa.

## Serviços

- API: `apps/api/Dockerfile`, Node.js/Express.
- Web: `apps/web/Dockerfile`, build Vite servido por Nginx.
- PostgreSQL e Redis: serviços gerenciados ou os containers do `docker-compose.yml` para desenvolvimento.

## Variáveis

Copie `apps/api/.env.production.example` e `apps/web/.env.production.example` para o provedor escolhido. `VITE_API_BASE_URL` é aplicado no build do frontend; `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `APP_BASE_URL` e `FRONTEND_URL` são variáveis de runtime da API.

Não comite segredos. Em produção, use um `JWT_SECRET` aleatório, HTTPS e URLs públicas coerentes com CORS.

## Migrations

O container da API executa `prisma migrate deploy` antes de iniciar o processo. Para aplicar manualmente:

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@HOST:5432/DATABASE'
npm run prisma:migrate -w apps/api
```

As migrations versionadas ficam em `apps/api/prisma/migrations`. Faça backup do PostgreSQL antes de qualquer migração em ambiente com dados.

## Validação local dos containers

```powershell
docker build -f apps/api/Dockerfile -t linkpulse-api .
docker build -f apps/web/Dockerfile -t linkpulse-web .
```

Depois, forneça as variáveis de produção ao runtime e valide `/health`, o login e um redirect público. O CI cobre os gates estáticos e o E2E; verificação de DNS, TLS, CORS real e banco gerenciado continua dependente do ambiente de destino.
