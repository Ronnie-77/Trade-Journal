'use client'

import * as React from 'react'
import { LayoutDashboard, BarChart3 } from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'

const VIEWS: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: 'portfolio', label: 'Dashboard', icon: LayoutDashboard },
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
          {/* Brand left — clickable, navigates to landing page */}
          <a
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Logo size={26} className="text-foreground" />
            <span className="font-mono text-[15px] font-semibold">
              Trade<span className="text-primary"> Journal</span>
            </span>
          </a>

          {/* Center: Dashboard | Analytics */}
          <nav className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-1">
            {/* Dashboard */}
            <button
              onClick={() => setView('portfolio')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                view === 'portfolio'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
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

      {/* ── Mobile bottom nav: Dashboard | Analytics | Account ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Dashboard */}
        <button
          onClick={() => setView('portfolio')}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
            view === 'portfolio' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
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
