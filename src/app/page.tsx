'use client'

import * as React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { SiteNav } from '@/components/site-nav'
import { Footer, MinimalFooter } from '@/components/sections/footer'
import { PortfolioSection } from '@/components/sections/portfolio'
import { AnalyticsSection } from '@/components/sections/analytics'
import { ResearchView } from '@/components/sections/research-view'
import { AccountSection } from '@/components/sections/account'
import { useViewStore } from '@/lib/view-store'
import { TrendingUp } from 'lucide-react'

export default function Home() {
  const view = useViewStore((s) => s.view)
  const { data: session, status } = useSession()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Show loading while session is being checked
  if (!mounted || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Not authenticated → show login page
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Trade Journal
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track. Analyze. Improve.
              </p>
            </div>
          </div>

          {/* Google sign-in button */}
          <button
            onClick={() => signIn('google')}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:shadow-md"
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

  // Authenticated → show the app
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <SiteNav />
      {/* Independent scrollable content per view */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-0">
        {view === 'portfolio' ? (
          <PortfolioSection />
        ) : view === 'analytics' ? (
          <AnalyticsSection />
        ) : view === 'account' ? (
          <AccountSection />
        ) : (
          <ResearchView />
        )}
      </main>
      {/* Full footer (with disclaimer) only on Research; minimal elsewhere */}
      {view === 'research' ? <Footer /> : <MinimalFooter />}
    </div>
  )
}
