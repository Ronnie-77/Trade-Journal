import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  try {
    const db = await getDb()

    // Find user by email
    const user = await db.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      )
    }

    // Verify password
    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.passwordHash) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Create session
    const isHttps = req.nextUrl.protocol === 'https:'
    const sessionData = {
      user: {
        id: user.id,
        name: user.name || email,
        email: user.email,
        image: user.image,
      },
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    }

    const res = NextResponse.json({
      ok: true,
      user: sessionData.user,
    })
    const sessionB64 = btoa(encodeURIComponent(JSON.stringify(sessionData)))
    res.cookies.set('session', sessionB64, {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}

/** Hash a password using PBKDF2 via Web Crypto API (must match signup). */
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = enc.encode('trade-journal-salt-v1')
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
