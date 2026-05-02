import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('app base routes', () => {
  it('serves swagger docs', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app).get('/docs')

    expect(response.status).toBe(301)
    expect(response.headers.location).toBe('/docs/')
  })

  it('returns health payload with dependencies', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app).get('/health')

    expect([200, 503]).toContain(response.status)
    expect(response.body).toMatchObject({
      app: 'LinkPulse API',
      dependencies: {
        postgres: expect.stringMatching(/^(up|down)$/),
        redis: expect.stringMatching(/^(up|down)$/),
      },
    })
  })
})
