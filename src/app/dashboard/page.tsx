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

export default function DashboardPage() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const { data: session, status } = useAppSession()
  const palette = usePaletteStore((s) => s.palette)

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

  // Theme management
  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    const mode = getPalette(palette).mode
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    root.style.colorScheme = mode
  }, [palette])

  // Redirect to /login if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login'
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Logged in → Dashboard (trade entry + analytics)
  return (
    <div key="dashboard" className="animate-page-in relative flex h-screen flex-col overflow-hidden">
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
