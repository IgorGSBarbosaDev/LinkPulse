import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../shared/config/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type{
    AuthResponse,
    AuthUser,
    JwtPayload,
    LoginInput,
    RegisterInput
} from './auth.types.ts'
import { email } from 'zod'
import { STATUS_CODES } from 'node:http'
import { error } from 'node:console'

const PASSWORD_SALT_ROUNDS = 10
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600 // 1 hour

export class AuthService {
    static async register(input: RegisterInput): Promise<AuthUser> {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: input.email
            }
        })

        if (existingUser){
            throw new AppError({
                statusCode: 409,
                message: 'Email already registered',
                error: 'Conflict'
            })
        }
        
        const passwordHash = await prisma.bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS)

        const user = await prisma.user.create({
            data:{
                name: input.name,
                email: input.email,
                passwordHash
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })
        return user
    }

    static async login(input: LoginInput): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: {
                email: input.email
            }
        })

        if (!user){
            throw new AppError({
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Unauthorized'
            })
        }

        const passwordMatches = await bcrypt.compare(
            input.password,
            user.passwordHash
        )

        if (!passwordMatches){
            throw new AppError({
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Unauthorized'
            })
        }

        const authUser: AuthUser = {
            id: user.id,
            name: user.name,
            email: user.email
        }

        const acessToken = this.generateAcessToken({
            sub: user.id,
            email: user.email
        })

        return {
            acessToken,
            tokenType: 'Bearer',
            expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
            user: authUser
        }
    }

    static async getCurrentUser(userId: string): Promise<AuthUser> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        if (!user) {
      throw new AppError({
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      })
    }

        return user;
    }

    private static generateAcessToken(payload: JwtPayload): string {
        const secret = process.env.JWT_SECRET
        if (!secret){
            throw new AppError({
                statusCode: 500,
                message: 'JWT secret not configured',
                error: 'Internal Server Error'
            })
        }
        return jwt.sign(payload, secret, {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        })
    }

}