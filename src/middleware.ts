import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware — currently a pass-through. Auth is handled by the
 * /dashboard page component itself (shows login page if no session,
 * shows dashboard if authenticated). This file exists so that future
 * route protection can be added here if needed.
 *
 * All routes are public:
 *   /              → public landing page (Server Component)
 *   /dashboard     → auth handled by page component
 *   /privacy-policy.html, /terms-of-service.html → public static files
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
