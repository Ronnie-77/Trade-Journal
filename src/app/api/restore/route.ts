import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/cookie-session'
import { type TradeSide, type TradeResult, SIDE_OPTIONS, RESULT_OPTIONS } from '@/lib/trade-types'

function isSide(v: string): v is TradeSide {
  return (SIDE_OPTIONS as string[]).includes(v)
}
function isResult(v: string): v is TradeResult {
  return (RESULT_OPTIONS as string[]).includes(v)
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  const userEmail = user?.email ?? undefined

  if (!userEmail) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: {
    version?: number
    trades?: Array<{
      tradeAt: string
      side: string
      result: string
      amount: number
      comment?: string
      imageUrl?: string | null
      imageKind?: string | null
      instrument?: string
      lotSize?: number | null
      plannedRisk?: number | null
      strategy?: string | null
      mood?: string | null
    }>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.trades || !Array.isArray(body.trades)) {
    return NextResponse.json({ error: 'No trades array found in backup file' }, { status: 400 })
  }

  try {
    const db = await getDb()
    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const t of body.trades) {
      try {
        if (!isSide(t.side) || !isResult(t.result)) {
          skipped++
          continue
        }

        const tradeAt = new Date(t.tradeAt)
        if (Number.isNaN(tradeAt.getTime())) {
          skipped++
          continue
        }

        const amount = Number(t.amount) || 0
        const instrument = (t.instrument || 'XAUUSD').toString().slice(0, 32)

        await db.trade.create({
          data: {
            tradeAt,
            side: t.side,
            result: t.result,
            amount,
            comment: (t.comment || '').toString().slice(0, 500),
            imageUrl: t.imageUrl || null,
            imageKind: t.imageKind || null,
            instrument,
            lotSize: t.lotSize ?? null,
            plannedRisk: t.plannedRisk ?? null,
            strategy: t.strategy || null,
            mood: t.mood || null,
            userId: userEmail,
          },
        })
        imported++
      } catch {
        skipped++
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      skipped,
      total: body.trades.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    })
  } catch (e) {
    console.error('Restore error:', e)
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 })
  }
}
