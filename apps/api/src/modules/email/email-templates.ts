type VerificationTemplateInput = {
  name: string
  verificationUrl: string
  expirationMinutes: number
}

export function buildVerificationEmail(input: VerificationTemplateInput) {
  const subject = 'Verify your LinkPulse account'
  const text = [
    `Hello, ${input.name}.`,
    '',
    'Your LinkPulse account was created successfully.',
    'To activate your account, click the link below:',
    '',
    input.verificationUrl,
    '',
    `This link expires in ${input.expirationMinutes} minutes.`,
    'If you did not create this account, you can ignore this email.',
  ].join('\n')

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f5;color:#18181b;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:28px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#71717a;">LinkPulse</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#18181b;">Verify your account</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">Hello, ${input.name}. Your LinkPulse account was created successfully.</p>
        <a href="${input.verificationUrl}" style="display:inline-block;margin:8px 0 18px;padding:12px 18px;border-radius:8px;background:#18181b;color:#ffffff;text-decoration:none;font-weight:700;">Validate account</a>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#52525b;">This link expires in ${input.expirationMinutes} minutes.</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">If you did not create this account, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`

  return {
    subject,
    text,
    html,
  }
}
