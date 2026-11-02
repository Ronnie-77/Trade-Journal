import { NextRequest } from 'next/server'

export interface SessionUser {
  id: string
  name: string
  email: string
  image: string | null
}

interface SessionData {
  user: SessionUser
  expires: number
}

/** Read and verify the session cookie on the server (API routes). */
export function getSessionUser(req: NextRequest): SessionUser | null {
  const cookie = req.cookies.get('session')?.value
  if (!cookie) return null
  try {
    const json = decodeURIComponent(atob(cookie))
    const data: SessionData = JSON.parse(json)
    if (data.expires < Date.now()) return null
    return data.user
  } catch {
    return null
  }
}
