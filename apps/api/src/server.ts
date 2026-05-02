import { app } from './app.js'
import { env } from './shared/config/env.js'
import { prisma } from './shared/config/prisma.js'
import { connectRedis, disconnectRedis } from './shared/config/redis.js'

const port = env.PORT

async function startServer() {
  try {
    await prisma.$connect()
    await connectRedis()

    const server = app.listen(port, () => {
      console.log(`API running on port ${port}`)
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
    console.error('Failed to start server:', error)
    await Promise.allSettled([
      prisma.$disconnect(),
      disconnectRedis(),
    ])
    process.exit(1)
  }
}

void startServer()
