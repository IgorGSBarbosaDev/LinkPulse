import { Router } from 'express'
import { AuthController } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
import { validateRequest } from '../../shared/middlewares/validate-request.middleware.js'
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'

export const authRoutes = Router()

authRoutes.post(
    '/register',
    validateRequest(registerSchema),
    AuthController.register
)

authRoutes.post(
    '/login',
    validateRequest(loginSchema),
    AuthController.login
)

authRoutes.get(
    '/me',
    authMiddleware,
    AuthController.me
)