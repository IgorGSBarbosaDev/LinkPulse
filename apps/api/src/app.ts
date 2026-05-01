// apps/api/src/app.ts

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import { errorHandler } from './shared/errors/error-handler.js'
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware.js'

import { authRoutes } from './modules/auth/auth.routes.js'
import { redirectRoutes } from './modules/redirects/redirects.routes.js'
// import { linksRoutes } from './modules/links/links.routes.js'
// import { analyticsRoutes } from './modules/analytics/analytics.routes.js'

dotenv.config()

export const app = express()

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  }),
)

app.use(express.json())

app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    app: 'LinkPulse API',
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/r', redirectRoutes)

// app.use('/api/v1/links', linksRoutes)
// app.use('/api/v1/analytics', analyticsRoutes)

app.use(notFoundMiddleware)
app.use(errorHandler)
