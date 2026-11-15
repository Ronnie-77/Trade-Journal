import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/cookie-session'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  const userEmail = user?.email ?? undefined

  if (!userEmail) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const trades = await db.trade.findMany({
      where: { userId: userEmail },
      orderBy: { tradeAt: 'asc' },
    })

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userEmail,
      totalTrades: trades.length,
      trades: trades.map((t) => ({
        tradeAt: t.tradeAt.toISOString(),
        side: t.side,
        result: t.result,
        amount: t.amount,
        comment: t.comment,
        imageUrl: t.imageUrl,
        imageKind: t.imageKind,
        instrument: t.instrument,
        lotSize: t.lotSize,
        plannedRisk: t.plannedRisk,
        strategy: t.strategy,
        mood: t.mood,
      })),
    }

    const json = JSON.stringify(backup, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="trade-journal-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (e) {
    console.error('Backup error:', e)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}
