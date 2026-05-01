import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

type ParsedRequestData = {
  body?: unknown
  params?: Request['params']
  query?: unknown
}

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as ParsedRequestData

      req.body = parsed.body ?? req.body
      req.params = parsed.params ?? req.params

      if (parsed.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsed.query,
          writable: true,
          configurable: true,
          enumerable: true,
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/*
schemas should be:
z.object({
  body: z.object({}),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})
*/
