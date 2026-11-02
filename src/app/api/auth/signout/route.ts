import { NextResponse } from 'next/server'
import { APP_URL } from '@/lib/google-auth'

export async function GET() {
  const res = NextResponse.redirect(APP_URL)
  res.cookies.delete('session')
  return res
}

export async function POST() {
  const res = NextResponse.redirect(APP_URL)
  res.cookies.delete('session')
  return res
}
