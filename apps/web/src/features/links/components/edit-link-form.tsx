import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { useDeleteLink } from '../hooks/use-link-actions'
import { useUpdateLink } from '../hooks/use-update-link'
import {
  editLinkSchema,
  toDateTimeLocalValue,
  toUpdateLinkPayload,
  type EditLinkFormValues,
} from '../schemas/link-schemas'
import type { LinkDetails } from '../types'

const inputClasses =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

const textAreaClasses =
  'min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

function getUpdateErrorMessage(error: ApiError) {
  if (error.code === 'VALIDATION_ERROR') {
    return 'Review the link fields and try again.'
  }

  if (error.code === 'NOT_FOUND') {
    return 'This link no longer exists.'
  }

  if (error.code === 'FORBIDDEN') {
    return 'You do not have access to update this link.'
  }

  return error.message || 'Link could not be updated. Try again.'
}

type EditLinkFormProps = {
  link: LinkDetails
}

export function EditLinkForm({ link }: EditLinkFormProps) {
  const updateLink = useUpdateLink(link.id)
  const deleteLink = useDeleteLink()
  const navigate = useNavigate()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<EditLinkFormValues>({
    resolver: zodResolver(editLinkSchema),
    defaultValues: {
      title: link.title ?? '',
      description: link.description ?? '',
      expiresAt: toDateTimeLocalValue(link.expiresAt),
      maxClicks: link.maxClicks ? String(link.maxClicks) : '',
      active: link.active,
    },
  })

  async function onSubmit(values: EditLinkFormValues) {
    try {
      const updatedLink = await updateLink.mutateAsync({
        linkId: link.id,
        payload: toUpdateLinkPayload(values),
      })
      navigate(`/links/${updatedLink.id}`)
    } catch (error) {
      const apiError = error as ApiError
      setError('root', { message: getUpdateErrorMessage(apiError) })
    }
  }

  return (
    <>
    <form
      className="rounded-lg border border-border bg-card"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="border-b border-border bg-surface px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
          Link configuration
        </h2>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="title"
            >
              Title
            </label>
            <input
              className={cn(inputClasses, errors.title && 'border-error')}
              id="title"
              maxLength={120}
              type="text"
              {...register('title')}
            />
            {errors.title ? (
              <p className="text-sm text-error">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className={cn(
                textAreaClasses,
                errors.description && 'border-error',
              )}
              id="description"
              maxLength={500}
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-sm text-error">{errors.description.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="expiresAt"
            >
              Expiration
            </label>
            <input
              className={cn(inputClasses, errors.expiresAt && 'border-error')}
              id="expiresAt"
              type="datetime-local"
              {...register('expiresAt')}
            />
            {errors.expiresAt ? (
              <p className="text-sm text-error">{errors.expiresAt.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-label text-muted-foreground"
              htmlFor="maxClicks"
            >
              Max clicks
            </label>
            <input
              className={cn(inputClasses, errors.maxClicks && 'border-error')}
              id="maxClicks"
              min={1}
              placeholder="ex: 500"
              type="number"
              {...register('maxClicks')}
            />
            {errors.maxClicks ? (
              <p className="text-sm text-error">{errors.maxClicks.message}</p>
            ) : null}
          </div>

          <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-3">
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                Active link
              </span>
              <span className="text-xs leading-5 text-muted-foreground">
                Inactive links will not redirect.
              </span>
            </span>
            <span className="relative inline-flex h-5 w-10 items-center rounded-full border border-border bg-card">
              <input
                className="peer sr-only"
                type="checkbox"
                {...register('active')}
              />
              <span className="absolute left-0.5 h-4 w-4 rounded-full bg-muted-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-foreground" />
            </span>
          </label>
          {errors.active ? (
            <p className="text-sm text-error">{errors.active.message}</p>
          ) : null}
        </div>
      </div>

      {errors.root ? (
        <div className="mx-5 mt-5 rounded-md border border-border bg-background p-3 text-sm text-error">
          {errors.root.message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-medium uppercase tracking-label text-foreground transition-colors hover:bg-muted"
            to={`/links/${link.id}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to details
          </Link>
          <Button
            onClick={() => setIsDeleteOpen(true)}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete link
          </Button>
        </div>
        <Button disabled={updateLink.isPending} type="submit" variant="primary">
          {updateLink.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>

    {isDeleteOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-none">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">Delete link?</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              This removes this link from normal lists. Analytics history stays backend-owned.
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              disabled={deleteLink.isPending}
              onClick={() => setIsDeleteOpen(false)}
              size="sm"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={deleteLink.isPending}
              onClick={async () => {
                await deleteLink.mutateAsync(link.id)
                setIsDeleteOpen(false)
                navigate('/links', { replace: true })
              }}
              size="sm"
              variant="primary"
            >
              {deleteLink.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  )
}
