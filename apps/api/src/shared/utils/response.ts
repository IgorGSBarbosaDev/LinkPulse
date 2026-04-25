import type { Response } from 'express'

type SuccessResponseParams<T> = {
  res: Response
  statusCode?: number
  data?: T
}

type PaginatedResponseParams<T> = {
  res: Response
  data: T[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export function sendSuccess<T>({
  res,
  statusCode = 200,
  data,
}: SuccessResponseParams<T>): Response {
  if (statusCode === 204) {
    return res.status(204).send()
  }

  return res.status(statusCode).json(data)
}

export function sendPaginated<T>({
  res,
  data,
  pagination,
}: PaginatedResponseParams<T>): Response {
  return res.status(200).json({
    data,
    pagination,
  })
}