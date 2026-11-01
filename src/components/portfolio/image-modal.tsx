'use client'

import * as React from 'react'
import { X, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  src: string
  alt?: string
  title?: string
}

export function ImageModal({ open, onOpenChange, src, alt = 'Screenshot', title }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-3xl border-border/60 p-0 sm:p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <div>
            <DialogTitle className="text-sm font-semibold">
              {title || 'Trade screenshot'}
            </DialogTitle>
            <DialogDescription className="text-[11px]">
              {src}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="h-7 w-7">
              <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto bg-black/5 p-2">
          <img
            src={src}
            alt={alt}
            className="mx-auto block max-h-[65vh] w-auto rounded-md object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
