import { Search } from 'lucide-react'
import type { ChangeEvent } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import type { LinkStatusFilter, LinksFilters } from '../types'

type LinkFiltersProps = {
  filters: LinksFilters
  onChange: (filters: Partial<LinksFilters>) => void
}

const statusOptions: { label: string; value: LinkStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function LinkFilters({ filters, onChange }: LinkFiltersProps) {
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ search: event.target.value, page: 1 })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative flex min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <span className="sr-only">Search links</span>
        <input
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          onChange={handleSearchChange}
          placeholder="Search by title, short code, or URL"
          value={filters.search}
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((option) => (
          <Button
            className={cn(
              'uppercase tracking-label',
              filters.active === option.value &&
                'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
            )}
            key={option.value}
            onClick={() => onChange({ active: option.value, page: 1 })}
            size="sm"
            variant="secondary"
          >
            {option.label}
          </Button>
        ))}
        <label className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
          <span className="uppercase tracking-label">Sort</span>
          <select
            className="bg-transparent text-xs text-foreground outline-none"
            onChange={(event) =>
              onChange({
                sort: event.target.value as LinksFilters['sort'],
                page: 1,
              })
            }
            value={filters.sort}
          >
            <option value="createdAt">Created</option>
            <option value="clickCount">Clicks</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
    </div>
  )
}
