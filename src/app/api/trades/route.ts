import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/cookie-session'
import {
  type TradeInput,
  type TradeSide,
  type TradeResult,
  type ImageKind,
  SIDE_OPTIONS,
  RESULT_OPTIONS,
} from '@/lib/trade-types'

function isSide(v: string): v is TradeSide {
  return (SIDE_OPTIONS as string[]).includes(v)
}
function isResult(v: string): v is TradeResult {
  return (RESULT_OPTIONS as string[]).includes(v)
}
function isImageKind(v: string): v is ImageKind {
  return v === 'link' || v === 'upload'
}

function normalizeAmount(result: TradeResult, raw: number): number {
  if (result === 'TP') return Math.abs(raw)
  if (result === 'SL') return -Math.abs(raw)
  return 0
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams

  // Get the authenticated user's email for data isolation
  const user = getSessionUser(req)
  const userEmail = user?.email ?? undefined

  const where: {
    side?: string
    result?: string
    tradeAt?: { gte?: Date; lte?: Date }
    userId?: string | null
  } = { userId: userEmail }

  const side = url.get('side')
  if (side && side !== 'ALL' && isSide(side)) where.side = side

  const result = url.get('result')
  if (result && result !== 'ALL' && isResult(result)) where.result = result

  const fromDate = url.get('fromDate')
  const toDate = url.get('toDate')
  if (fromDate || toDate) {
    where.tradeAt = {}
    if (fromDate) where.tradeAt.gte = new Date(`${fromDate}T00:00:00`)
    if (toDate) where.tradeAt.lte = new Date(`${toDate}T23:59:59`)
  }

  try {
    const db = await getDb()
    const rows = await db.trade.findMany({
      where,
      orderBy: { tradeAt: 'desc' },
    })
    return NextResponse.json(rows)
  } catch (e) {
    console.error('GET /api/trades error', e)
    return NextResponse.json(
      { error: 'Failed to load trades' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  let body: TradeInput
  try {
    body = (await req.json()) as TradeInput
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.tradeAt || !isSide(body.side) || !isResult(body.result)) {
    return NextResponse.json(
      { error: 'Missing or invalid fields: tradeAt, side, result are required' },
      { status: 400 }
    )
  }

  const tradeAt = new Date(body.tradeAt)
  if (Number.isNaN(tradeAt.getTime())) {
    return NextResponse.json({ error: 'Invalid tradeAt' }, { status: 400 })
  }

  const amount = normalizeAmount(body.result, Number(body.amount) || 0)
  const comment = (body.comment ?? '').toString().slice(0, 500)

  let imageUrl: string | null = null
  let imageKind: string | null = null
  if (body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    imageUrl = body.imageUrl.trim().slice(0, 2048)
    imageKind =
      body.imageKind && isImageKind(body.imageKind) ? body.imageKind : 'link'
  }

  const instrument =
    (body.instrument ?? '').toString().trim().slice(0, 32) || 'XAUUSD'
  const lotSize =
    body.lotSize === null || body.lotSize === undefined
      ? null
      : Math.max(0, Number(body.lotSize) || 0)
  const plannedRisk =
    body.plannedRisk === null || body.plannedRisk === undefined
      ? null
      : Math.max(0, Number(body.plannedRisk) || 0)
  const strategy =
    body.strategy === null || body.strategy === undefined
      ? null
      : body.strategy.toString().slice(0, 32) || null
  const mood =
    body.mood === null || body.mood === undefined
      ? null
      : body.mood.toString().slice(0, 32) || null

  // Get the authenticated user's email
  const user = getSessionUser(req)
  const userEmail = user?.email ?? undefined

  try {
    const db = await getDb()
    const created = await db.trade.create({
      data: {
        tradeAt,
        side: body.side,
        result: body.result,
        amount,
        comment,
        imageUrl,
        imageKind,
        instrument,
        lotSize,
        plannedRisk,
        strategy,
        mood,
        userId: userEmail,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('POST /api/trades error', e)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  }
}
