import { Prisma } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { errorHandler } from '../src/shared/errors/error-handler.js'

function buildMockResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response

  vi.mocked(response.status).mockReturnValue(response)

  return response
}

function buildKnownRequestError(target: unknown) {
  return new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed.',
    {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target },
    },
  )
}

describe('errorHandler P2002 mapping', () => {
  it('maps customAlias conflicts to stable alias message', () => {
    const req = { path: '/api/v1/links', headers: {} } as Request
    const res = buildMockResponse()
    const error = buildKnownRequestError(['customAlias'])

    errorHandler(error, req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: 'This alias is already in use.',
      code: 'CONFLICT',
      details: [],
    })
  })

  it('maps shortCode conflicts to stable short-code message', () => {
    const req = { path: '/api/v1/links', headers: {} } as Request
    const res = buildMockResponse()
    const error = buildKnownRequestError(['shortCode'])

    errorHandler(error, req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: 'This short code is already in use.',
      code: 'CONFLICT',
      details: [],
    })
  })

  it('falls back to a generic conflict message for unrelated unique constraints', () => {
    const req = { path: '/api/v1/links', headers: {} } as Request
    const res = buildMockResponse()
    const error = buildKnownRequestError(['email'])

    errorHandler(error, req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 409,
      error: 'Conflict',
      message: 'Unique constraint violation',
      code: 'CONFLICT',
      details: [],
    })
  })
})
