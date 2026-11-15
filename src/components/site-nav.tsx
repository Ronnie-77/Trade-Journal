'use client'

import * as React from 'react'
import {
  LayoutDashboard, BarChart3, Plus,
} from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { useFormStore } from '@/lib/form-store'
import { useAppSession } from '@/lib/use-session'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'

// Placeholder component for avatar icon
function ProfileAvatar({ className }: { className?: string }) {
  const { data: session } = useAppSession()
  const image = session?.user?.image
  const name = session?.user?.name || '?'
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn('rounded-full object-cover', className)}
        style={{ width: '1.25rem', height: '1.25rem' }}
        referrerPolicy="no-referrer"
      />
    )
  }
  const initial = name[0]?.toUpperCase()
  return (
    <span
      className={cn('flex items-center justify-center rounded-full bg-primary/20 font-semibold text-primary', className)}
      style={{ width: '1.25rem', height: '1.25rem', fontSize: '0.625rem' }}
    >
      {initial}
    </span>
  )
}

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const toggleForm = useFormStore((s) => s.toggleForm)
  const formOpen = useFormStore((s) => s.formOpen)

  return (
    <>
      {/* ── Desktop: Left icon-only sidebar (like Notion/reference image) ── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[60px] flex-col items-center border-r border-border/40 bg-background/80 backdrop-blur sm:flex">
        {/* Logo at top */}
        <a href="/" className="mt-3 flex items-center justify-center transition-opacity hover:opacity-80">
          <Logo size={24} className="text-foreground" />
        </a>

        <div className="my-4 h-px w-7 bg-border/40" />

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
        </nav>

        {/* Bottom: Profile avatar only (no name, no home tab) */}
        <div className="mb-3 flex flex-col items-center gap-2">
          <ProfileDropdown />
        </div>
      </aside>

      {/* ── Mobile: Floating pill bottom nav (icon + label style) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 sm:hidden"
        style={{ pointerEvents: 'none' }}
      >
        <nav
          className="flex items-center justify-around rounded-full border border-border/40 bg-background px-4 py-2.5 shadow-2xl"
          style={{
            maxWidth: '340px',
            width: 'calc(100vw - 2rem)',
            pointerEvents: 'auto',
          }}
        >
          {/* Dashboard */}
          <MobileNavTab
            icon={LayoutDashboard}
            label="Home"
            isActive={view === 'portfolio'}
            onClick={() => setView('portfolio')}
          />

          {/* New Entry */}
          <MobileNavTab
            icon={Plus}
            label="Entry"
            isActive={formOpen}
            onClick={toggleForm}
          />

          {/* Analytics */}
          <MobileNavTab
            icon={BarChart3}
            label="Stats"
            isActive={view === 'analytics'}
            onClick={() => setView('analytics')}
          />

          {/* Profile */}
          <MobileNavTab
            icon={ProfileAvatar}
            label="Profile"
            isActive={false}
            onClick={() => {}}
            isAvatar
          />
        </nav>
      </div>
    </>
  )
}

/* ── Desktop nav icon (icon-only, no text) ── */
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
        'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      )}
      title={label}
    >
      {isActive && (
        <span className="absolute -left-[12px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon className="h-5 w-5" />
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
        {label}
      </span>
    </button>
  )
}

/* ── Mobile nav tab (icon + label, like reference) ── */
function MobileNavTab({
  icon: Icon,
  label,
  isActive,
  onClick,
  isAvatar,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
  isAvatar?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5"
      aria-label={label}
    >
      {isAvatar ? (
        <Icon className="h-5 w-5" />
      ) : (
        <Icon
          className={cn(
            'h-5 w-5 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
          fill={isActive ? 'currentColor' : 'none'}
          strokeWidth={isActive ? 2 : 1.5}
        />
      )}
      <span
        className={cn(
          'text-[10px] font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </button>
  )
}
