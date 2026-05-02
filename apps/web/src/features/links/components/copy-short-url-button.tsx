import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../../shared/components/ui/button'

type CopyShortUrlButtonProps = {
  shortUrl: string
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.append(textArea)
  textArea.select()
  document.execCommand('copy')
  textArea.remove()
}

export function CopyShortUrlButton({ shortUrl }: CopyShortUrlButtonProps) {
  async function handleCopy() {
    try {
      await copyToClipboard(shortUrl)
      toast.success('Short URL copied')
    } catch {
      toast.error('Could not copy short URL')
    }
  }

  return (
    <Button
      aria-label="Copy short URL"
      className="border border-transparent hover:border-border"
      onClick={handleCopy}
      size="sm"
      variant="ghost"
    >
      <Copy aria-hidden="true" className="size-4" />
    </Button>
  )
}
