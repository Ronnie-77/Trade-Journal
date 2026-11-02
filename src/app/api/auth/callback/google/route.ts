import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForUser, NEXTAUTH_SECRET, APP_URL } from '@/lib/google-auth'

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

  try {
    const user = await exchangeCodeForUser(code)

    // Create a simple JWT-like session cookie (base64 encoded JSON)
    const sessionData = JSON.stringify({
      user,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    const sessionB64 = btoa(encodeURIComponent(sessionData))

    const res = NextResponse.redirect(APP_URL)
    res.cookies.set('session', sessionB64, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    // Clear the oauth_state cookie
    res.cookies.delete('oauth_state')
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.redirect(`${APP_URL}/?error=callback_failed`)
  }
}
