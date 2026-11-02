'use client'

import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/** Full footer with Risk Disclaimer — shown on Research view */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
              <span className="font-mono text-[10px] font-bold text-primary">Au</span>
            </div>
            <span>© {new Date().getFullYear()} Trade Journal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/** Minimal footer for non-Research views (no disclaimer, just copyright) */
export function MinimalFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Trade Journal
      </div>
    </footer>
  )
}
