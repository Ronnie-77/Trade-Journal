import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/cookie-session'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  const userEmail = user?.email ?? undefined

  try {
    const db = await getDb()
    const trades = await db.trade.findMany({
      where: { userId: userEmail },
      orderBy: { tradeAt: 'asc' },
    })

    // CSV header
    const headers = [
      'Date', 'Time', 'Instrument', 'Side', 'Result',
      'Amount', 'Lot Size', 'Planned Risk', 'R Multiple',
      'Strategy', 'Mood', 'Comment', 'Screenshot',
    ]

    const rows = trades.map((t) => {
      const d = new Date(t.tradeAt)
      const date = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      const rMult = t.plannedRisk && t.plannedRisk > 0 ? (t.amount / t.plannedRisk).toFixed(2) : ''
      // Escape CSV fields (wrap in quotes if contains comma/quote/newline)
      const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, ' ')}"`
      return [
        date, time, t.instrument || '', t.side, t.result,
        t.amount.toFixed(2), t.lotSize?.toString() || '', t.plannedRisk?.toString() || '',
        rMult, t.strategy || '', t.mood || '', t.comment || '', t.imageUrl || '',
      ].map(esc).join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="trade-journal-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (e) {
    console.error('Export CSV error:', e)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
