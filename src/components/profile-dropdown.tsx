'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight, LogOut, Palette, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
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

/** Fallback avatar: first letter of the name on a primary-tinted circle. */
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

  // Read the custom display name from localStorage if set
  const [displayName, setDisplayName] = React.useState(name)
  React.useEffect(() => {
    if (email) {
      const custom = localStorage.getItem(`username-${email}`)
      setDisplayName(custom || name)
    } else {
      setDisplayName(name)
    }
  }, [email, name])

  // Theme list expand/collapse state (inline, not a submenu — works on mobile)
  const [themeExpanded, setThemeExpanded] = React.useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border/50 bg-card/80 py-1 pl-1 pr-3 text-xs font-medium shadow-sm transition-all hover:border-primary/40 hover:bg-accent"
        >
          {/* Avatar */}
          {image ? (
            <img
              src={image}
              alt={displayName}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-border/40"
              referrerPolicy="no-referrer"
            />
          ) : (
            <AvatarFallback name={displayName} size={28} />
          )}
          {/* Name (hidden on very small screens) */}
          <span className="hidden max-w-[100px] truncate text-foreground sm:inline">
            {displayName.split(' ')[0]}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 p-0"
        sideOffset={8}
        collisionPadding={16}
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

        {/* Theme — inline expand/collapse (mobile-friendly, no off-screen submenu) */}
        <div className="py-1">
          <button
            type="button"
            onClick={() => setThemeExpanded((v) => !v)}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Theme</span>
            <ChevronRight
              className={cn(
                'ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform',
                themeExpanded && 'rotate-90'
              )}
            />
          </button>

          {/* Theme list — expands inline below the "Theme" item */}
          {themeExpanded && (
            <div className="border-t border-border/40 bg-muted/20 py-1">
              {PALETTES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setPalette(p.key as PaletteKey)
                    setThemeExpanded(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
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
  )
}
