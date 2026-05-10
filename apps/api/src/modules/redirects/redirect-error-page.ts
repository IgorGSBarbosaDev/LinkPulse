import type { Request, Response } from 'express'

type RedirectErrorPage = {
  title: string
  description: string
}

const pageByStatus: Record<number, RedirectErrorPage> = {
  404: {
    title: 'Link not found',
    description: 'The short link does not exist or was removed.',
  },
  410: {
    title: 'Link unavailable',
    description: 'This short link is no longer available.',
  },
  429: {
    title: 'Too many requests',
    description: 'Wait a moment before trying this link again.',
  },
  500: {
    title: 'Redirect unavailable',
    description: 'The redirect could not be completed right now.',
  },
}

const fallbackPage: RedirectErrorPage = {
  title: 'Redirect unavailable',
  description: 'The redirect could not be completed right now.',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function frontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173'
}

export function shouldRenderRedirectErrorPage(req: Request): boolean {
  const acceptHeader = req.headers.accept ?? ''

  return req.path.startsWith('/r/') && acceptHeader.includes('text/html')
}

export function sendRedirectErrorPage(
  req: Request,
  res: Response,
  statusCode: number,
): Response<string> {
  const page = pageByStatus[statusCode] ?? fallbackPage
  const homeUrl = frontendUrl()
  const escapedTitle = escapeHtml(page.title)
  const escapedDescription = escapeHtml(page.description)
  const escapedHomeUrl = escapeHtml(homeUrl)
  const shortCodeParam = req.params.shortCode
  const shortCode = Array.isArray(shortCodeParam)
    ? shortCodeParam[0]
    : shortCodeParam
  const escapedShortCode = escapeHtml(shortCode ?? 'unknown')

  return res.status(statusCode).type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle} - LinkPulse</title>
    <style>
      :root {
        color-scheme: dark;
        --background: #141313;
        --foreground: #e5e2e1;
        --card: #1c1b1b;
        --surface: #201f1f;
        --muted: #353434;
        --muted-foreground: #c4c7c8;
        --border: #2a2a2a;
        --primary: #ffffff;
        --primary-foreground: #2f3131;
      }
      * { box-sizing: border-box; }
      body {
        min-width: 320px;
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 40px 16px;
        background: var(--background);
        color: var(--foreground);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }
      main {
        width: min(100%, 448px);
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card);
      }
      header {
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        padding: 12px 20px;
      }
      .brand {
        margin: 0;
        color: var(--muted-foreground);
        font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .05em;
        text-transform: uppercase;
      }
      section {
        padding: 20px;
      }
      .icon {
        display: grid;
        width: 44px;
        height: 44px;
        place-items: center;
        margin-bottom: 16px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--background);
        color: var(--muted-foreground);
      }
      h1 {
        margin: 0;
        font-size: 32px;
        line-height: 1.1;
        font-weight: 650;
      }
      p {
        margin: 8px 0 0;
        color: var(--muted-foreground);
        font-size: 14px;
      }
      .code {
        margin-top: 16px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--background);
        padding: 10px 12px;
        color: var(--muted-foreground);
        font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
        font-size: 12px;
      }
      footer {
        margin-top: 24px;
        border-top: 1px solid var(--border);
        padding-top: 16px;
      }
      a {
        display: inline-flex;
        min-height: 40px;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: var(--primary);
        padding: 8px 12px;
        color: var(--primary-foreground);
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <header><p class="brand">LinkPulse</p></header>
      <section>
        <div class="icon" aria-hidden="true">!</div>
        <h1>${escapedTitle}</h1>
        <p>${escapedDescription}</p>
        <div class="code">Short code: ${escapedShortCode}</div>
        <footer>
          <a href="${escapedHomeUrl}">Back home</a>
        </footer>
      </section>
    </main>
  </body>
</html>`)
}
