'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { TrendingUp, BookOpen, BarChart3, Wallet, Palette, Check, Sun, Moon } from 'lucide-react'
import { useViewStore, type ViewKey } from '@/lib/view-store'
import { usePaletteStore, PALETTES, getPalette, type PaletteKey } from '@/lib/palette-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const VIEWS: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
  { key: 'portfolio', label: 'Portfolio', icon: Wallet },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'research', label: 'Research', icon: BookOpen },
]

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm ring-1 ring-border/60">
      <span className="flex-1" style={{ background: colors[0] }} />
      <span className="w-1.5" style={{ background: colors[1] }} />
      <span className="w-1" style={{ background: colors[2] }} />
    </span>
  )
}

export function SiteNav() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const palette = usePaletteStore((s) => s.palette)
  const setPalette = usePaletteStore((s) => s.setPalette)
  const { setTheme } = useTheme()

  const current = getPalette(palette)
  const darkPalettes = PALETTES.filter((p) => p.mode === 'dark')
  const lightPalettes = PALETTES.filter((p) => p.mode === 'light')

  const selectPalette = (key: PaletteKey) => {
    const opt = getPalette(key)
    setPalette(key)
    setTheme(opt.mode)
  }

  return (
    <>
      {/* ── Desktop nav (top bar) — hidden on mobile ── */}
      <header className="sticky top-0 z-50 hidden w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:block">
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

          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 border border-border/60 px-2" aria-label="Color theme">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <Swatch colors={current.swatch} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Dark themes</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {darkPalettes.map((p) => (
                    <DropdownMenuItem key={p.key} onSelect={() => selectPalette(p.key)} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2"><Swatch colors={p.swatch} /><span className="text-sm">{p.label}</span></span>
                      {palette === p.key && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Light themes</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {lightPalettes.map((p) => (
                    <DropdownMenuItem key={p.key} onSelect={() => selectPalette(p.key)} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2"><Swatch colors={p.swatch} /><span className="text-sm">{p.label}</span></span>
                      {palette === p.key && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="border border-border/60" aria-label="Toggle light/dark"
              onClick={() => {
                const isLight = current.mode === 'light'
                const target = isLight ? 'fintech-orange' : 'coral-light'
                selectPalette(target as PaletteKey)
              }}>
              {current.mode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav (bottom bar) — hidden on desktop, Android native feel ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
        {/* Theme + palette quick toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted-foreground" aria-label="Color theme">
              <Palette className="h-5 w-5" />
              <span className="text-[10px] font-medium">Theme</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mb-2 w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Dark themes</DropdownMenuLabel>
            <DropdownMenuGroup>
              {darkPalettes.map((p) => (
                <DropdownMenuItem key={p.key} onSelect={() => selectPalette(p.key)} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Swatch colors={p.swatch} /><span className="text-sm">{p.label}</span></span>
                  {palette === p.key && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Light themes</DropdownMenuLabel>
            <DropdownMenuGroup>
              {lightPalettes.map((p) => (
                <DropdownMenuItem key={p.key} onSelect={() => selectPalette(p.key)} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Swatch colors={p.swatch} /><span className="text-sm">{p.label}</span></span>
                  {palette === p.key && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  )
}
