'use client'

import * as React from 'react'
import { LogOut, Palette, Check, Download, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAppSession, signOut } from '@/lib/use-session'
import { usePaletteStore, PALETTES, type PaletteKey } from '@/lib/palette-store'
import { cn } from '@/lib/utils'

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm ring-1 ring-border/40">
      <span className="flex-1" style={{ background: colors[0] }} />
      <span className="w-2" style={{ background: colors[1] }} />
      <span className="w-1" style={{ background: colors[2] }} />
    </span>
  )
}

function AvatarFallback({ name, size = 32 }: { name: string; size?: number }) {
  const initial = (name || '?')[0]?.toUpperCase()
  return (
    <span
      className="flex items-center justify-center rounded-full bg-primary/20 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  )
}

export function ProfileDropdown() {
  const { data: session } = useAppSession()
  const palette = usePaletteStore((s) => s.palette)
  const setPalette = usePaletteStore((s) => s.setPalette)

  const user = session?.user
  const name = user?.name || 'User'
  const email = user?.email || ''
  const image = user?.image

  const [displayName, setDisplayName] = React.useState(name)
  React.useEffect(() => {
    if (email) {
      const custom = localStorage.getItem(`username-${email}`)
      setDisplayName(custom || name)
    } else {
      setDisplayName(name)
    }
  }, [email, name])

  const [exportExpanded, setExportExpanded] = React.useState(false)
  const [themePopoverOpen, setThemePopoverOpen] = React.useState(false)
  const [mainOpen, setMainOpen] = React.useState(false)

  return (
    <>
      {/* Main profile dropdown */}
      <DropdownMenu open={mainOpen} onOpenChange={setMainOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center rounded-full transition-all hover:opacity-80"
            aria-label="Profile menu"
          >
            {image ? (
              <img
                src={image}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback name={displayName} size={32} />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-60 p-0"
          sideOffset={12}
          collisionPadding={16}
          side="top"
        >
          {/* Profile header */}
          <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
            {image ? (
              <img
                src={image}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-border/40"
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarFallback name={displayName} size={40} />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {email}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-0" />

          {/* Theme — opens a separate popover (above bottom bar on mobile) */}
          <button
            type="button"
            onClick={() => {
              setMainOpen(false)
              setTimeout(() => setThemePopoverOpen(true), 50)
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Theme</span>
          </button>

          <DropdownMenuSeparator className="my-0" />

          {/* Data Export — inline expand */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setExportExpanded((v) => !v)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data Export</span>
            </button>

            {exportExpanded && (
              <div className="border-t border-border/40 bg-muted/20 py-1">
                <button
                  onClick={() => { window.open('/api/export/csv', '_blank'); setExportExpanded(false) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">Export CSV</span>
                </button>
                <button
                  onClick={() => { window.open('/api/export/pdf', '_blank'); setExportExpanded(false) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">Export PDF Report</span>
                </button>
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="my-0" />

          {/* Log out */}
          <div className="px-2 py-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme popover — separate from dropdown, opens upward on mobile */}
      <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
        <PopoverTrigger asChild>
          <button className="hidden" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="top"
          sideOffset={80}
          collisionPadding={16}
          className="w-64 p-2 z-[200]"
        >
          <div className="mb-2 flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Palette className="h-3.5 w-3.5" />
            Color Theme
          </div>
          {PALETTES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setPalette(p.key as PaletteKey)
                setThemePopoverOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                palette === p.key
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Swatch colors={p.swatch} />
                <span className="font-medium">{p.label}</span>
                <span className="text-[10px] text-muted-foreground/70">
                  {p.mode}
                </span>
              </span>
              {palette === p.key && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </>
  )
}
