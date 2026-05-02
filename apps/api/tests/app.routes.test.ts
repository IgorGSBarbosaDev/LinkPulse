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

  it('allows CORS for localhost frontend origin', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    )
  })

  it('allows CORS for 127.0.0.1 frontend origin in development', async () => {
    const { app } = await import('../src/app.js')

    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://127.0.0.1:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://127.0.0.1:5173',
    )
  })
})
