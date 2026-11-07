'use client'

import * as React from 'react'

export interface SessionUser {
  id: string
  name: string
  email: string
  image: string | null
}

export interface AppSession {
  user: SessionUser
  expires: number
}

function parseSession(cookie: string | undefined): AppSession | null {
  if (!cookie) return null
  try {
    const json = decodeURIComponent(atob(cookie))
    const data: AppSession = JSON.parse(json)
    if (data.expires < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export function useAppSession() {
  const [session, setSession] = React.useState<AppSession | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    const checkSession = () => {
      if (cancelled) return
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies
        .find(c => c.trim().startsWith('session='))
        ?.split('=').slice(1).join('=')
      const parsed = parseSession(sessionCookie)
      if (parsed) {
        setSession(parsed)
        setLoading(false)
        return true // found
      }
      return false // not found yet
    }

    // Immediate check
    if (checkSession()) return

    // If the URL has ?auth= or ?t= (just came from OAuth callback),
    // the cookie might take a moment to be available. Re-check several times.
    const url = new URL(window.location.href)
    const isAuthRedirect = url.searchParams.has('auth') || url.searchParams.has('t')

    if (isAuthRedirect) {
      // Aggressive re-checking for 3 seconds after OAuth redirect
      const delays = [100, 300, 600, 1000, 1500, 2000, 3000]
      const timers = delays.map(d => setTimeout(() => {
        if (checkSession()) {
          timers.forEach(t => clearTimeout(t))
        } else if (d === 3000) {
          // Final fallback — stop loading
          setLoading(false)
        }
      }, d))
      return () => {
        cancelled = true
        timers.forEach(t => clearTimeout(t))
      }
    }

    // Normal page load — check once more after a short delay
    const timer = setTimeout(() => {
      if (!checkSession()) setLoading(false)
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return { data: session, status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated' }
}

export function signIn() {
  // Clear stale state
  try { localStorage.removeItem('goldscalp-view') } catch {}
  // Use full redirect to clear any cached state
  window.location.href = '/api/auth/signin/google'
}

export function signOut() {
  // Clear all client-side state
  try {
    localStorage.removeItem('goldscalp-view')
    localStorage.removeItem('goldscalp-palette')
  } catch {}
  // Clear session cookie client-side — no domain attribute (matches
  // how the server set it: host-only cookie). Using domain=.workers.dev
  // would NOT match a host-only cookie and fail to delete it.
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax'
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=Lax'
  // Redirect to server-side signout (handles oauth_state + secure cookies)
  window.location.href = '/api/auth/signout'
}
