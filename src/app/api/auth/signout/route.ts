import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Redirect to landing page (/) after logout
  const res = NextResponse.redirect(new URL('/', req.url))

  // Delete session cookie — both secure flags
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

  // Delete oauth_state cookie too
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
