'use client'

import * as React from 'react'
import { useAppSession, signIn, signOut } from '@/lib/use-session'
import { SiteNav } from '@/components/site-nav'
import { MinimalFooter } from '@/components/sections/footer'
import { PortfolioSection } from '@/components/sections/portfolio'
import { AnalyticsSection } from '@/components/sections/analytics'
import { AccountSection } from '@/components/sections/account'
import { useViewStore } from '@/lib/view-store'
import { usePaletteStore, getPalette } from '@/lib/palette-store'
import { Logo } from '@/components/logo'
import { ParticleBackground } from '@/components/particle-background'

export default function Home() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const { data: session, status } = useAppSession()
  const palette = usePaletteStore((s) => s.palette)

  React.useEffect(() => {
    // Reset invalid persisted view (e.g. 'research' from old code)
    if (view !== 'portfolio' && view !== 'analytics' && view !== 'account') {
      setView('portfolio')
    }
  }, [view, setView])

  // Clean auth query params from the URL after login (e.g. ?auth=success&t=…).
  // These are just flags/cache-busters — the actual session is in the cookie.
  // Removing them keeps the URL clean and avoids confusing users.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('auth') || params.has('error') || params.has('t')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Force a light theme on the login page (peachy→mint gradient aesthetic).
  // When the user logs in, restore their chosen palette.
  React.useEffect(() => {
    const root = document.documentElement
    if (!session) {
      // Login page: always light (coral-light palette has peachy tones)
      root.setAttribute('data-palette', 'coral-light')
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    } else {
      // App: restore the user's saved palette
      root.setAttribute('data-palette', palette)
      const mode = getPalette(palette).mode
      if (mode === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      root.style.colorScheme = mode
    }
  }, [session, palette])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Soft peachy→mint gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, #FDE8E4 0%, #FCEDE8 20%, #F4F2EC 45%, #E8F0E9 70%, #E0EEE7 100%)',
          }}
        />
        {/* Particle network / constellation (dark dots on light bg) */}
        <ParticleBackground density={90} linkDistance={140} />
        {/* Ambient glow orbs (warm + cool, subtle) */}
        <div
          className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full opacity-30 blur-[120px] animate-gold-pulse"
          style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.4), transparent 60%)' }}
        />
        <div
          className="pointer-events-none absolute -right-40 bottom-10 h-[32rem] w-[32rem] rounded-full opacity-25 blur-[120px] animate-gold-pulse"
          style={{ background: 'radial-gradient(circle, rgba(134,197,160,0.35), transparent 60%)', animationDelay: '1.5s' }}
        />
        {/* Login content */}
        <div className="relative z-10 w-full max-w-sm space-y-10 text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 ring-1 ring-primary/30 shadow-lg">
              <Logo size={60} className="text-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
              <p className="text-sm text-muted-foreground">Track. Analyze. Improve.</p>
            </div>
          </div>
          <button
            onClick={() => signIn()}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-6 py-4 text-sm font-medium shadow-lg transition-all hover:bg-accent hover:shadow-xl"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-muted-foreground">
            Sign in to track your trades, view analytics, and manage your journal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <SiteNav />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-0">
        {/* Subtle particle network in the background of all app views */}
        <ParticleBackground density={50} linkDistance={120} particleOpacity={0.3} lineOpacity={0.2} />
        <div className="relative z-10">
          {view === 'analytics' ? <AnalyticsSection /> :
           view === 'account' ? <AccountSection /> :
           <PortfolioSection />}
        </div>
      </main>
      <MinimalFooter />
    </div>
  )
}
