import { Button } from '../../../shared/components/ui/button'
import type { LinksPagination as LinksPaginationData } from '../types'

type LinksPaginationProps = {
  pagination: LinksPaginationData
  onPageChange: (page: number) => void
}

export function LinksPagination({
  pagination,
  onPageChange,
}: LinksPaginationProps) {
  const startItem =
    pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  )

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {pagination.totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          size="sm"
          variant="secondary"
        >
          Previous
        </Button>
        <span className="font-mono text-xs uppercase tracking-label text-muted-foreground">
          Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
        </span>
        <Button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          size="sm"
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
