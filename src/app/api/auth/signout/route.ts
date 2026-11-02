import { NextResponse } from 'next/server'
import { APP_URL } from '@/lib/google-auth'

export async function GET() {
  const res = NextResponse.redirect(APP_URL)
  // Clear session cookie with same options it was set with
  res.cookies.set('session', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.cookies.delete('session')
  res.cookies.delete('oauth_state')
  // Clear localStorage view via a script in the redirect page
  return res
}

export async function POST() {
  const res = NextResponse.redirect(APP_URL)
  res.cookies.set('session', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.cookies.delete('session')
  res.cookies.delete('oauth_state')
  return res
}
