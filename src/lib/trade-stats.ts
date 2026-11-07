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
  // NEW — risk & depth metrics
  maxLossStreak: number
  maxDrawdown: number // largest peak-to-trough drop in equity (positive number)
  currentDrawdown: number // current drawdown from peak (positive number)
  largestWin: number
  largestLoss: number
  avgRMultiple: number | null // null if no trades have plannedRisk
  payOffRatio: number // avgWin / avgLoss
  recoveryFactor: number // net / maxDrawdown
  sharpeLike: number // simplified per-trade Sharpe (mean/std of returns)
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

  // Streaks + drawdown — walk in chronological order
  const chrono = [...trades].sort(
    (a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime()
  )
  let maxWinStreak = 0
  let maxLossStreak = 0
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
      maxLossStreak = Math.max(maxLossStreak, curLoss)
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

  // Drawdown: largest peak-to-trough drop in the running equity curve
  let peak = 0
  let cum = 0
  let maxDrawdown = 0
  for (const t of chrono) {
    cum += t.amount
    if (cum > peak) peak = cum
    const dd = peak - cum
    if (dd > maxDrawdown) maxDrawdown = dd
  }
  const currentDrawdown = Math.max(0, peak - cum)

  // Largest single win / loss
  const largestWin = positives.reduce((m, t) => Math.max(m, t.amount), 0)
  const largestLoss = negatives.reduce((m, t) => Math.max(m, Math.abs(t.amount)), 0)

  // Average R multiple (only across trades that have a plannedRisk > 0)
  const rTrades = trades.filter((t) => t.plannedRisk && t.plannedRisk > 0)
  const rValues = rTrades.map((t) => t.amount / (t.plannedRisk as number))
  const avgRMultiple = rValues.length > 0
    ? rValues.reduce((s, r) => s + r, 0) / rValues.length
    : null

  const payOffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0
  const recoveryFactor = maxDrawdown > 0 ? net / maxDrawdown : net > 0 ? Infinity : 0

  // Simplified per-trade Sharpe: mean(return) / std(return)
  const returns = chrono.map((t) => t.amount)
  const meanRet = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0
  const variance = returns.length > 1
    ? returns.reduce((s, r) => s + Math.pow(r - meanRet, 2), 0) / (returns.length - 1)
    : 0
  const stdRet = Math.sqrt(variance)
  const sharpeLike = stdRet > 0 ? meanRet / stdRet : 0

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
    maxLossStreak,
    maxDrawdown,
    currentDrawdown,
    largestWin,
    largestLoss,
    avgRMultiple,
    payOffRatio,
    recoveryFactor,
    sharpeLike,
  }
}

export interface EquityPoint {
  index: number
  date: string
  cum: number
  /** Drawdown from the peak so far (always ≥ 0). Useful for plotting the
   *  underwater equity curve. */
  drawdown: number
}

