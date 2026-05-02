import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../../features/auth/hooks/use-auth'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

export function Header() {
  const location = useLocation()
  const { logout } = useAuth()
  const navigationItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Links', to: '/links' },
    { label: 'Settings', to: '/settings' },
  ]

  function isActiveItem(to: string) {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard'
    }

    if (to === '/links') {
      return location.pathname === '/links'
    }

    return location.pathname === to
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="font-mono text-sm font-semibold tracking-wide text-foreground" to="/dashboard">
            LinkPulse
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navigationItems.map((item) => {
              const isActive = isActiveItem(item.to)

              return (
                <Link
                  className={cn(
                    'inline-flex h-9 items-center rounded-md px-3 text-xs font-medium uppercase tracking-label text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    isActive && 'bg-surface text-foreground',
                  )}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={logout} size="sm" variant="ghost">
            <LogOut aria-hidden="true" className="size-4" />
            Logout
          </Button>
        </div>
      </div>
      <nav className="mx-auto flex w-full max-w-content gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden sm:px-6 lg:px-8">
        {navigationItems.map((item) => {
          const isActive = isActiveItem(item.to)

          return (
            <Link
              className={cn(
                'inline-flex h-8 shrink-0 items-center rounded-md px-3 text-xs font-medium uppercase tracking-label text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-surface text-foreground',
              )}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
