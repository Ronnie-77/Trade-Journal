import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware — handles auth routing:
 *
 *   /              → if session cookie exists & valid → redirect to /dashboard
 *                    otherwise → show landing page (public)
 *   /dashboard     → if no session → redirect to /login
 *                    otherwise → show dashboard
 *   /login, /signup → if session exists → redirect to /dashboard
 *                     otherwise → show auth page
 *   /privacy-policy.html, /terms-of-service.html, etc. → always public
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionCookie = req.cookies.get('session')?.value

  // Check if session is valid
  let hasValidSession = false
  if (sessionCookie) {
    try {
      const decoded = decodeURIComponent(atob(sessionCookie))
      const data = JSON.parse(decoded)
      if (data.expires && data.expires > Date.now()) {
        hasValidSession = true
      }
    } catch {
      hasValidSession = false
    }
  }

  // If logged in and visiting / (landing) → redirect to /dashboard
  if (pathname === '/' && hasValidSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If logged in and visiting /login or /signup → redirect to /dashboard
  if ((pathname === '/login' || pathname === '/signup') && hasValidSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If NOT logged in and visiting /dashboard → redirect to /login
  if (pathname.startsWith('/dashboard') && !hasValidSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
}
