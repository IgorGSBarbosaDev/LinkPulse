import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

export const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    app: 'LinkPulse API',
  })
})