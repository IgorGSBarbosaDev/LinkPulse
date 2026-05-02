import type { ReactNode } from 'react'

type PageContainerProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageContainer({
  title,
  description,
  actions,
  children,
}: PageContainerProps) {
  return (
    <section className="mx-auto flex w-full max-w-content flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            LinkPulse
          </p>
          <h1 className="text-[2rem] font-semibold leading-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
