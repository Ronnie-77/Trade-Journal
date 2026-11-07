import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForUser, APP_URL } from '@/lib/google-auth'

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/?error=${error}`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/?error=missing_params`)
  }

  // Verify state cookie
  const cookieState = req.cookies.get('oauth_state')?.value
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(`${APP_URL}/?error=state_mismatch`)
  }

  // Determine secure flag from the request protocol.
  const isHttps = req.nextUrl.protocol === 'https:'

  try {
    const user = await exchangeCodeForUser(code)

    // Create session data
    const sessionData = JSON.stringify({
      user,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    const sessionB64 = btoa(encodeURIComponent(sessionData))

    // Redirect to home — URL will be cleaned by client-side useEffect
    const res = NextResponse.redirect(`${APP_URL}/?auth=success&t=${Date.now()}`)

    // Set session cookie — single cookie with correct secure flag
    res.cookies.set('session', sessionB64, {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    // Clear oauth_state cookie with matching attributes
    res.cookies.set('oauth_state', '', {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return res
  } catch (e) {
    console.error('OAuth callback error:', e)
    return NextResponse.redirect(`${APP_URL}/?error=callback_failed`)
  }
}
