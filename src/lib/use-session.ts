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
    const checkSession = () => {
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies
        .find(c => c.trim().startsWith('session='))
        ?.split('=').slice(1).join('=')
      setSession(parseSession(sessionCookie))
      setLoading(false)
    }
    checkSession()
    // Re-check after a short delay (handles redirect timing)
    const timer = setTimeout(checkSession, 500)
    return () => clearTimeout(timer)
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
  // Clear session cookie client-side too (belt + suspenders)
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.workers.dev'
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  // Redirect to server-side signout
  window.location.href = '/api/auth/signout'
}
