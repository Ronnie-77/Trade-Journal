import { ParticleBackground } from '@/components/particle-background'
import { Logo } from '@/components/logo'
import { TrendingUp, BarChart3, Wallet, Shield, Zap, Target, ArrowRight, Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trade Journal — Track. Analyze. Improve.',
  description:
    'Trade Journal is a web app for traders to record trades, analyze performance with deep analytics, and sharpen their trading edge. Track Forex, Metals, Indices, Energy, and Crypto with equity curves, win rate, profit factor, and more.',
  keywords: [
    'trade journal',
    'trading diary',
    'trade tracking',
    'trading analytics',
    'forex journal',
    'crypto journal',
    'win rate',
    'profit factor',
    'equity curve',
  ],
  authors: [{ name: 'Trade Journal' }],
  openGraph: {
    title: 'Trade Journal — Track. Analyze. Improve.',
    description:
      'A professional trade journal to record trades, analyze performance, and sharpen your trading edge.',
    siteName: 'Trade Journal',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <ParticleBackground density={70} linkDistance={120} particleOpacity={0.4} lineOpacity={0.25} />

      {/* Nav bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo size={26} className="text-foreground" />
          <span className="font-mono text-[15px] font-semibold">
            Trade<span className="text-primary"> Journal</span>
          </span>
        </a>
        <a
          href="/dashboard"
          className="rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent"
        >
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Your personal trading edge
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Track Every Trade.
          <br />
          <span className="text-primary">Master Every Move.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Trade Journal is a web app that helps traders record every trade, analyze performance
          with deep analytics, and sharpen their trading edge. Track Forex, Metals, Indices,
          Energy, and Crypto — all in one beautiful dashboard.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/dashboard"
            className="rounded-xl border border-border/60 bg-card/80 px-7 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent"
          >
            Sign In
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Sign in with Google or email
        </p>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary sm:text-3xl">28+</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Instruments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary sm:text-3xl">18+</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Analytics metrics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary sm:text-3xl">8</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Color themes</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">
          Everything you need to trade smarter
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          From entry to analysis — a complete toolkit for serious traders
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Trade Entry</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Log every trade with instrument, side, result, amount, lot size, planned risk,
              strategy, and chart screenshots. Built for speed.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Deep Analytics</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Win rate, profit factor, expectancy, equity curve, drawdown, R-multiples,
              performance by instrument, strategy, hour, and day.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Multi-Instrument</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Trade Forex, Metals, Indices, Energy, and Crypto from one journal. Add custom
              instruments and filter by any symbol.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Performance Insights</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              See your best trading hours, most profitable setups, monthly breakdowns, and
              streak analysis at a glance.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Secure &amp; Private</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Google OAuth or email authentication. Each trader&apos;s data is fully isolated —
              only you can see your trades.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Instant Themes</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              8 premium color themes — 4 dark and 4 light. Switch instantly from the profile
              dropdown. Your preference persists.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          Three steps to a better trading journal
        </h2>
        <div className="space-y-6">
          <div className="flex gap-5 rounded-xl border border-border/40 bg-card/30 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-lg font-bold text-primary">
              01
            </div>
            <div>
              <h3 className="text-base font-semibold">Sign in with Google or email</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                One click and you&apos;re in. No passwords to remember if you use Google, or
                create an account with your email in seconds.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-xl border border-border/40 bg-card/30 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-lg font-bold text-primary">
              02
            </div>
            <div>
              <h3 className="text-base font-semibold">Log your trades</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Quickly enter trades with all the details that matter — instrument, result,
                risk, screenshots, and notes.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-xl border border-border/40 bg-card/30 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-lg font-bold text-primary">
              03
            </div>
            <div>
              <h3 className="text-base font-semibold">Analyze &amp; improve</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Watch your equity curve grow, spot patterns in your best hours, and refine your
                edge with deep analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Ready to sharpen your edge?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Start your trading journal today. It&apos;s free.
        </p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={20} className="text-foreground" />
            <span className="font-mono text-xs font-semibold">
              Trade<span className="text-primary"> Journal</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="/privacy-policy.html" className="hover:text-foreground">Privacy Policy</a>
            <a href="/terms-of-service.html" className="hover:text-foreground">Terms of Service</a>
            <span>&copy; 2026 Trade Journal</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
