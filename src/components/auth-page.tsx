'use client'

import * as React from 'react'
import { signIn } from '@/lib/use-session'
import { Logo } from '@/components/logo'
import { ParticleBackground } from '@/components/particle-background'
import { ArrowRight, Check, TrendingUp, Loader2, AlertCircle } from 'lucide-react'

/**
 * Auth page — supports both "login" and "signup" modes.
 * Two authentication methods:
 *   1. Google OAuth (primary — one click)
 *   2. Email + password (signup creates account, login verifies)
 *
 * Layout: split-screen — branding/features on the left (desktop),
 * form card on the right. Mobile: stacked, form first.
 */
export function AuthPage({
  mode,
  onSwitchMode,
  onBack,
}: {
  mode: 'login' | 'signup'
  onSwitchMode: (mode: 'login' | 'signup') => void
  onBack: () => void
}) {
  const isSignup = mode === 'signup'
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Clear error when switching modes or typing
  React.useEffect(() => { setError('') }, [mode])
  React.useEffect(() => { setError('') }, [name, email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
      const payload: { name?: string; email: string; password: string } = { email, password }
      if (isSignup) payload.name = name

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      // Success — the server sets the session cookie via Set-Cookie header.
      // Also set it client-side as a fallback (belt + suspenders) in case
      // the fetch response's Set-Cookie isn't processed by the browser.
      if (data.user) {
        const sessionData = {
          user: data.user,
          expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }
        const sessionB64 = btoa(encodeURIComponent(JSON.stringify(sessionData)))
        document.cookie = `session=${sessionB64}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
      }

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Left: Branding panel (desktop only) ── */}
      <div className="relative hidden w-1/2 animate-page-in-left flex-col justify-between overflow-hidden border-r border-border/40 p-12 lg:flex">
        <ParticleBackground density={60} linkDistance={110} particleOpacity={0.35} lineOpacity={0.2} />

        {/* Logo — clickable, navigates to landing page */}
        <a href="/" className="relative z-10 flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo size={28} className="text-foreground" />
          <span className="font-mono text-sm font-semibold">
            Trade<span className="text-primary"> Journal</span>
          </span>
        </a>

        {/* Middle: headline + features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            {isSignup ? (
              <>Start your trading<br />journey today.</>
            ) : (
              <>Welcome back to<br />your trading edge.</>
            )}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {isSignup
              ? 'Join traders who track every trade, analyze performance, and sharpen their edge with deep analytics.'
              : 'Sign in to access your trade journal, review past performance, and log new trades with full analytics.'}
          </p>
          <ul className="space-y-3">
            {[
              'Record trades with full detail & screenshots',
              '18+ analytics metrics & equity curve',
              'Performance by instrument, strategy & time',
              '8 premium color themes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: stats */}
        <div className="relative z-10 flex gap-6">
          <div>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <TrendingUp className="h-5 w-5" />
              28+
            </div>
            <div className="text-xs text-muted-foreground">Instruments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">18+</div>
            <div className="text-xs text-muted-foreground">Metrics</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-xs text-muted-foreground">Themes</div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div key={mode} className="animate-page-in-right relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile: logo at top — clickable */}
        <a href="/" className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80 lg:hidden">
          <Logo size={28} className="text-foreground" />
          <span className="font-mono text-sm font-semibold">
            Trade<span className="text-primary"> Journal</span>
          </span>
        </a>

        <div className="w-full max-w-sm space-y-6">
          {/* Back link */}
          <button
            onClick={onBack}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to home
          </button>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isSignup ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isSignup
                ? 'Start tracking your trades in seconds.'
                : 'Welcome back. Ready to log some trades?'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-500">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth button */}
          <button
            onClick={() => signIn()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/60 bg-card px-6 py-3.5 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignup ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                {isSignup ? 'Or sign up with email' : 'Or sign in with email'}
              </span>
            </div>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignup}
                  className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none transition-colors focus:border-primary/40"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none transition-colors focus:border-primary/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none transition-colors focus:border-primary/40"
              />
              {isSignup && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create account' : 'Sign in'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-xs text-muted-foreground">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => onSwitchMode('login')}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => onSwitchMode('signup')}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex gap-4 text-xs text-muted-foreground">
          <a href="/privacy-policy.html" className="hover:text-foreground">Privacy</a>
          <a href="/terms-of-service.html" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </div>
  )
}
