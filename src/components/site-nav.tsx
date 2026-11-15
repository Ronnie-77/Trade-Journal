'use client'

import * as React from 'react'
import {
  LayoutDashboard, BarChart3, Plus, Home,
} from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { useFormStore } from '@/lib/form-store'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'

// Sidebar nav items — mapped to views
const NAV_ITEMS: Array<{
  key: ViewKey
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'portfolio', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'account', label: 'Account', icon: Plus }, // placeholder, replaced below
]

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const toggleForm = useFormStore((s) => s.toggleForm)
  const formOpen = useFormStore((s) => s.formOpen)

  return (
    <>
      {/* ── Desktop: Left icon sidebar ── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[68px] flex-col items-center border-r border-border/40 bg-background/80 backdrop-blur sm:flex">
        {/* Logo */}
        <a href="/" className="mt-3 flex items-center justify-center transition-opacity hover:opacity-80">
          <Logo size={26} className="text-foreground" />
        </a>

        <div className="my-4 h-px w-8 bg-border/40" />

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {/* Dashboard */}
          <NavIcon
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={view === 'portfolio'}
            onClick={() => setView('portfolio')}
          />

          {/* Analytics */}
          <NavIcon
            icon={BarChart3}
            label="Analytics"
            isActive={view === 'analytics'}
            onClick={() => setView('analytics')}
          />

          {/* New Entry — floating action button style */}
          <button
            onClick={toggleForm}
            className={cn(
              'group relative mt-2 flex h-12 w-12 items-center justify-center rounded-2xl transition-all',
              formOpen
                ? 'bg-rose-500/15 text-rose-500'
                : 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl'
            )}
            title={formOpen ? 'Close form' : 'New Entry'}
          >
            <Plus className={cn('h-6 w-6 transition-transform', formOpen && 'rotate-45')} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
              {formOpen ? 'Close form' : 'New Entry'}
            </span>
          </button>
        </nav>

        {/* Bottom: Profile + Home */}
        <div className="mb-3 flex flex-col items-center gap-2">
          <ProfileDropdown />
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
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:hidden">
        <nav
          className="flex items-center justify-around gap-1 rounded-full border border-border/60 bg-background/95 px-3 py-2.5 shadow-2xl backdrop-blur-lg"
          style={{ maxWidth: 'calc(100vw - 1.5rem)' }}
        >
          {/* Dashboard */}
          <MobileNavIcon
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={view === 'portfolio'}
            onClick={() => setView('portfolio')}
          />

          {/* New Entry */}
          <button
            onClick={toggleForm}
            className={cn(
              'flex h-12 w-12 flex-col items-center justify-center rounded-full transition-all',
              formOpen
                ? 'bg-rose-500/15 text-rose-500'
                : 'bg-primary text-primary-foreground shadow-lg'
            )}
            aria-label={formOpen ? 'Close form' : 'New Entry'}
          >
            <Plus className={cn('h-6 w-6 transition-transform', formOpen && 'rotate-45')} />
          </button>

          {/* Analytics */}
          <MobileNavIcon
            icon={BarChart3}
            label="Analytics"
            isActive={view === 'analytics'}
            onClick={() => setView('analytics')}
          />

          {/* Profile */}
          <div className="flex h-11 w-11 items-center justify-center">
            <ProfileDropdown />
          </div>
        </nav>
      </div>
    </>
  )
}

/* ── Desktop nav icon ── */
function NavIcon({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      )}
      title={label}
    >
      {isActive && (
        <span className="absolute -left-[14px] top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon className="h-5 w-5" />
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
        {label}
      </span>
    </button>
  )
}

/* ── Mobile nav icon ── */
function MobileNavIcon({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
      aria-label={label}
    >
      <Icon
        className={cn('h-5 w-5 transition-all', isActive && 'scale-110')}
        fill={isActive ? 'currentColor' : 'none'}
      />
      {isActive && (
        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
      )}
    </button>
  )
}
