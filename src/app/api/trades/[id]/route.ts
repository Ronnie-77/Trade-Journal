import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  let body: Partial<TradeInput>
  try {
    body = (await req.json()) as Partial<TradeInput>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: {
    tradeAt?: Date
    side?: TradeSide
    result?: TradeResult
    amount?: number
    comment?: string
    imageUrl?: string | null
    imageKind?: string | null
    instrument?: string
    lotSize?: number | null
    plannedRisk?: number | null
    strategy?: string | null
    mood?: string | null
  } = {}

  if (body.tradeAt) {
    const d = new Date(body.tradeAt)
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Invalid tradeAt' }, { status: 400 })
    }
    data.tradeAt = d
  }

  if (body.side && isSide(body.side)) data.side = body.side
  if (body.result && isResult(body.result)) {
    data.result = body.result
    // re-normalize amount sign when result changes
    const raw = Number(body.amount)
    if (!Number.isNaN(raw)) {
      data.amount = normalizeAmount(body.result, raw)
    }
  } else if (body.amount !== undefined) {
    // amount changed but result unchanged — keep sign consistent with existing result
    const result = body.result
    if (result && isResult(result)) {
      data.amount = normalizeAmount(result, Number(body.amount) || 0)
    }
  }

  if (body.comment !== undefined) {
    data.comment = body.comment.toString().slice(0, 500)
  }

  if (body.instrument !== undefined) {
    data.instrument =
      body.instrument.toString().trim().slice(0, 32) || 'XAUUSD'
  }
  if (body.lotSize !== undefined) {
    data.lotSize =
      body.lotSize === null ? null : Math.max(0, Number(body.lotSize) || 0)
  }
  if (body.plannedRisk !== undefined) {
    data.plannedRisk =
      body.plannedRisk === null
        ? null
        : Math.max(0, Number(body.plannedRisk) || 0)
  }
  if (body.strategy !== undefined) {
    data.strategy =
      body.strategy === null
        ? null
        : body.strategy.toString().slice(0, 32) || null
  }
  if (body.mood !== undefined) {
    data.mood =
      body.mood === null ? null : body.mood.toString().slice(0, 32) || null
  }

  // image handling: allow null to clear
  if ('imageUrl' in body) {
    if (body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      data.imageUrl = body.imageUrl.trim().slice(0, 2048)
      data.imageKind =
        body.imageKind && isImageKind(body.imageKind) ? body.imageKind : 'link'
    } else {
      data.imageUrl = null
      data.imageKind = null
    }
  }

  try {
    const updated = await db.trade.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/trades/[id] error', e)
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    await db.trade.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/trades/[id] error', e)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
