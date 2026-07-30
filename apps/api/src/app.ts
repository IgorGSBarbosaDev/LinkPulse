// apps/api/src/app.ts

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import { errorHandler } from './shared/errors/error-handler.js'
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware.js'
import {
  openApiSpec,
  swaggerServe,
  swaggerSetup,
} from './shared/config/swagger.js'
import { prisma } from './shared/config/prisma.js'
import { redis } from './shared/config/redis.js'
import { env } from './shared/config/env.js'
import { requestContextMiddleware } from './shared/middlewares/request-context.middleware.js'

import { authRoutes } from './modules/auth/auth.routes.js'
import { analyticsRoutes } from './modules/analytics/analytics.routes.js'
import { linksRoutes } from './modules/links/links.routes.js'
import { redirectRoutes } from './modules/redirects/redirects.routes.js'

dotenv.config()

export const app = express()

function isAllowedDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin)

    return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

app.use(helmet())
app.use(requestContextMiddleware)

app.use(
  cors({
    origin(origin, callback) {
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

      if (!origin || origin === frontendUrl) {
        return callback(null, true)
      }

      if (
        process.env.NODE_ENV !== 'production' &&
        isAllowedDevelopmentOrigin(origin)
      ) {
        return callback(null, true)
      }

      return callback(new Error('Origin not allowed by CORS'))
    },
  }),
)

app.use(express.json())
app.use('/docs', swaggerServe, swaggerSetup)
app.get('/docs.json', (_req, res) => {
  res.json(openApiSpec)
})

app.get('/health', async (_req, res) => {
  let postgres: 'up' | 'down' = 'up'
  let redisStatus: 'up' | 'down' = 'up'
  let postgresLatencyMs = 0
  let redisLatencyMs = 0

  try {
    const startedAt = Date.now()
    await prisma.$queryRawUnsafe('SELECT 1')
    postgresLatencyMs = Date.now() - startedAt
  } catch {
    postgres = 'down'
  }

  try {
    const startedAt = Date.now()
    await redis.ping()
    redisLatencyMs = Date.now() - startedAt
  } catch {
    redisStatus = 'down'
  }

  const status =
    postgres === 'down' ? 'down' : redisStatus === 'down' ? 'degraded' : 'ok'
  const statusCode = postgres === 'down' ? 503 : 200

  return res.status(statusCode).json({
    status,
    app: 'LinkPulse API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: env.APP_VERSION,
    requestId: (_req as unknown as { requestId?: string }).requestId,
    dependencies: {
      postgres,
      redis: redisStatus,
    },
    checks: {
      postgres: { status: postgres, latencyMs: postgresLatencyMs },
      redis: { status: redisStatus, latencyMs: redisLatencyMs },
    },
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/links', linksRoutes)
app.use('/api/v1', analyticsRoutes)
app.use('/r', redirectRoutes)

app.use(notFoundMiddleware)
app.use(errorHandler)
