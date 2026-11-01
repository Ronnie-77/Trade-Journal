'use client'

import * as React from 'react'
import {
  ImagePlus,
  Link2,
  X,
  Loader2,
  UploadCloud,
  ExternalLink,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImageKind } from '@/lib/trade-types'

interface Props {
  imageUrl: string
  imageKind: ImageKind
  onChange: (url: string, kind: ImageKind) => void
}

export function ScreenshotInput({ imageUrl, imageKind, onChange }: Props) {
  const [tab, setTab] = React.useState<'link' | 'upload'>(
    imageKind === 'upload' ? 'upload' : 'link'
  )
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // If there's an existing value, show the right tab
  React.useEffect(() => {
    if (imageKind === 'upload' && imageUrl) setTab('upload')
    else if (imageKind === 'link' && imageUrl) setTab('link')
  }, [imageKind, imageUrl])

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5 MB).')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Upload failed')
      }
      const data = await res.json()
      onChange(data.url, 'upload')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const remove = () => {
    onChange('', '')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'link' | 'upload')}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="link" className="gap-1.5 text-xs">
            <Link2 className="h-3 w-3" />
            Link
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <ImagePlus className="h-3 w-3" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* LINK TAB */}
        <TabsContent value="link" className="mt-3">
          {imageUrl && imageKind === 'link' ? (
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 p-2">
              <img
                src={imageUrl}
                alt="screenshot preview"
                className="h-12 w-12 flex-shrink-0 rounded object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">
                  {imageUrl}
                </div>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  opens in new tab
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-rose-500"
                onClick={remove}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Input
              type="url"
              placeholder="https://example.com/chart-screenshot.png"
              value={imageKind === 'link' ? imageUrl : ''}
              onChange={(e) => onChange(e.target.value, 'link')}
            />
          )}
        </TabsContent>

        {/* UPLOAD TAB */}
        <TabsContent value="upload" className="mt-3">
          {imageUrl && imageKind === 'upload' ? (
            <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background/40 p-2">
              <img
                src={imageUrl}
                alt="uploaded screenshot"
                className="h-16 w-16 flex-shrink-0 rounded object-cover ring-1 ring-border"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-emerald-500">
                  Uploaded successfully
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {imageUrl}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10"
                  onClick={remove}
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-xs font-medium text-foreground">
                    Click to upload or drag &amp; drop
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    PNG, JPG, WEBP, GIF · max 5 MB
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <p className="mt-2 text-xs text-rose-500">{error}</p>
      )}
    </div>
  )
}
