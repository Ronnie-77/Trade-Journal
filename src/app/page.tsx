'use client'

import * as React from 'react'
import { useAppSession } from '@/lib/use-session'
import { SiteNav } from '@/components/site-nav'
import { MinimalFooter } from '@/components/sections/footer'
import { PortfolioSection } from '@/components/sections/portfolio'
import { AnalyticsSection } from '@/components/sections/analytics'
import { AccountSection } from '@/components/sections/account'
import { useViewStore } from '@/lib/view-store'
import { usePaletteStore, getPalette } from '@/lib/palette-store'
import { ParticleBackground } from '@/components/particle-background'
import { LandingPage } from '@/components/landing-page'
import { AuthPage } from '@/components/auth-page'

export default function Home() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const { data: session, status } = useAppSession()
  const palette = usePaletteStore((s) => s.palette)
  // Auth view: 'landing' | 'login' | 'signup'
  const [authView, setAuthView] = React.useState<'landing' | 'login' | 'signup'>('landing')

  React.useEffect(() => {
    if (view !== 'portfolio' && view !== 'analytics' && view !== 'account') {
      setView('portfolio')
    }
  }, [view, setView])

  // Clean auth query params from URL after login
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('auth') || params.has('error') || params.has('t')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Theme: landing & auth pages use the user's palette
  React.useEffect(() => {
    const root = document.documentElement
    if (!session) {
      // Landing + auth pages: use the user's chosen palette (or default)
      root.setAttribute('data-palette', palette)
      const mode = getPalette(palette).mode
      if (mode === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      root.style.colorScheme = mode
    } else {
      // App: user's saved palette
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

  // Not logged in → show landing, login, or signup page
  if (!session) {
    if (authView === 'login') {
      return (
        <AuthPage
          mode="login"
          onSwitchMode={setAuthView}
          onBack={() => setAuthView('landing')}
        />
      )
    }
    if (authView === 'signup') {
      return (
        <AuthPage
          mode="signup"
          onSwitchMode={setAuthView}
          onBack={() => setAuthView('landing')}
        />
      )
    }
    return (
      <LandingPage
        onSignIn={() => setAuthView('login')}
        onSignUp={() => setAuthView('signup')}
      />
    )
  }

  // Logged in → Dashboard (trade entry + analytics)
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <SiteNav />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-0">
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
