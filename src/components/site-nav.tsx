'use client'

import * as React from 'react'
import {
  LayoutDashboard, BarChart3, CalendarDays, Download, Settings,
  LogOut, ChevronLeft, Home,
} from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { signOut } from '@/lib/use-session'
import { cn } from '@/lib/utils'

// Sidebar items — desktop left rail + mobile floating nav
const NAV_ITEMS: Array<{
  key: ViewKey | 'export' | 'settings'
  label: string
  icon: React.ComponentType<{ className?: string }>
  isView: boolean
}> = [
  { key: 'portfolio', label: 'Dashboard', icon: LayoutDashboard, isView: true },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, isView: true },
  { key: 'account', label: 'Calendar', icon: CalendarDays, isView: true },
]

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)

  const activeKey = view === 'portfolio' ? 'portfolio' : view === 'analytics' ? 'analytics' : 'account'

  return (
    <>
      {/* ── Desktop: Left icon sidebar ── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[68px] flex-col items-center border-r border-border/40 bg-background/80 backdrop-blur sm:flex">
        {/* Logo at top */}
        <a
          href="/"
          className="mt-3 flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <Logo size={26} className="text-foreground" />
        </a>

        {/* Divider */}
        <div className="my-4 h-px w-8 bg-border/40" />

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.isView && activeKey === item.key
            return (
              <button
                key={item.key}
                onClick={() => item.isView && setView(item.key as ViewKey)}
                className={cn(
                  'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
                title={item.label}
              >
                {/* Active indicator — left edge bar */}
                {isActive && (
                  <span className="absolute -left-[14px] top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <item.icon className="h-5 w-5" />
                {/* Tooltip on hover */}
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* Export button */}
          <button
            onClick={() => window.open('/api/export/csv', '_blank')}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
            title="Export"
          >
            <Download className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
              Export CSV
            </span>
          </button>
        </nav>

        {/* Bottom: Settings + Profile */}
        <div className="mb-3 flex flex-col items-center gap-2">
          <button
            onClick={() => setView('account')}
            className={cn(
              'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all',
              activeKey === 'account'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
              Settings
            </span>
          </button>

          {/* Profile dropdown */}
          <ProfileDropdown />

          {/* Home/landing link */}
          <a
            href="/"
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
            title="Home"
          >
            <Home className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
              Home
            </span>
          </a>
        </div>
      </aside>

      {/* ── Mobile: Floating pill bottom nav ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:hidden">
        <nav className="flex items-center justify-around gap-1 rounded-full border border-border/60 bg-background/95 px-2 py-2 shadow-2xl backdrop-blur-lg"
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.isView && activeKey === item.key
            return (
              <button
                key={item.key}
                onClick={() => item.isView && setView(item.key as ViewKey)}
                className={cn(
                  'relative flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-label={item.label}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive && 'scale-110'
                  )}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {/* Dot indicator under active icon */}
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}

          {/* Export icon */}
          <button
            onClick={() => window.open('/api/export/csv', '_blank')}
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full text-muted-foreground transition-all"
            aria-label="Export"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Profile icon */}
          <div className="flex h-11 w-11 items-center justify-center">
            <ProfileDropdown />
          </div>
        </nav>
      </div>
    </>
  )
}
