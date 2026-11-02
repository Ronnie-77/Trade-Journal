'use client'

import * as React from 'react'
import { TrendingUp, Wallet, BarChart3, UserCircle, Plus, X } from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { useFormStore } from '@/lib/form-store'
import { cn } from '@/lib/utils'

const VIEWS: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: 'portfolio', label: 'Portfolio', icon: Wallet },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'account', label: 'Account', icon: UserCircle },
]

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const formOpen = useFormStore((s) => s.formOpen)
  const toggleForm = useFormStore((s) => s.toggleForm)

  return (
    <>
      {/* ── Desktop nav ── */}
      <header className="z-50 hidden w-full border-b border-border/40 bg-background/80 backdrop-blur sm:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand left */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold">
              Trade<span className="text-primary"> Journal</span>
            </span>
          </div>

          {/* Center: Portfolio | New Entry | Analytics */}
          <nav className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1">
            {/* Portfolio */}
            <button
              onClick={() => setView('portfolio')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                view === 'portfolio'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              <Wallet className="h-3.5 w-3.5" />
              Portfolio
            </button>

            {/* New Entry */}
            <button
              onClick={toggleForm}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                formOpen
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              {formOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {formOpen ? 'Close' : 'New Entry'}
            </button>

            {/* Analytics */}
            <button
              onClick={() => setView('analytics')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                view === 'analytics'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </button>
          </nav>

          {/* Account right corner */}
          <button
            onClick={() => setView('account')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
              view === 'account'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <UserCircle className="h-3.5 w-3.5" />
            Account
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav: Portfolio | New Entry | Analytics | Account ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Portfolio */}
        <button
          onClick={() => setView('portfolio')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            view === 'portfolio' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Wallet className="h-5 w-5" />
          <span className="text-[10px] font-medium">Portfolio</span>
        </button>

        {/* New Entry */}
        <button
          onClick={toggleForm}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            formOpen ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {formOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          <span className="text-[10px] font-medium">{formOpen ? 'Close' : 'New Entry'}</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => setView('analytics')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            view === 'analytics' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Analytics</span>
        </button>

        {/* Account */}
        <button
          onClick={() => setView('account')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            view === 'account' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <UserCircle className="h-5 w-5" />
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </nav>
    </>
  )
}
