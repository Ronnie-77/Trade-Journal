'use client'

import * as React from 'react'
import { useAppSession } from '@/lib/use-session'
import { SiteNav } from '@/components/site-nav'
import { PortfolioSection } from '@/components/sections/portfolio'
import { AnalyticsSection } from '@/components/sections/analytics'
import { AccountSection } from '@/components/sections/account'
import { Achievements } from '@/components/analytics/achievements'
import { useAllTrades } from '@/hooks/use-trades'
import { useViewStore } from '@/lib/view-store'
import { usePaletteStore, getPalette } from '@/lib/palette-store'
import { ParticleBackground } from '@/components/particle-background'
import { TradeForm } from '@/components/portfolio/trade-form'
import { useFormStore } from '@/lib/form-store'

export default function DashboardPage() {
  const view = useViewStore((s) => s.view)
  const setView = useViewStore((s) => s.setView)
  const { data: session, status } = useAppSession()
  const palette = usePaletteStore((s) => s.palette)
  const formOpen = useFormStore((s) => s.formOpen)
  const { data: allTrades } = useAllTrades()

  React.useEffect(() => {
    if (view !== 'portfolio' && view !== 'analytics' && view !== 'achievements' && view !== 'account') {
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
    <div key="dashboard" className="relative flex h-screen flex-col overflow-hidden sm:pl-[60px]">
      <SiteNav />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden pb-24 sm:pb-0">
        <ParticleBackground density={50} linkDistance={120} particleOpacity={0.3} lineOpacity={0.2} />
        <div className="relative z-10">
          {formOpen && (
            <div className="journal relative pb-16 sm:pb-0">
              <section className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-7">
                <TradeForm />
              </section>
            </div>
          )}
          {view === 'analytics' ? <AnalyticsSection /> :
           view === 'achievements' ? (
             <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-10">
               <h1 className="mb-6 text-xl font-bold tracking-tight sm:text-3xl">Achievements</h1>
               <Achievements trades={allTrades ?? []} />
             </section>
           ) :
           view === 'account' ? <AccountSection /> :
           !formOpen ? <PortfolioSection /> : null}
        </div>
      </main>
    </div>
  )
}
