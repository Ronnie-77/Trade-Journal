import { NextRequest } from 'next/server'
import { redirectToGoogle } from '@/lib/google-auth'

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID()
  // Store state in a short-lived cookie for CSRF
  const res = redirectToGoogle(state)
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
