'use client'

import * as React from 'react'
import {
  LayoutDashboard, BarChart3, Plus, Trophy, CalendarRange,
} from 'lucide-react'
import { useViewStore } from '@/lib/view-store'
import { useFormStore } from '@/lib/form-store'
import { Logo } from '@/components/logo'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const toggleForm = useFormStore((s) => s.toggleForm)
  const formOpen = useFormStore((s) => s.formOpen)

  return (
    <>
      {/* ── Desktop: Left icon sidebar ── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[60px] flex-col items-center border-r border-border/40 bg-background/80 backdrop-blur sm:flex">
        <a href="/" className="mt-3 flex items-center justify-center transition-opacity hover:opacity-80">
          <Logo size={24} className="text-foreground" />
        </a>
        <div className="my-4 h-px w-7 bg-border/40" />
        <nav className="flex flex-1 flex-col items-center gap-2">
          <NavIcon icon={LayoutDashboard} label="Home" isActive={view === 'portfolio' && !formOpen} onClick={() => { setView('portfolio'); if (formOpen) toggleForm() }} />
          <NavIcon icon={BarChart3} label="Analytics" isActive={view === 'analytics' && !formOpen} onClick={() => { setView('analytics'); if (formOpen) toggleForm() }} />
          <NavIcon icon={CalendarRange} label="Weekly" isActive={view === 'weekly' && !formOpen} onClick={() => { setView('weekly'); if (formOpen) toggleForm() }} />
          <NavIcon icon={Trophy} label="Achievements" isActive={view === 'achievements' && !formOpen} onClick={() => { setView('achievements'); if (formOpen) toggleForm() }} />
        </nav>
        <div className="mb-3 flex flex-col items-center gap-2">
          <ProfileDropdown />
        </div>
      </aside>

      {/* ── Mobile: Floating pill bottom nav ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center px-3 pb-3 sm:hidden"
        style={{ pointerEvents: 'none' }}
      >
        <nav
          className="flex items-center justify-around rounded-full border border-border/40 bg-background px-3 py-2.5 shadow-2xl"
          style={{ maxWidth: '360px', width: 'calc(100vw - 1.5rem)', pointerEvents: 'auto' }}
        >
          <MobileNavTab icon={LayoutDashboard} label="Home" isActive={view === 'portfolio' && !formOpen} onClick={() => { setView('portfolio'); if (formOpen) toggleForm() }} />
          <MobileNavTab icon={BarChart3} label="Stats" isActive={view === 'analytics' && !formOpen} onClick={() => { setView('analytics'); if (formOpen) toggleForm() }} />
          <MobileNavTab icon={Plus} label="Entry" isActive={formOpen} onClick={() => { if (view !== 'portfolio') setView('portfolio'); toggleForm() }} />
          <MobileNavTab icon={CalendarRange} label="Weekly" isActive={view === 'weekly' && !formOpen} onClick={() => { setView('weekly'); if (formOpen) toggleForm() }} />
          <div className="flex flex-1 items-center justify-center">
            <ProfileDropdown />
          </div>
        </nav>
      </div>
    </>
  )
}

function NavIcon({ icon: Icon, label, isActive, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all', isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground')} title={label}>
      {isActive && <span className="absolute -left-[12px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
      <Icon className="h-5 w-5" />
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">{label}</span>
    </button>
  )
}

function MobileNavTab({ icon: Icon, label, isActive, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-0.5" aria-label={label}>
      <Icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')} fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2 : 1.5} />
      <span className={cn('text-[9px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>{label}</span>
    </button>
  )
}
