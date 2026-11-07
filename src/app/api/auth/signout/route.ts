import { NextResponse } from 'next/server'
import { APP_URL } from '@/lib/google-auth'

export async function GET() {
  const res = NextResponse.redirect(APP_URL)
  // Delete session cookie with both secure flags
  res.cookies.set('session', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.cookies.set('session', '', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  // Delete oauth_state cookie with both secure flags too — otherwise the
  // secure version persists and causes state_mismatch on the next login.
  res.cookies.set('oauth_state', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.cookies.set('oauth_state', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.cookies.delete('session')
  res.cookies.delete('oauth_state')
  return res
}
