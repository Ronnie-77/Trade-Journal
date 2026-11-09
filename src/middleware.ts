import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware — protects /dashboard route.
 * If no session cookie, redirects to / (public landing page).
 * All other routes (/, /privacy-policy.html, /terms-of-service.html, etc.)
 * are public and don't require authentication.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /dashboard
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = req.cookies.get('session')?.value

    if (!sessionCookie) {
      // No session cookie → redirect to landing page
      const landingUrl = new URL('/', req.url)
      return NextResponse.redirect(landingUrl)
    }

    // Optionally verify the session is not expired
    try {
      const decoded = decodeURIComponent(atob(sessionCookie))
      const data = JSON.parse(decoded)
      if (data.expires && data.expires < Date.now()) {
        // Session expired → redirect to landing page
        const landingUrl = new URL('/', req.url)
        return NextResponse.redirect(landingUrl)
      }
    } catch {
      // Invalid session cookie → redirect to landing page
      const landingUrl = new URL('/', req.url)
      return NextResponse.redirect(landingUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
