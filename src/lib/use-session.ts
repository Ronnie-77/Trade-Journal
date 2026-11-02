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
    // Read session cookie on client
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1]
    setSession(parseSession(sessionCookie))
    setLoading(false)
  }, [])

  return { data: session, status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated' }
}

export function signIn() {
  window.location.href = '/api/auth/signin/google'
}

export function signOut() {
  window.location.href = '/api/auth/signout'
}
