import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '../../lib/utils'

type PublicFeedbackPageProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: ReactNode
  tone?: 'neutral' | 'success' | 'error'
  children?: ReactNode
  footer?: ReactNode
}

const toneClasses = {
  neutral: 'text-muted-foreground',
  success: 'text-foreground',
  error: 'text-error',
}

export function PublicFeedbackPage({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  children,
  footer,
}: PublicFeedbackPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-surface px-5 py-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-label text-muted-foreground">
            LinkPulse
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex size-11 items-center justify-center rounded-md border border-border bg-background">
              <Icon aria-hidden="true" className={cn('size-5', toneClasses[tone])} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[2rem] font-semibold leading-tight">
                {title}
              </h1>
              <div className="text-sm leading-6 text-muted-foreground">
                {description}
              </div>
            </div>
            {children}
          </div>
          <div className="mt-6 border-t border-border pt-4">
            {footer === undefined ? (
              <Link
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                to="/"
              >
                Back home
              </Link>
            ) : footer}
          </div>
        </div>
      </section>
    </main>
  )
}
