export type CreatedEmailVerificationToken = {
  token: string
  expiresAt: Date
}

export type EmailVerificationResult = {
  message: string
}
