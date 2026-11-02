'use client'

import * as React from 'react'
import { useAppSession, signOut } from '@/lib/use-session'
import { User, Palette, LogOut, Check, ChevronDown, Save, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaletteStore, PALETTES, getPalette, type PaletteKey } from '@/lib/palette-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex h-5 w-8 overflow-hidden rounded-sm ring-1 ring-border/60">
      <span className="flex-1" style={{ background: colors[0] }} />
      <span className="w-2" style={{ background: colors[1] }} />
      <span className="w-1" style={{ background: colors[2] }} />
    </span>
  )
}

export function AccountSection() {
  const { data: session } = useAppSession()
  const { toast } = useToast()
  const palette = usePaletteStore((s) => s.palette)
  const setPalette = usePaletteStore((s) => s.setPalette)
  const current = getPalette(palette)

  const [name, setName] = React.useState(session?.user?.name || '')
  const [savedName, setSavedName] = React.useState(session?.user?.name || '')
  const [themeOpen, setThemeOpen] = React.useState(false)
  const [showResearch, setShowResearch] = React.useState(false)

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
      setSavedName(session.user.name)
    }
  }, [session?.user?.name])

  const handleSaveName = () => {
    // Store custom name in localStorage keyed by email
    if (session?.user?.email) {
      localStorage.setItem(`username-${session.user.email}`, name)
    }
    setSavedName(name)
    toast({ title: 'Name updated', description: name })
  }

  const nameChanged = name !== savedName

  const userInitial = (name || session?.user?.name || '?')[0]?.toUpperCase()

  // Research overlay
  if (showResearch) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <button
          onClick={() => setShowResearch(false)}
          className="btn ghost mb-6"
          style={{ padding: '6px 14px' }}
        >
          <ArrowLeft className="mr-1" style={{ width: 14, height: 14 }} />
          Back to Account
        </button>
        <div className="rounded-xl border border-border/60 bg-card p-4 text-center text-sm text-muted-foreground">
          Research content loads here. Visit the research page directly to view charts and analysis.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold tracking-tight">Account</h1>

      {/* User profile card */}
      <Card className="mb-6 border-border/60">
        <CardContent className="flex items-center gap-4 px-5 py-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary ring-2 ring-primary/30">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-semibold">
              {savedName || 'User'}
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {session?.user?.email}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research access */}
      <Card className="mb-6 border-border/60">
        <CardContent className="px-5 py-4">
          <button
            onClick={() => setShowResearch(true)}
            className="flex w-full items-center justify-between text-sm"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">XAUUSD Research &amp; Strategy</span>
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Name change */}
      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Display name
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1"
            />
            <Button onClick={handleSaveName} disabled={!nameChanged} size="default">
              {nameChanged ? (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Saved
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme selector — dropdown */}
      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            Color theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <button
              onClick={() => setThemeOpen(v => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background px-4 py-3 text-sm transition-all hover:border-primary/40"
            >
              <span className="flex items-center gap-3">
                <Swatch colors={current.swatch} />
                <span className="font-medium">{current.label}</span>
                <span className="text-xs text-muted-foreground">({current.mode})</span>
              </span>
              <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', themeOpen && 'rotate-180')} />
            </button>
            {themeOpen && (
              <div className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-popover shadow-md">
                {PALETTES.map(p => (
                  <button
                    key={p.key}
                    onClick={() => { setPalette(p.key as PaletteKey); setThemeOpen(false) }}
                    className={cn(
                      'flex w-full items-center justify-between border-b border-border/40 px-4 py-2.5 text-sm transition-colors last:border-0',
                      palette === p.key ? 'bg-primary/5' : 'hover:bg-accent'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Swatch colors={p.swatch} />
                      <span className="font-medium">{p.label}</span>
                    </span>
                    {palette === p.key && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-border/60">
        <CardContent className="px-5 py-4">
          <Button
            variant="outline"
            className="w-full text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
