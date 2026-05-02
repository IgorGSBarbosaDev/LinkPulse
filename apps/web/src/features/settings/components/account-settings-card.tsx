import { LogOut, UserRound } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import type { AccountSettings } from '../types'

type AccountSettingsCardProps = {
  account: AccountSettings
  onLogout: () => void
}

export function AccountSettingsCard({
  account,
  onLogout,
}: AccountSettingsCardProps) {
  return (
    <section
      aria-label="Account profile"
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-md border border-border bg-background p-2 text-muted-foreground">
          <UserRound aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">Account profile</h2>
          <p className="text-sm text-muted-foreground">
            Profile is read-only in MVP. Source: authenticated session.
          </p>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-3">
          <dt className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Name
          </dt>
          <dd className="mt-1 text-sm text-foreground">{account.name}</dd>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <dt className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Email
          </dt>
          <dd className="mt-1 text-sm text-foreground">{account.email}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button onClick={onLogout} size="sm" variant="secondary">
          <LogOut aria-hidden="true" className="size-4" />
          Logout
        </Button>
      </div>
    </section>
  )
}
