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

  // Check session on mount AND when URL changes (e.g. after OAuth redirect)
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
  }, [])

  return { data: session, status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated' }
}

export function signIn() {
  // Clear any stale localStorage before redirecting
  try { localStorage.removeItem('goldscalp-view') } catch {}
  window.location.href = '/api/auth/signin/google'
}

export function signOut() {
  // Clear localStorage so next login starts fresh
  try { localStorage.removeItem('goldscalp-view') } catch {}
  window.location.href = '/api/auth/signout'
}
