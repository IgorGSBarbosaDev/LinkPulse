import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import type { ApiError } from '../../../shared/api/api-error'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/utils'
import { useCreateLink } from '../hooks/use-create-link'
import {
  createLinkSchema,
  toCreateLinkPayload,
  type CreateLinkFormValues,
} from '../schemas/link-schemas'

const inputClasses =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

const textAreaClasses =
  'min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring'

function getCreateErrorMessage(error: ApiError) {
  if (error.code === 'LINK_LIMIT_REACHED') {
    return 'You have reached the maximum limit of 15 links.'
  }

  if (error.code === 'CONFLICT') {
    return 'This alias is already in use. Choose another alias.'
  }

  if (error.code === 'VALIDATION_ERROR') {
    return 'Review the link fields and try again.'
  }

  return error.message || 'Link could not be created. Try again.'
}

export function CreateLinkForm() {
  const createLink = useCreateLink()
  const navigate = useNavigate()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: '',
      customAlias: '',
      title: '',
      description: '',
      expiresAt: '',
      maxClicks: '',
    },
  })

  async function onSubmit(values: CreateLinkFormValues) {
    try {
      const link = await createLink.mutateAsync(toCreateLinkPayload(values))
      navigate(`/links/${link.id}`)
    } catch (error) {
      const apiError = error as ApiError
      const message = getCreateErrorMessage(apiError)

      if (apiError.code === 'CONFLICT') {
        setError('customAlias', { message })
      }

      setError('root', { message })
    }
  }

  return (
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
              htmlFor="originalUrl"
            >
              Original URL
            </label>
            <input
              className={cn(inputClasses, errors.originalUrl && 'border-error')}
              id="originalUrl"
              type="url"
              {...register('originalUrl')}
            />
            {errors.originalUrl ? (
              <p className="text-sm text-error">{errors.originalUrl.message}</p>
            ) : null}
          </div>

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
              htmlFor="customAlias"
            >
              Custom alias
            </label>
            <input
              className={cn(inputClasses, errors.customAlias && 'border-error')}
              id="customAlias"
              maxLength={50}
              type="text"
              {...register('customAlias')}
            />
            {errors.customAlias ? (
              <p className="text-sm text-error">{errors.customAlias.message}</p>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                Letters, numbers, hyphens, and underscores.
              </p>
            )}
          </div>

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
        </div>
      </div>

      {errors.root ? (
        <div className="mx-5 mt-5 rounded-md border border-border bg-background p-3 text-sm text-error">
          {errors.root.message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-medium uppercase tracking-label text-foreground transition-colors hover:bg-muted"
          to="/links"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to links
        </Link>
        <Button disabled={createLink.isPending} type="submit" variant="primary">
          {createLink.isPending ? 'Creating...' : 'Create link'}
        </Button>
      </div>
    </form>
  )
}
