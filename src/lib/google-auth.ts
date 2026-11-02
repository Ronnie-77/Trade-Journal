import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GC_SECRET_B64 = process.env.GC_SECRET_B64 || ''
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

function getGoogleSecret(): string {
  if (GC_SECRET_B64) {
    try { return atob(GC_SECRET_B64) } catch { }
  }
  return process.env.GOOGLE_CLIENT_SECRET || ''
}

function getRedirectUrl(): string {
  return `${APP_URL}/api/auth/callback/google`
}

/** Build the Google OAuth consent URL and redirect the user there. */
export function redirectToGoogle(state: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'consent',
  })
  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}

/** Exchange the authorization code for Google tokens (fetch, not openid-client). */
export async function exchangeCodeForUser(code: string) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: getGoogleSecret(),
      redirect_uri: getRedirectUrl(),
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  const tokens = await tokenRes.json()

  // Fetch user profile
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!userRes.ok) throw new Error('Failed to fetch user info')
  const profile = await userRes.json()

  return {
    id: profile.sub,
    name: profile.name || profile.email,
    email: profile.email,
    image: profile.picture || null,
  }
}

export { GOOGLE_CLIENT_ID, NEXTAUTH_SECRET, APP_URL }
