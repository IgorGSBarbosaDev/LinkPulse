import { app } from './app.js'
import { env } from './shared/config/env.js'
import { prisma } from './shared/config/prisma.js'
import { connectRedis, disconnectRedis } from './shared/config/redis.js'
import { logger } from './shared/observability/logger.js'

const port = env.PORT

async function startServer() {
  try {
    await prisma.$connect()
    await connectRedis()

    const server = app.listen(port, () => {
      logger.info('api.started', { port })
    })

    const shutdown = async () => {
      server.close(async () => {
        await Promise.allSettled([
          prisma.$disconnect(),
          disconnectRedis(),
        ])
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    logger.error('api.start_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    await Promise.allSettled([
      prisma.$disconnect(),
      disconnectRedis(),
    ])
    process.exit(1)
  }
}

void startServer()
