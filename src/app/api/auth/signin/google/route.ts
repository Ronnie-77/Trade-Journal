import { NextRequest } from 'next/server'
import { redirectToGoogle } from '@/lib/google-auth'

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID()
  // Store state in a short-lived cookie for CSRF verification.
  // Set BOTH secure and non-secure versions so the cookie works on
  // HTTP (localhost) AND can be properly deleted later (a secure cookie
  // can only be deleted by another secure-flagged delete response).
  const res = redirectToGoogle(state)
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
