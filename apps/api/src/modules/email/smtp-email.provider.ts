import nodemailer from 'nodemailer'
import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import type { EmailProvider, SendEmailInput } from './email-provider.js'

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  })

  async send(input: SendEmailInput): Promise<void> {
    if (!env.SMTP_HOST) {
      throw AppError.internal('SMTP provider is not configured.')
    }

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
  }
}
