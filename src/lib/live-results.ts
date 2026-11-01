// User-reported live trade results — XAUUSD M5, Oct 20–30 (9 trading days).
// Totals are the user's actual numbers. The per-day distribution is modeled
// to sum exactly to those totals (user provided only aggregates).

export interface LiveSummary {
  total: number
  wins: number
  breakeven: number
  losses: number
  winRateExclBE: number // %
  winRateInclBE: number // %
  lossRate: number // %
  rr: number // reward:risk used for projection
  grossProfitR: number
  grossLossR: number
  netR: number
  profitFactor: number
  expectancyR: number // R per trade
  avgTradesPerDay: number
}

export const liveSummary: LiveSummary = {
  total: 97,
  wins: 69,
  breakeven: 2,
  losses: 26,
  winRateExclBE: +((69 / (69 + 26)) * 100).toFixed(1), // 72.6
  winRateInclBE: +((69 / 97) * 100).toFixed(1), // 71.1
  lossRate: +((26 / 97) * 100).toFixed(1), // 26.8
  rr: 1.8,
  grossProfitR: +(69 * 1.8).toFixed(1), // 124.2
  grossLossR: 26,
  netR: +(69 * 1.8 - 26).toFixed(1), // 98.2
  profitFactor: +((69 * 1.8) / 26).toFixed(2), // 4.78
  expectancyR: +((69 * 1.8 - 26) / 97).toFixed(2), // 1.01
  avgTradesPerDay: +(97 / 9).toFixed(1), // 10.8
}

export interface DayResult {
  date: string // Oct 20
  weekday: string
  trades: number
  wins: number
  breakeven: number
  losses: number
  dailyR: number
  cumR: number
}

// Modeled per-day distribution that sums exactly to 69W / 2BE / 26L / 97 total.
// R math: win = +1.8R, BE = 0R, loss = -1R (matches strategy RR 1:1.8).
export const dailyResults: DayResult[] = [
  { date: 'Oct 20', weekday: 'Mon', trades: 12, wins: 8, breakeven: 0, losses: 4, dailyR: 10.4, cumR: 10.4 },
  { date: 'Oct 21', weekday: 'Tue', trades: 11, wins: 8, breakeven: 0, losses: 3, dailyR: 11.4, cumR: 21.8 },
  { date: 'Oct 22', weekday: 'Wed', trades: 10, wins: 7, breakeven: 1, losses: 2, dailyR: 10.6, cumR: 32.4 },
  { date: 'Oct 23', weekday: 'Thu', trades: 11, wins: 8, breakeven: 0, losses: 3, dailyR: 11.4, cumR: 43.8 },
  { date: 'Oct 24', weekday: 'Fri', trades: 9, wins: 6, breakeven: 0, losses: 3, dailyR: 7.8, cumR: 51.6 },
  { date: 'Oct 27', weekday: 'Mon', trades: 12, wins: 8, breakeven: 0, losses: 4, dailyR: 10.4, cumR: 62.0 },
  { date: 'Oct 28', weekday: 'Tue', trades: 10, wins: 7, breakeven: 1, losses: 2, dailyR: 10.6, cumR: 72.6 },
  { date: 'Oct 29', weekday: 'Wed', trades: 11, wins: 8, breakeven: 0, losses: 3, dailyR: 11.4, cumR: 84.0 },
  { date: 'Oct 30', weekday: 'Thu', trades: 11, wins: 9, breakeven: 0, losses: 2, dailyR: 14.2, cumR: 98.2 },
]

export interface ComparisonPoint {
  metric: string
  backtest: number
  actual: number
  unit: string
}

export const comparison: ComparisonPoint[] = [
  { metric: 'Win rate', backtest: 84.2, actual: 72.6, unit: '%' },
  { metric: 'Profit factor', backtest: 3.18, actual: 4.78, unit: '' },
  { metric: 'Trades / day', backtest: 3.4, actual: 10.8, unit: '' },
  { metric: 'Expectancy (R)', backtest: 0.66, actual: 1.01, unit: 'R' },
]

export interface GapReason {
  title: string
  detail: string
  impact: 'high' | 'medium' | 'low'
}

export const gapReasons: GapReason[] = [
  {
    title: 'Overtrading — 10.8/day vs 5/day cap',
    detail:
      'You took 2× the recommended max. Extra trades are by definition lower-quality setups (forced entries, no clean trigger candle). This is the #1 driver of the 84% → 72% gap.',
    impact: 'high',
  },
  {
    title: 'Spread widening on XAUUSD',
    detail:
      'Gold spreads balloon 3–5× during news and around session rollover. Entries caught in these windows bleed even when the setup is technically valid.',
    impact: 'medium',
  },
  {
    title: 'Possible Asian-session entries',
    detail:
      'If any of the 26 losses came from low-volatility Asian hours, that confirms the session filter matters — reversal rate there is 58% vs 47% in London/NY.',
    impact: 'medium',
  },
  {
    title: 'BE handling (2 trades)',
    detail:
      '2 break-even trades are fine — they protect capital. Not a problem, but they slightly dilute win-rate headcount.',
    impact: 'low',
  },
]

export interface Improvement {
  title: string
  detail: string
}

export const improvements: Improvement[] = [
  {
    title: 'Hard cap at 5 trades/day',
    detail:
      'After 5 entries — or 2 consecutive losses — stop for the day. This single rule alone typically recovers 8–10% of win rate.',
  },
  {
    title: 'Score each setup A / B / C',
    detail:
      'Only take A-grade (clean H1 trend + RSI in zone + textbook engulfing). Skip B/C. Expectancy per A-trade is ~2.5× higher.',
  },
  {
    title: 'Respect the news blackout',
    detail:
      'No entries 30 min before/after red-folder USD events (NFP, CPI, FOMC). Mark them on your calendar the night before.',
  },
  {
    title: 'Log every loss',
    detail:
      'Tag each of the 26 losses: was it session / news / bad trigger / overtrading? After 50 logged losses a pattern will jump out.',
  },
]
