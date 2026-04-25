import type { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export function validateRequest(schema: ZodSchema){
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            })

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