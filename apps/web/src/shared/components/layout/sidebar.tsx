import {
  LayoutDashboard,
  Link as LinkIcon,
  Plus,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/utils'

type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Links', to: '/links', icon: LinkIcon, end: true },
  { label: 'Create link', to: '/links/new', icon: Plus },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-low md:flex md:min-h-svh md:flex-col">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
          LinkPulse
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )
              }
              end={item.end}
              key={item.label}
              to={item.to}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          MVP foundation. Data wiring arrives in later phases.
        </p>
      </div>
    </aside>
  )
}

export function MobileNavigation() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface-low px-3 py-2 md:hidden">
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-muted text-foreground',
              )
            }
            end={item.end}
            key={item.label}
            to={item.to}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
