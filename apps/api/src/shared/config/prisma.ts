import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

const databaseUrl =
  env.NODE_ENV === 'test' && env.DATABASE_URL_TEST
    ? env.DATABASE_URL_TEST
    : env.DATABASE_URL

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
})
