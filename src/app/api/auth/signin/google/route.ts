import { NextRequest } from 'next/server'
import { redirectToGoogle } from '@/lib/google-auth'

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID()
  // On Cloudflare Workers the request is always HTTPS, so secure:true is safe.
  // Use sameSite:'none' so the cookie is guaranteed to be sent when Google
  // redirects back to the callback (cross-site top-level navigation).
  // sameSite:'lax' SHOULD work for top-level redirects, but some browsers/
  // privacy modes can block it — 'none' + secure is the most reliable.
  const res = redirectToGoogle(state)
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 600,
    path: '/',
  })
  // Also set a lax version for same-site contexts
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
