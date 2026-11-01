'use client'

import * as React from 'react'
import { SiteNav } from '@/components/site-nav'
import { Footer } from '@/components/sections/footer'
import { PortfolioSection } from '@/components/sections/portfolio'
import { AnalyticsSection } from '@/components/sections/analytics'
import { ResearchView } from '@/components/sections/research-view'
import { useViewStore } from '@/lib/view-store'

export default function Home() {
  const view = useViewStore((s) => s.view)
  // Avoid hydration mismatch: render nothing view-specific until mounted.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        {!mounted ? (
          <div className="py-32" />
        ) : view === 'portfolio' ? (
          <PortfolioSection />
        ) : view === 'analytics' ? (
          <AnalyticsSection />
        ) : (
          <ResearchView />
        )}
      </main>
      <Footer />
    </div>
  )
}
