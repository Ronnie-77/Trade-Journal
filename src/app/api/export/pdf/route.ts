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

    const stats = {
      total: trades.length,
      wins: trades.filter((t) => t.result === 'TP').length,
      losses: trades.filter((t) => t.result === 'SL').length,
      breakeven: trades.filter((t) => t.result === 'BE').length,
      net: trades.reduce((s, t) => s + t.amount, 0),
      totalProfit: trades.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      totalLoss: Math.abs(trades.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)),
    }
    const winRate = stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0
    const profitFactor = stats.totalLoss > 0 ? stats.totalProfit / stats.totalLoss : 0

    // Generate a printable HTML report (browsers can save as PDF via print dialog)
    const dateStr = new Date().toISOString().split('T')[0]
    const rows = trades.map((t) => {
      const d = new Date(t.tradeAt)
      const date = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      const rMult = t.plannedRisk && t.plannedRisk > 0 ? (t.amount / t.plannedRisk).toFixed(2) + 'R' : '—'
      const amountColor = t.amount > 0 ? '#22c55e' : t.amount < 0 ? '#ef4444' : '#71717a'
      return `<tr>
        <td style="text-align:center">${date}</td>
        <td style="text-align:center">${time}</td>
        <td style="font-weight:600">${t.instrument || '—'}</td>
        <td style="text-align:center;color:${t.side === 'BUY' ? '#22c55e' : '#ef4444'}">${t.side}</td>
        <td style="text-align:center">${t.result}</td>
        <td style="text-align:right;color:${amountColor};font-weight:600">${t.amount >= 0 ? '+' : ''}$${Math.abs(t.amount).toFixed(2)}</td>
        <td style="text-align:center">${t.lotSize ?? '—'}</td>
        <td style="text-align:right">${rMult}</td>
        <td style="font-size:11px;color:#666">${(t.comment || '').slice(0, 40)}</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trade Journal Report — ${dateStr}</title>
<style>
  @page { margin: 20px; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #fff; margin: 0; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff9d2e; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header .date { font-size: 12px; color: #71717a; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; }
  .stat-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f4f4f5; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e4e4e7; }
  td { padding: 6px 8px; border-bottom: 1px solid #f4f4f5; }
  tr:nth-child(even) { background: #fafafa; }
  .footer { margin-top: 20px; font-size: 11px; color: #71717a; text-align: center; }
  @media print { body { padding: 0; } .header { page-break-after: avoid; } tr { page-break-inside: avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>Trade Journal Report</h1>
    <div class="date">Generated: ${dateStr}<br>${trades.length} trades</div>
  </div>
  <div class="stats">
    <div class="stat-card"><div class="label">Net P&L</div><div class="value" style="color:${stats.net >= 0 ? '#22c55e' : '#ef4444'}">${stats.net >= 0 ? '+' : ''}$${stats.net.toFixed(2)}</div></div>
    <div class="stat-card"><div class="label">Win Rate</div><div class="value">${winRate.toFixed(1)}%</div></div>
    <div class="stat-card"><div class="label">Profit Factor</div><div class="value">${profitFactor.toFixed(2)}</div></div>
    <div class="stat-card"><div class="label">Total Trades</div><div class="value">${stats.total}</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Time</th><th>Instrument</th><th>Side</th><th>Result</th>
        <th>Amount</th><th>Lot</th><th>R Multiple</th><th>Comment</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">© 2026 Trade Journal — Generated by Trade Journal App</div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); }</script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (e) {
    console.error('Export PDF error:', e)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
