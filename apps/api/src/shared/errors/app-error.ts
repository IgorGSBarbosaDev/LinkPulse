export type ErrorDetail = {
    field?: string
    message: string
}

type AppErrorParams = {
    statusCode: number
    error: string
    message: string
    details?: ErrorDetail[]
}

export class AppError extends Error {
    public readonly statusCode: number
    public readonly error: string
    public readonly details: ErrorDetail[]

    constructor(params: AppErrorParams){
        super(params.message)

        this.name = 'AppError'
        this.statusCode = params.statusCode
        this.error = params.error
        this.details = params.details ?? []

        Error.captureStackTrace?.(this, this.constructor) 
    }
}