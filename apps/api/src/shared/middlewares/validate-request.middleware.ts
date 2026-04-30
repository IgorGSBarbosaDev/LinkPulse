import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      })

      req.body = parsed.body ?? req.body
      req.params = parsed.params ?? req.params
      ;(req as Request & { query: unknown }).query = parsed.query ?? req.query

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