import { env } from '../../shared/config/env.js'
import { AppError } from '../../shared/errors/app-error.js'
import { ConsoleEmailProvider } from './console-email.provider.js'
import { buildVerificationEmail } from './email-templates.js'
import type { EmailProvider } from './email-provider.js'
import { SmtpEmailProvider } from './smtp-email.provider.js'

type SendVerificationEmailInput = {
  to: string
  name: string
  verificationUrl: string
  expirationMinutes: number
}

class EmailService {
  private readonly provider: EmailProvider

  constructor(provider?: EmailProvider) {
    this.provider = provider ?? this.createProvider()
  }

  async sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
    const email = buildVerificationEmail({
      name: input.name,
      verificationUrl: input.verificationUrl,
      expirationMinutes: input.expirationMinutes,
    })

    await this.provider.send({
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })
  }

  private createProvider(): EmailProvider {
    if (env.EMAIL_PROVIDER === 'smtp') {
      return new SmtpEmailProvider()
    }

    if (env.NODE_ENV === 'production') {
      throw AppError.internal('Production email provider must be SMTP.')
    }

    return new ConsoleEmailProvider()
  }
}

export const emailService = new EmailService()
export { EmailService }
