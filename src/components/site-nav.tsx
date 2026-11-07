'use client'

import * as React from 'react'
import { Home, BarChart3 } from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'

const VIEWS: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: 'portfolio', label: 'Home', icon: Home },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)

  return (
    <>
      {/* ── Desktop nav ── */}
      <header className="z-50 hidden w-full border-b border-border/40 bg-background/80 backdrop-blur sm:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand left */}
          <div className="flex items-center gap-2.5">
            <Logo size={26} className="text-foreground" />
            <span className="font-mono text-sm font-semibold">
              Trade<span className="text-primary"> Journal</span>
            </span>
          </div>

          {/* Center: Home | Analytics */}
          <nav className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1">
            {/* Home */}
            <button
              onClick={() => setView('portfolio')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                view === 'portfolio'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              <Home className="h-3.5 w-3.5" />
              Home
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

          {/* Right: Profile dropdown (avatar + name + chevron) */}
          <ProfileDropdown />
        </div>
      </header>

      {/* ── Mobile bottom nav: Home | Analytics | Account ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Home */}
        <button
          onClick={() => setView('portfolio')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            view === 'portfolio' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
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

        {/* Profile (mobile) — opens dropdown */}
        <div className="flex flex-1 flex-col items-center gap-1 py-2.5">
          <ProfileDropdown />
          <span className="text-[10px] font-medium text-muted-foreground">Account</span>
        </div>
      </nav>
    </>
  )
}
