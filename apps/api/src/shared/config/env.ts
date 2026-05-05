import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required'),

  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .default('redis://localhost:6379'),

  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must have at least 16 characters'),

  JWT_EXPIRES_IN: z
    .string()
    .default('1h'),

  EMAIL_PROVIDER: z
    .enum(['console', 'smtp'])
    .default('console'),

  EMAIL_FROM: z
    .string()
    .min(1)
    .default('LinkPulse <no-reply@linkpulse.app>'),

  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(60),

  EMAIL_VERIFICATION_URL: z
    .string()
    .url()
    .default('http://localhost:5173/verify-email'),

  SMTP_HOST: z
    .string()
    .default(''),

  SMTP_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(587),

  SMTP_USER: z
    .string()
    .default(''),

  SMTP_PASS: z
    .string()
    .default(''),

  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  APP_BASE_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),

  FRONTEND_URL: z
    .string()
    .url()
    .default('http://localhost:5173'),

  RATE_LIMIT_REDIRECT_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(100),

  RATE_LIMIT_REDIRECT_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60),

  RATE_LIMIT_CREATE_LINK_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(20),

  RATE_LIMIT_CREATE_LINK_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(3600),

  RATE_LIMIT_LOGIN_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(10),

  RATE_LIMIT_LOGIN_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60),

  RATE_LIMIT_REGISTER_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(5),

  RATE_LIMIT_REGISTER_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(3600),

  RATE_LIMIT_EMAIL_VERIFICATION_RESEND_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(3),

  RATE_LIMIT_EMAIL_VERIFICATION_RESEND_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(3600),

  REDIRECT_CACHE_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(3600),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')

  console.error(
    parsedEnv.error.flatten().fieldErrors,
  )

  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data

export type Env = z.infer<typeof envSchema>
