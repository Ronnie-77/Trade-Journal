// Pure functions to compute portfolio statistics from a Trade[] array.

import type { Trade } from '@/lib/trade-types'

export interface PortfolioStats {
  total: number
  wins: number // TP
  losses: number // SL
  breakeven: number // BE
  winRate: number // %, BE excluded
  lossRate: number // %
  totalProfit: number // sum of +amounts
  totalLoss: number // sum of |negative amounts| (positive number)
  net: number // totalProfit - totalLoss (signed)
  profitFactor: number // totalProfit / totalLoss
  expectancy: number // net / total
  avgWin: number
  avgLoss: number
  buyCount: number
  sellCount: number
  buyWinRate: number
  sellWinRate: number
  bestDay: { date: string; net: number } | null
  worstDay: { date: string; net: number } | null
  maxWinStreak: number
  currentStreak: number // +ve for win streak, -ve for loss streak, 0 for BE/none
  tradingDays: number
  avgPerDay: number
}

export function computeStats(trades: Trade[]): PortfolioStats {
  const total = trades.length
  const wins = trades.filter((t) => t.result === 'TP').length
  const losses = trades.filter((t) => t.result === 'SL').length
  const breakeven = trades.filter((t) => t.result === 'BE').length

  const positives = trades.filter((t) => t.amount > 0)
  const negatives = trades.filter((t) => t.amount < 0)
  const totalProfit = positives.reduce((s, t) => s + t.amount, 0)
  const totalLossAbs = negatives.reduce((s, t) => s + Math.abs(t.amount), 0)
  const net = totalProfit - totalLossAbs

  const decided = wins + losses
  const winRate = decided > 0 ? (wins / decided) * 100 : 0
  const lossRate = decided > 0 ? (losses / decided) * 100 : 0
  const profitFactor = totalLossAbs > 0 ? totalProfit / totalLossAbs : totalProfit > 0 ? Infinity : 0
  const expectancy = total > 0 ? net / total : 0
  const avgWin = wins > 0 ? totalProfit / wins : 0
  const avgLoss = losses > 0 ? totalLossAbs / losses : 0

  // Side stats
  const buys = trades.filter((t) => t.side === 'BUY')
  const sells = trades.filter((t) => t.side === 'SELL')
  const buyWins = buys.filter((t) => t.result === 'TP').length
  const buyLosses = buys.filter((t) => t.result === 'SL').length
  const sellWins = sells.filter((t) => t.result === 'TP').length
  const sellLosses = sells.filter((t) => t.result === 'SL').length
  const buyWinRate =
    buyWins + buyLosses > 0 ? (buyWins / (buyWins + buyLosses)) * 100 : 0
  const sellWinRate =
    sellWins + sellLosses > 0 ? (sellWins / (sellWins + sellLosses)) * 100 : 0

  // Daily aggregation (by local date string)
  const byDay = new Map<string, number>()
  for (const t of trades) {
    const d = new Date(t.tradeAt)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    byDay.set(key, (byDay.get(key) ?? 0) + t.amount)
  }
  const dayEntries = [...byDay.entries()].map(([date, net]) => ({ date, net }))
  dayEntries.sort((a, b) => a.date.localeCompare(b.date))
  const bestDay = dayEntries.reduce(
    (best, d) => (best === null || d.net > best.net ? d : best),
    null as { date: string; net: number } | null
  )
  const worstDay = dayEntries.reduce(
    (worst, d) => (worst === null || d.net < worst.net ? d : worst),
    null as { date: string; net: number } | null
  )

  // Streaks — walk in chronological order
  const chrono = [...trades].sort(
    (a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime()
  )
  let maxWinStreak = 0
  let curWin = 0
  let curLoss = 0
  let currentStreak = 0
  for (const t of chrono) {
    if (t.result === 'TP') {
      curWin++
      curLoss = 0
      maxWinStreak = Math.max(maxWinStreak, curWin)
    } else if (t.result === 'SL') {
      curLoss++
      curWin = 0
    } else {
      curWin = 0
      curLoss = 0
    }
  }
  // current streak = run from the most recent trade backwards
  for (let i = chrono.length - 1; i >= 0; i--) {
    const r = chrono[i].result
    if (r === 'BE') break
    if (currentStreak === 0) {
      currentStreak = r === 'TP' ? 1 : r === 'SL' ? -1 : 0
    } else if (currentStreak > 0 && r === 'TP') currentStreak++
    else if (currentStreak < 0 && r === 'SL') currentStreak--
    else break
  }

  return {
    total,
    wins,
    losses,
    breakeven,
    winRate,
    lossRate,
    totalProfit,
    totalLoss: totalLossAbs,
    net,
    profitFactor,
    expectancy,
    avgWin,
    avgLoss,
    buyCount: buys.length,
    sellCount: sells.length,
    buyWinRate,
    sellWinRate,
    bestDay,
    worstDay,
    maxWinStreak,
    currentStreak,
    tradingDays: byDay.size,
    avgPerDay: byDay.size > 0 ? total / byDay.size : 0,
  }
}

export interface EquityPoint {
  index: number
  date: string
  cum: number
}

export function equityCurve(trades: Trade[]): EquityPoint[] {
  const chrono = [...trades].sort(
    (a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime()
  )
  let cum = 0
  return chrono.map((t, i) => {
    cum += t.amount
    const d = new Date(t.tradeAt)
    return {
      index: i + 1,
      date: `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
        .getDate()
        .toString()
        .padStart(2, '0')}`,
      cum,
    }
  })
}

export interface DayPoint {
  date: string
  net: number
  trades: number
}

export function dailyPnl(trades: Trade[]): DayPoint[] {
  const byDay = new Map<string, { net: number; trades: number }>()
  for (const t of trades) {
    const d = new Date(t.tradeAt)
    const key = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
      .getDate()
      .toString()
      .padStart(2, '0')}`
    const cur = byDay.get(key) ?? { net: 0, trades: 0 }
    cur.net += t.amount
    cur.trades++
    byDay.set(key, cur)
  }
  return [...byDay.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function fmtMoney(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

export function fmtMoneyPlain(n: number): string {
  return `$${n.toFixed(2)}`
}