export function equityCurve(trades: Trade[]): EquityPoint[] {
  const chrono = [...trades].sort(
    (a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime()
  )
  let cum = 0
  let peak = 0
  return chrono.map((t, i) => {
    cum += t.amount
    if (cum > peak) peak = cum
    const d = new Date(t.tradeAt)
    return {
      index: i + 1,
      date: `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
        .getDate()
        .toString()
        .padStart(2, '0')}`,
      cum,
      drawdown: peak - cum,
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

/* ============================================================
   NEW — deeper breakdowns for the expanded Analytics view.
   ============================================================ */

export interface InstrumentBreakdown {
  symbol: string
  trades: number
  wins: number
  losses: number
  breakeven: number
  winRate: number // %, BE excluded
  net: number
  totalProfit: number
  totalLoss: number
  profitFactor: number
  expectancy: number
}

/** Per-instrument stats, sorted by net P&L descending. */
export function byInstrument(trades: Trade[]): InstrumentBreakdown[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const sym = (t.instrument || 'UNKNOWN').toUpperCase()
    const arr = map.get(sym) ?? []
    arr.push(t)
    map.set(sym, arr)
  }
  const out: InstrumentBreakdown[] = []
  for (const [symbol, ts] of map) {
    const wins = ts.filter((t) => t.result === 'TP').length
    const losses = ts.filter((t) => t.result === 'SL').length
    const breakeven = ts.filter((t) => t.result === 'BE').length
    const pos = ts.filter((t) => t.amount > 0)
    const neg = ts.filter((t) => t.amount < 0)
    const totalProfit = pos.reduce((s, t) => s + t.amount, 0)
    const totalLoss = neg.reduce((s, t) => s + Math.abs(t.amount), 0)
    const net = totalProfit - totalLoss
    const decided = wins + losses
    out.push({
      symbol,
      trades: ts.length,
      wins,
      losses,
      breakeven,
      winRate: decided > 0 ? (wins / decided) * 100 : 0,
      net,
      totalProfit,
      totalLoss,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
      expectancy: ts.length > 0 ? net / ts.length : 0,
    })
  }
  out.sort((a, b) => b.net - a.net)
  return out
}

export interface StrategyBreakdown {
  strategy: string
  trades: number
  wins: number
  losses: number
  winRate: number
  net: number
  avgAmount: number
}

/** Per-strategy stats, sorted by net P&L descending. */
export function byStrategy(trades: Trade[]): StrategyBreakdown[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const strat = (t.strategy || 'Unspecified').trim() || 'Unspecified'
    const arr = map.get(strat) ?? []
    arr.push(t)
    map.set(strat, arr)
  }
  const out: StrategyBreakdown[] = []
  for (const [strategy, ts] of map) {
    const wins = ts.filter((t) => t.result === 'TP').length
    const losses = ts.filter((t) => t.result === 'SL').length
    const net = ts.reduce((s, t) => s + t.amount, 0)
    const decided = wins + losses
    out.push({
      strategy,
      trades: ts.length,
      wins,
      losses,
      winRate: decided > 0 ? (wins / decided) * 100 : 0,
      net,
      avgAmount: ts.length > 0 ? net / ts.length : 0,
    })
  }
  out.sort((a, b) => b.net - a.net)
  return out
}

export interface HourPoint {
  hour: number // 0-23
  label: string // "00", "01", ...
  trades: number
  net: number
  wins: number
  losses: number
  winRate: number
}

/** Per-hour-of-day stats (0-23). Returns all 24 hours, even empty ones. */
export function byHour(trades: Trade[]): HourPoint[] {
  const buckets: HourPoint[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h.toString().padStart(2, '0'),
    trades: 0,
    net: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  }))
  for (const t of trades) {
    const h = new Date(t.tradeAt).getHours()
    const b = buckets[h]
    b.trades++
    b.net += t.amount
    if (t.result === 'TP') b.wins++
    else if (t.result === 'SL') b.losses++
  }
  for (const b of buckets) {
    const decided = b.wins + b.losses
    b.winRate = decided > 0 ? (b.wins / decided) * 100 : 0
  }
  return buckets
}

export interface DayOfWeekPoint {
  dow: number // 0=Sunday … 6=Saturday
  label: string // 'Sun', 'Mon', ...
  trades: number
  net: number
  wins: number
  losses: number
  winRate: number
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Per-day-of-week stats. Only returns days that have at least one trade. */
export function byDayOfWeek(trades: Trade[]): DayOfWeekPoint[] {
  const buckets: Record<number, DayOfWeekPoint> = {}
  for (let i = 0; i < 7; i++) {
    buckets[i] = {
      dow: i,
      label: DOW_LABELS[i],
      trades: 0,
      net: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    }
  }
  for (const t of trades) {
    const d = new Date(t.tradeAt).getDay()
    const b = buckets[d]
    b.trades++
    b.net += t.amount
    if (t.result === 'TP') b.wins++
    else if (t.result === 'SL') b.losses++
  }
  const out = Object.values(buckets)
  for (const b of out) {
    const decided = b.wins + b.losses
    b.winRate = decided > 0 ? (b.wins / decided) * 100 : 0
  }
  // Sort Mon → Sun (put Sun last)
  return out.sort((a, b) => ((a.dow + 6) % 7) - ((b.dow + 6) % 7))
}

export interface MonthPoint {
  key: string // YYYY-MM
  label: string // e.g. "Nov 2026"
  trades: number
  net: number
  wins: number
  losses: number
  winRate: number
  peak: number
  trough: number
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Per-month stats sorted chronologically. */
export function byMonth(trades: Trade[]): MonthPoint[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const d = new Date(t.tradeAt)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    const arr = map.get(key) ?? []
    arr.push(t)
    map.set(key, arr)
  }
  const out: MonthPoint[] = []
  for (const [key, ts] of map) {
    const [yStr, mStr] = key.split('-')
    const y = parseInt(yStr, 10)
    const m = parseInt(mStr, 10) - 1
    const wins = ts.filter((t) => t.result === 'TP').length
    const losses = ts.filter((t) => t.result === 'SL').length
    const net = ts.reduce((s, t) => s + t.amount, 0)
    const decided = wins + losses
    // peak & trough within the month (running cum)
    let run = 0
    let peak = 0
    let trough = 0
    for (const t of [...ts].sort((a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime())) {
      run += t.amount
      if (run > peak) peak = run
      if (run < trough) trough = run
    }
    out.push({
      key,
      label: `${MONTH_LABELS[m]} ${y}`,
      trades: ts.length,
      net,
      wins,
      losses,
      winRate: decided > 0 ? (wins / decided) * 100 : 0,
      peak,
      trough,
    })
  }
  out.sort((a, b) => a.key.localeCompare(b.key))
  return out
}

export interface RMultipleBucket {
  label: string
  count: number
  /** midpoint of the bucket range, used for bar chart */
  mid: number
}

/** Bucket R-multiples into ranges for a distribution histogram.
 *  Trades without plannedRisk are excluded. */
export function rMultipleDistribution(trades: Trade[]): {
  buckets: RMultipleBucket[]
  total: number
  avg: number | null
  best: number | null
  worst: number | null
} {
  const rValues = trades
    .filter((t) => t.plannedRisk && t.plannedRisk > 0)
    .map((t) => t.amount / (t.plannedRisk as number))
  if (rValues.length === 0) {
    return { buckets: [], total: 0, avg: null, best: null, worst: null }
  }
  // Buckets: ≤-3R, -3 to -2, -2 to -1, -1 to 0, 0 to 1, 1 to 2, 2 to 3, ≥3R
  const edges = [-Infinity, -3, -2, -1, 0, 1, 2, 3, Infinity]
  const labels = ['≤-3R', '-3 to -2', '-2 to -1', '-1 to 0', '0 to 1', '1 to 2', '2 to 3', '≥3R']
  const mids = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5]
  const counts = new Array(edges.length - 1).fill(0)
  for (const r of rValues) {
    for (let i = 0; i < edges.length - 1; i++) {
      if (r >= edges[i] && r < edges[i + 1]) {
        counts[i]++
        break
      }
    }
  }
  const buckets = labels.map((label, i) => ({ label, count: counts[i], mid: mids[i] }))
  const avg = rValues.reduce((s, r) => s + r, 0) / rValues.length
  const best = Math.max(...rValues)
  const worst = Math.min(...rValues)
  return { buckets, total: rValues.length, avg, best, worst }
}

export interface CalendarDay {
  date: string // YYYY-MM-DD
  net: number
  trades: number
}

/** Daily aggregation for a calendar heatmap. Returns entries for every day
 *  in the date range (including 0-trade days) so the heatmap can render
 *  continuous months. */
export function calendarDaily(trades: Trade[]): CalendarDay[] {
  if (trades.length === 0) return []
  const map = new Map<string, { net: number; trades: number }>()
  for (const t of trades) {
    const d = new Date(t.tradeAt)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    const cur = map.get(key) ?? { net: 0, trades: 0 }
    cur.net += t.amount
    cur.trades++
    map.set(key, cur)
  }
  // Find the date range
  const dates = trades.map((t) => new Date(t.tradeAt).getTime())
  const minT = Math.min(...dates)
  const maxT = Math.max(...dates)
  const out: CalendarDay[] = []
  const start = new Date(minT)
  start.setHours(0, 0, 0, 0)
  const end = new Date(maxT)
  end.setHours(0, 0, 0, 0)
  const cur = new Date(start)
  while (cur <= end) {
    const key = `${cur.getFullYear()}-${(cur.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${cur.getDate().toString().padStart(2, '0')}`
    const v = map.get(key)
    out.push({ date: key, net: v?.net ?? 0, trades: v?.trades ?? 0 })
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function fmtMoney(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}

export function fmtMoneyPlain(n: number): string {
  return `$${n.toFixed(2)}`
}

/** Compact money formatter for axis labels ($1.2k, -$340, etc.) */
export function fmtMoneyCompact(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`
  return `${sign}$${abs.toFixed(0)}`
}
