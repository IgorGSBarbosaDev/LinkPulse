import { Link } from 'react-router-dom'

import { env } from '../../../shared/lib/env'

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-content items-center justify-center px-6">
          <span className="text-xl font-bold tracking-tight text-primary">
            {env.appName}
          </span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-content flex-col gap-24 px-6 pb-24 pt-32">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <h1 className="mb-4 text-[32px] font-semibold leading-[1.2] tracking-[-0.02em] text-primary">
            Suas metricas, encurtadas para o essencial.
          </h1>
          <p className="mb-8 max-w-xl text-sm leading-[1.6] text-muted-foreground">
            LinkPulse é um encurtador de links técnico para criar, administrar e acompanhar cliques com clareza.
          </p>
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <Link
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-6 py-3 text-xs font-medium uppercase tracking-label text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              to="/register"
            >
              Criar conta
            </Link>
            <Link
              className="inline-flex w-full items-center justify-center rounded-md border border-border bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-label text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
              to="/login"
            >
              Login
            </Link>
          </div>
        </section>

        <section className="flex flex-col items-center opacity-70">
          <span className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Built for performance
          </span>
          <div className="flex items-center gap-8 text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]">speed</span>
            <span className="material-symbols-outlined text-[20px]">dns</span>
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-md border border-muted bg-card p-6 transition-colors duration-300 hover:bg-muted">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">my_location</span>
              <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">Precisao</h2>
            </div>
            <p className="text-sm leading-[1.6] text-muted-foreground">
              Analytics básicos com total de cliques, série diária e acessos recentes, incluindo user-agent e referer quando disponíveis.
            </p>
          </article>
          <article className="rounded-md border border-muted bg-card p-6 transition-colors duration-300 hover:bg-muted">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">Controle Total</h2>
            </div>
            <p className="text-sm leading-[1.6] text-muted-foreground">
              Defina expiração, limite máximo de cliques e o estado ativo ou inativo de cada link.
            </p>
          </article>
          <article className="rounded-md border border-muted bg-card p-6 transition-colors duration-300 hover:bg-muted">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">grid_view</span>
              <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">Design</h2>
            </div>
            <p className="text-sm leading-[1.6] text-muted-foreground">
              Uma interface focada na produtividade para criar links, revisar métricas e executar ações rápidas.
            </p>
          </article>
          <article className="rounded-md border border-muted bg-card p-6 transition-colors duration-300 hover:bg-muted">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">enhanced_encryption</span>
              <h2 className="text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">Seguranca</h2>
            </div>
            <p className="text-sm leading-[1.6] text-muted-foreground">
              JWT, bcrypt, rate limit e regras de ownership protegem as contas e os links do MVP.
            </p>
          </article>
        </section>

        <section className="w-full">
          <div className="overflow-hidden rounded-lg border border-muted bg-surface shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
            <div className="flex h-12 items-center gap-4 border-b border-muted bg-card px-4">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted" />
                <span className="size-2.5 rounded-full bg-muted" />
                <span className="size-2.5 rounded-full bg-muted" />
              </div>
              <div className="flex h-6 w-64 items-center rounded border border-muted/60 bg-surface px-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  app.linkpulse.io/dashboard
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-background p-6 lg:grid-cols-3">
              <div className="flex h-64 flex-col rounded-md border border-muted bg-card p-6 lg:col-span-2">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                      Cliques registrados
                    </p>
                    <p className="mt-1 text-2xl font-semibold leading-[1.3] tracking-[-0.02em] text-primary">Analytics MVP</p>
                  </div>
                  <span className="material-symbols-outlined text-muted-foreground">more_horiz</span>
                </div>
                <div className="relative flex grow items-end gap-1 pt-8 opacity-80">
                  <span className="absolute bottom-0 left-0 h-px w-full bg-muted/30" />
                  <span className="h-[20%] w-full rounded-t bg-muted" />
                  <span className="h-[35%] w-full rounded-t bg-muted" />
                  <span className="h-[25%] w-full rounded-t bg-muted" />
                  <span className="h-[60%] w-full rounded-t bg-muted" />
                  <span className="h-[45%] w-full rounded-t bg-muted" />
                  <span className="relative h-[85%] w-full rounded-t border-t border-primary bg-primary/20">
                    <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-primary ring-2 ring-background" />
                  </span>
                  <span className="h-[55%] w-full rounded-t bg-muted" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-md border border-muted bg-card p-4">
                  <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                    Decisoes mais rapidas
                  </p>
                    <p className="mt-2 text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">Dados claros</p>
                  <p className="mt-1 flex items-center gap-1 text-[13px] leading-[1.5] text-muted-foreground">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    Acompanhe cada acesso válido
                  </p>
                </div>
                <div className="flex-1 rounded-md border border-muted bg-card p-4">
                  <p className="text-xs font-medium uppercase tracking-label text-muted-foreground">
                    Links sob controle
                  </p>
                  <p className="mt-2 text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">1 painel</p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-muted-foreground">Links, cliques e resultados</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <h2 className="mb-8 text-center text-2xl font-semibold leading-[1.3] tracking-[-0.02em] text-primary">Processo Linear</h2>
          <div className="relative ml-4 flex flex-col gap-8 border-l border-muted pl-8">
            <div className="relative">
              <span className="absolute -left-[37px] top-1 size-4 rounded-full border-2 border-primary bg-background" />
              <h3 className="mb-1 text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">1. Encurte</h3>
              <p className="text-sm leading-[1.6] text-muted-foreground">
                Insira sua URL longa e gere um identificador curto persistente.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-[37px] top-1 size-4 rounded-full border-2 border-muted bg-background" />
              <h3 className="mb-1 text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">2. Analise</h3>
              <p className="text-sm leading-[1.6] text-muted-foreground">
                Acompanhe cliques, tendências e acessos no dashboard.
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-[37px] top-1 size-4 rounded-full border-2 border-muted bg-background" />
              <h3 className="mb-1 text-[20px] font-semibold leading-[1.4] tracking-[-0.01em] text-primary">3. Otimize</h3>
              <p className="text-sm leading-[1.6] text-muted-foreground">
                Edite configurações, ative ou desative links e use os dados registrados para decidir os próximos passos.
              </p>
            </div>
          </div>
        </section>

      </section>

      <footer className="mt-auto w-full border-t border-border bg-background py-12">
        <div className="mx-auto flex w-full max-w-content flex-col items-center justify-between gap-4 border-t border-border px-6 pt-8 md:flex-row">
          <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">© 2026 LinkPulse</div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            MVP: autenticação, links, redirects e analytics básicos
          </p>
        </div>
      </footer>
    </main>
  )
}
