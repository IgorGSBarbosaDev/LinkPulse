import type { NextFunction, Request, Response } from 'express'
import { AuthService } from './auth.service.js'
import { AppError } from '../../shared/errors/app-error.js'
import type {
    LoginInput,
    RegisterInput,
} from './auth.types.js'

type AuthenticatedRequest = Request & {
    user?: {
        id: string
        email: string
    }
}

export class AuthController {
    static register = async (
        req: Request,
        res: Response,
        next: NextFunction 
    ): Promise<void> => {
        try {
            const input = req.body as RegisterInput
            const response = await AuthService.register(input)
            res.status(201).json(response)
        } catch (error) {
            next(error)
        }
    }
    static login = async (
        req: Request,
        res: Response,
        next: NextFunction 
    ): Promise<void> => {
        try {
            const input = req.body as LoginInput
            const authResponse = await AuthService.login(input)
            res.status(200).json(authResponse)
        } catch (error) {
            next(error)
        }
    }

    static me = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ):Promise<void> =>{
        try {
            const userId = req.user?.id

            if(!userId){
                throw AppError.unauthorized('Authentication required')
            }
            const user = await AuthService.getCurrentUser(userId)
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }

}
