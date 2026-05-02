import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../../features/auth/hooks/use-auth'
import { Button } from '../ui/button'

const titlesByPath: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/links': 'Links',
  '/links/new': 'Create link',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string) {
  if (pathname.endsWith('/edit')) {
    return 'Edit link'
  }

  if (pathname.endsWith('/analytics')) {
    return 'Link analytics'
  }

  if (pathname.startsWith('/links/') && pathname !== '/links/new') {
    return 'Link details'
  }

  return titlesByPath[pathname] ?? 'LinkPulse'
}

export function Header() {
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {getPageTitle(location.pathname)}
          </span>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {location.pathname}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:inline">
            {user.email}
          </span>
        ) : null}
        <Link
          className="hidden h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          to="/links/new"
        >
          New link
        </Link>
        <Button onClick={logout} size="sm" variant="ghost">
          <LogOut aria-hidden="true" className="size-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
