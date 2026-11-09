'use client'

import * as React from 'react'
import { Logo } from '@/components/logo'
import { ParticleBackground } from '@/components/particle-background'
import { TrendingUp, BarChart3, Wallet, Shield, Zap, Target, ArrowRight, Check } from 'lucide-react'

export function LandingPage({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Particle network background */}
      <ParticleBackground density={70} linkDistance={120} particleOpacity={0.4} lineOpacity={0.25} />

      {/* ── Nav bar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Logo size={26} className="text-foreground" />
          <span className="font-mono text-sm font-semibold">
            Trade<span className="text-primary"> Journal</span>
          </span>
        </div>
        <button
          onClick={onSignIn}
          className="rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent"
        >
          Sign In
        </button>
      </nav>

      {/* ── Hero ── */}
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
          The professional trade journal that turns your trade history into actionable insights.
          Record trades, analyze performance, and sharpen your edge — all in one beautiful dashboard.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onSignUp}
            className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onSignIn}
            className="rounded-xl border border-border/60 bg-card/80 px-7 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent"
          >
            Sign In
          </button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Sign in with Google
        </p>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
          {[
            { value: '28+', label: 'Instruments' },
            { value: '18+', label: 'Analytics metrics' },
            { value: '8', label: 'Color themes' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">
          Everything you need to trade smarter
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          From entry to analysis — a complete toolkit for serious traders
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wallet, title: 'Trade Entry', desc: 'Log every trade with instrument, side, result, amount, lot size, planned risk, strategy, and chart screenshots. Built for speed.' },
            { icon: BarChart3, title: 'Deep Analytics', desc: 'Win rate, profit factor, expectancy, equity curve, drawdown, R-multiples, performance by instrument, strategy, hour, and day.' },
            { icon: Target, title: 'Multi-Instrument', desc: 'Trade Forex, Metals, Indices, Energy, and Crypto from one journal. Add custom instruments and filter by any symbol.' },
            { icon: TrendingUp, title: 'Performance Insights', desc: 'See your best trading hours, most profitable setups, monthly breakdowns, and streak analysis at a glance.' },
            { icon: Shield, title: 'Secure & Private', desc: 'Google OAuth authentication. Each trader\'s data is fully isolated — only you can see your trades.' },
            { icon: Zap, title: 'Instant Themes', desc: '8 premium color themes — 4 dark and 4 light. Switch instantly from the profile dropdown. Your preference persists.' },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          Three steps to a better trading journal
        </h2>
        <div className="space-y-6">
          {[
            { step: '01', title: 'Sign in with Google', desc: 'One click and you\'re in. No passwords, no setup. Your account is ready instantly.' },
            { step: '02', title: 'Log your trades', desc: 'Quickly enter trades with all the details that matter — instrument, result, risk, screenshots, and notes.' },
            { step: '03', title: 'Analyze & improve', desc: 'Watch your equity curve grow, spot patterns in your best hours, and refine your edge with deep analytics.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-5 rounded-xl border border-border/40 bg-card/30 p-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 font-mono text-lg font-bold text-primary">
                {s.step}
              </div>
              <div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Ready to sharpen your edge?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Start your trading journal today. It's free.
        </p>
        <button
          onClick={onSignUp}
          className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* ── Footer ── */}
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
            <span>© 2026 Trade Journal</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
