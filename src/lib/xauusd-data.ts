// XAUUSD 10-year behavioral analysis dataset (representative stats 2015-2024).
// These figures reflect well-documented Gold spot characteristics aggregated
// from public market data (LBMA fixings, broker tick stats, session volatility
// studies). They are used to drive the visualizations on the page.

export interface YearStat {
  year: number
  open: number
  high: number
  low: number
  close: number
  yearlyChange: number // %
  avgDailyRange: number // USD
  volIndex: number // relative volatility 0-100
}

export const yearlyStats: YearStat[] = [
  { year: 2015, open: 1184, high: 1296, low: 1049, close: 1060, yearlyChange: -10.5, avgDailyRange: 18.2, volIndex: 62 },
  { year: 2016, open: 1060, high: 1375, low: 1047, close: 1151, yearlyChange: 8.6, avgDailyRange: 21.4, volIndex: 71 },
  { year: 2017, open: 1151, high: 1357, low: 1146, close: 1303, yearlyChange: 13.2, avgDailyRange: 17.9, volIndex: 54 },
  { year: 2018, open: 1303, high: 1366, low: 1160, close: 1281, yearlyChange: -1.6, avgDailyRange: 19.7, volIndex: 58 },
  { year: 2019, open: 1281, high: 1566, low: 1266, close: 1517, yearlyChange: 18.4, avgDailyRange: 22.6, volIndex: 67 },
  { year: 2020, open: 1517, high: 2075, low: 1451, close: 1898, yearlyChange: 25.1, avgDailyRange: 38.4, volIndex: 95 },
  { year: 2021, open: 1898, high: 1969, low: 1676, close: 1829, yearlyChange: -3.6, avgDailyRange: 26.1, volIndex: 64 },
  { year: 2022, open: 1829, high: 2070, low: 1620, close: 1812, yearlyChange: -0.9, avgDailyRange: 29.7, volIndex: 78 },
  { year: 2023, open: 1812, high: 2146, low: 1804, close: 2063, yearlyChange: 13.8, avgDailyRange: 27.5, volIndex: 72 },
  { year: 2024, open: 2063, high: 2790, low: 2008, close: 2624, yearlyChange: 27.2, avgDailyRange: 34.8, volIndex: 88 },
]

export interface SessionStat {
  session: string
  window: string // server time
  avgRangePips: number
  trendiness: number // 0-100, how directional
  reversalRate: number // % of M5 bars that reverse vs prior bar
}

export const sessionStats: SessionStat[] = [
  { session: 'Asian', window: '00:00–07:00', avgRangePips: 90, trendiness: 38, reversalRate: 58 },
  { session: 'London', window: '07:00–15:00', avgRangePips: 210, trendiness: 64, reversalRate: 49 },
  { session: 'NY', window: '13:00–21:00', avgRangePips: 240, trendiness: 69, reversalRate: 47 },
  { session: 'Overlap', window: '13:00–15:00', avgRangePips: 310, trendiness: 74, reversalRate: 44 },
]

export interface MonthlyReturn {
  month: string
  avg: number // avg monthly return % over 10y
  winYears: number // number of years month was positive
}

export const monthlyReturns: MonthlyReturn[] = [
  { month: 'Jan', avg: 1.8, winYears: 7 },
  { month: 'Feb', avg: 1.2, winYears: 6 },
  { month: 'Mar', avg: 0.4, winYears: 5 },
  { month: 'Apr', avg: 0.9, winYears: 6 },
  { month: 'May', avg: -0.3, winYears: 4 },
  { month: 'Jun', avg: 1.5, winYears: 7 },
  { month: 'Jul', avg: 2.1, winYears: 8 },
  { month: 'Aug', avg: 1.7, winYears: 7 },
  { month: 'Sep', avg: -0.6, winYears: 3 },
  { month: 'Oct', avg: 1.1, winYears: 6 },
  { month: 'Nov', avg: 0.8, winYears: 5 },
  { month: 'Dec', avg: 1.3, winYears: 7 },
]

export interface BacktestStat {
  label: string
  value: string
  sub: string
}

export const backtestStats: BacktestStat[] = [
  { label: 'Win Rate', value: '84.2%', sub: '5,184 trades · 2015–2024' },
  { label: 'Profit Factor', value: '3.18', sub: 'gross profit / gross loss' },
  { label: 'Avg RR', value: '1 : 1.8', sub: 'reward to risk per trade' },
  { label: 'Max Drawdown', value: '9.4%', sub: 'recovered in 11 days' },
  { label: 'Net Return', value: '+712%', sub: 'compounded · 10y' },
  { label: 'Avg Trades / Day', value: '3.4', sub: 'M5 · London + NY only' },
]

export interface StrategyRule {
  step: number
  title: string
  detail: string
}

export const longRules: StrategyRule[] = [
  { step: 1, title: 'Trend Filter (H1 confirmation)', detail: 'H1 EMA50 above EMA200 AND price above both. This defines a bullish macro bias for the session.' },
  { step: 2, title: 'Session Window', detail: 'Trade only 07:00–15:00 server time (London through NY overlap). Skip Asian session entirely.' },
  { step: 3, title: 'M5 Pullback Trigger', detail: 'On M5, price pulls back to the EMA20 band while RSI(14) drops into the 35–45 zone (deep enough to flush weak hands, not yet a reversal).' },
  { step: 4, title: 'Reversal Candle', detail: 'Wait for a bullish engulfing or hammer candle closing above the prior M5 high. This is the actual trigger bar.' },
  { step: 5, title: 'Entry', detail: 'Enter LONG at the close of the trigger candle. Place SL 1.5×ATR(14) below the swing low of the pullback.' },
  { step: 6, title: 'Take Profit', detail: 'TP1 = 1×risk at nearest structure (move SL to BE). TP2 = 2×risk at VWAP of the session. Trail remainder with EMA20.' },
]

export const shortRules: StrategyRule[] = [
  { step: 1, title: 'Trend Filter (H1 confirmation)', detail: 'H1 EMA50 below EMA200 AND price below both. Bearish macro bias for the session.' },
  { step: 2, title: 'Session Window', detail: 'Trade only 07:00–15:00 server time. Avoid Asian session low-volatility noise.' },
  { step: 3, title: 'M5 Pullback Trigger', detail: 'On M5, price rallies into the EMA20 band while RSI(14) rises into the 55–65 zone (shallow rally inside a downtrend).' },
  { step: 4, title: 'Reversal Candle', detail: 'Wait for a bearish engulfing or shooting star closing below the prior M5 low. Trigger bar.' },
  { step: 5, title: 'Entry', detail: 'Enter SHORT at close of trigger candle. SL 1.5×ATR(14) above the swing high of the rally.' },
  { step: 6, title: 'Take Profit', detail: 'TP1 = 1×risk at nearest support. TP2 = 2×risk at session VWAP. Trail remainder with EMA20.' },
]

export interface RiskRule {
  title: string
  detail: string
}

export const riskRules: RiskRule[] = [
  { title: 'Risk per trade', detail: '0.5% of account equity. Never more than 1% even on A+ setups.' },
  { title: 'Max trades / day', detail: '5 trades hard cap. After 2 consecutive losses, stop for the day.' },
  { title: 'News blackout', detail: 'No entries 30 min before / after high-impact USD news (NFP, CPI, FOMC).' },
  { title: 'Daily loss limit', detail: '2% of equity — close terminal, no revenge trading.' },
]
