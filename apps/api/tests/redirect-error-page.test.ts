import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { AppError } from '../src/shared/errors/app-error.js'
import { errorHandler } from '../src/shared/errors/error-handler.js'

function createRedirectErrorApp(error: Error) {
  const app = express()

  app.get('/r/:shortCode', (_req, _res, next) => {
    next(error)
  })

  app.use(errorHandler)

  return app
}

describe('redirect error pages', () => {
  it('returns visual HTML for browser 404 redirect errors', async () => {
    const app = createRedirectErrorApp(AppError.notFound('Link not found.'))

    const response = await request(app)
      .get('/r/missing')
      .set('Accept', 'text/html')
      .expect(404)

    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Link not found')
    expect(response.text).toContain('The short link does not exist or was removed.')
  })

  it('returns visual HTML for browser 410 redirect errors', async () => {
    const app = createRedirectErrorApp(AppError.gone('Link has expired.'))

    const response = await request(app)
      .get('/r/expired')
      .set('Accept', 'text/html')
      .expect(410)

    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Link unavailable')
    expect(response.text).toContain('This short link is no longer available.')
  })

  it('returns visual HTML for browser 429 redirect errors', async () => {
    const app = createRedirectErrorApp(AppError.tooManyRequests())

    const response = await request(app)
      .get('/r/limited')
      .set('Accept', 'text/html')
      .expect(429)

    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Too many requests')
    expect(response.text).toContain('Wait a moment before trying this link again.')
  })

  it('keeps JSON contract for non-browser redirect clients', async () => {
    const app = createRedirectErrorApp(AppError.notFound('Link not found.'))

    const response = await request(app)
      .get('/r/missing')
      .set('Accept', 'application/json')
      .expect(404)

    expect(response.headers['content-type']).toContain('application/json')
    expect(response.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'Link not found.',
      details: [],
    })
  })
})
