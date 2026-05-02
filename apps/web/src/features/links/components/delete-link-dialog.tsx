import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import type { LinkListItem } from '../types'

type DeleteLinkDialogProps = {
  link: LinkListItem
  isDeleting: boolean
  onConfirm: (linkId: string) => void
}

export function DeleteLinkDialog({
  link,
  isDeleting,
  onConfirm,
}: DeleteLinkDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const displayName = link.title || link.shortCode

  if (!isOpen) {
    return (
      <Button
        aria-label={`Delete ${displayName}`}
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="ghost"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-none">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">Delete link?</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This removes `{displayName}` from normal lists. Analytics history stays
            backend-owned.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={isDeleting}
            onClick={() => {
              onConfirm(link.id)
              setIsOpen(false)
            }}
            size="sm"
            variant="primary"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
