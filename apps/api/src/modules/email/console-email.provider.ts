import type { EmailProvider, SendEmailInput } from './email-provider.js'

export class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    console.log('[Email] Verification email')
    console.log(`To: ${input.to}`)
    console.log(`Subject: ${input.subject}`)
    console.log(input.text)
  }
}
