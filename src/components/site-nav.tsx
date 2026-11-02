'use client'

import * as React from 'react'
import { TrendingUp, BookOpen, BarChart3, Wallet, UserCircle } from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { cn } from '@/lib/utils'

const VIEWS: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: 'portfolio', label: 'Portfolio', icon: Wallet },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'research', label: 'Research', icon: BookOpen },
  { key: 'account', label: 'Account', icon: UserCircle },
]

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)

  return (
    <>
      {/* ── Desktop nav (top bar) — hidden on mobile ── */}
      <header className="z-50 hidden w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-tight">
              Trade<span className="text-primary"> Journal</span>
            </span>
          </div>

          {/* View switcher */}
          <nav className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1">
            {VIEWS.map((v) => {
              const active = view === v.key
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile nav (bottom bar) — Android native feel ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {VIEWS.map((v) => {
          const active = view === v.key
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <v.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{v.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
