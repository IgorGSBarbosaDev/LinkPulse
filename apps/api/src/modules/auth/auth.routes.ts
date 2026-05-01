import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'
import { env } from '../../shared/config/env.js'
import { byIpRateLimit } from '../../shared/middlewares/rate-limit.middleware.js'

export const authRoutes = Router()

authRoutes.post(
    '/register',
    validateRequest(registerSchema),
    AuthController.register
)

authRoutes.post(
    '/login',
    byIpRateLimit({
        keyPrefix: 'rate:login',
        max: env.RATE_LIMIT_LOGIN_MAX,
        windowInSeconds: env.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
    }),
    validateRequest(loginSchema),
    AuthController.login
)

authRoutes.get(
    '/me',
    authMiddleware,
    AuthController.me
)
