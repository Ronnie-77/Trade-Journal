'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import {
  BarChart3,
  Trophy,
  TrendingDown,
  TrendingUp,
  Scale,
  Gauge,
  Flame,
  CalendarDays,
  Activity,
  Loader2,
  Wallet,
  Percent,
  ShieldAlert,
  Zap,
  Crown,
  Skull,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAllTrades } from '@/hooks/use-trades'
import { Progress } from '@/components/ui/progress'
import {
  computeStats,
  equityCurve,
  dailyPnl,
  fmtMoney,
  byInstrument,
  byStrategy,
  byHour,
  byDayOfWeek,
  byMonth,
  rMultipleDistribution,
} from '@/lib/trade-stats'
import { InstrumentBreakdownCard } from '@/components/analytics/instrument-breakdown'
import { StrategyBreakdownCard } from '@/components/analytics/strategy-breakdown'
import { TimeAnalysisCard } from '@/components/analytics/time-analysis'
import { MonthlyPerformanceCard } from '@/components/analytics/monthly-performance'
import { RiskMetricsCard } from '@/components/analytics/risk-metrics'

const tooltipStyle = {
  backgroundColor: 'rgba(248, 248, 250, 0.97)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: '0.5rem',
  color: '#18181b',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}

/** Custom value label for the daily P&L bars — sits above positive bars
 *  (green) and below negative bars (red). */
function BarValueLabel(props: {
  x?: number
  y?: number
  width?: number
  value?: number
  height?: number
}) {
  const { x = 0, y = 0, width = 0, value } = props
  if (value == null || value === 0) return null
  const isPos = value >= 0
  const text = `${isPos ? '+' : '-'}$${Math.abs(value).toFixed(0)}`
  return (
    <text
      x={x + width / 2}
      y={isPos ? y - 6 : y + 14}
      fill={isPos ? 'var(--chart-2)' : 'var(--chart-3)'}
      fontSize={10}
      fontWeight={600}
      textAnchor="middle"
    >
      {text}
    </text>
  )
}

export function AnalyticsSection() {
  const { data: trades, isLoading, isError } = useAllTrades()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError || !trades) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-rose-500">
        Failed to load trades for analytics.
      </div>
    )
  }

  const s = computeStats(trades)
  const curve = equityCurve(trades)
  const daily = dailyPnl(trades)
  const instrumentRows = byInstrument(trades)
  const strategyRows = byStrategy(trades)
  const hourRows = byHour(trades)
  const dowRows = byDayOfWeek(trades)
  const monthRows = byMonth(trades)
  const rDist = rMultipleDistribution(trades)

  const outcomeData = [
    { name: 'Wins (TP)', value: s.wins, color: 'var(--chart-2)' },
    { name: 'Break-even', value: s.breakeven, color: 'var(--muted-foreground)' },
    { name: 'Losses (SL)', value: s.losses, color: 'var(--chart-3)' },
  ].filter((d) => d.value > 0)

  const sideData = [
    {
      name: 'BUY',
      wins: trades.filter((t) => t.side === 'BUY' && t.result === 'TP').length,
      losses: trades.filter((t) => t.side === 'BUY' && t.result === 'SL').length,
    },
    {
      name: 'SELL',
      wins: trades.filter((t) => t.side === 'SELL' && t.result === 'TP').length,
      losses: trades.filter((t) => t.side === 'SELL' && t.result === 'SL').length,
    },
  ]

  const stats = [
    { icon: Activity, label: 'Total trades', value: `${s.total}`, sub: `${s.tradingDays} trading days`, tone: 'neutral' },
    { icon: Trophy, label: 'Wins', value: `${s.wins}`, sub: `${s.winRate.toFixed(1)}% win rate`, tone: 'pos' },
    { icon: TrendingDown, label: 'Losses', value: `${s.losses}`, sub: `${s.lossRate.toFixed(1)}% loss rate`, tone: 'neg' },
    { icon: Scale, label: 'Break-even', value: `${s.breakeven}`, sub: 'protected capital', tone: 'neutral' },
    { icon: TrendingUp, label: 'Total profit', value: fmtMoney(s.totalProfit), sub: 'gross winning $', tone: 'pos' },
    { icon: TrendingDown, label: 'Total loss', value: `-$${s.totalLoss.toFixed(2)}`, sub: 'gross losing $', tone: 'neg' },
    { icon: Wallet, label: 'Net P&L', value: fmtMoney(s.net), sub: 'profit − loss', tone: s.net >= 0 ? 'pos' : 'neg' },
    { icon: Gauge, label: 'Profit factor', value: isFinite(s.profitFactor) ? s.profitFactor.toFixed(2) : '∞', sub: 'profit ÷ loss', tone: s.profitFactor >= 1 ? 'pos' : 'neg' },
    { icon: Percent, label: 'Expectancy', value: `$${s.expectancy.toFixed(2)}`, sub: 'per trade', tone: s.expectancy >= 0 ? 'pos' : 'neg' },
    { icon: Flame, label: 'Max win streak', value: `${s.maxWinStreak}`, sub: `current: ${s.currentStreak > 0 ? '+' : ''}${s.currentStreak}`, tone: 'neutral' },
    { icon: CalendarDays, label: 'Avg / day', value: `${s.avgPerDay.toFixed(1)}`, sub: 'trades per day', tone: 'neutral' },
    { icon: Activity, label: 'Avg win', value: `$${s.avgWin.toFixed(2)}`, sub: `avg loss $${s.avgLoss.toFixed(2)}`, tone: 'pos' },
    // NEW — risk & depth metrics
    { icon: ShieldAlert, label: 'Max drawdown', value: `-$${s.maxDrawdown.toFixed(2)}`, sub: `current: -$${s.currentDrawdown.toFixed(2)}`, tone: 'neg' },
    { icon: Skull, label: 'Max loss streak', value: `${s.maxLossStreak}`, sub: 'consecutive SL', tone: 'neg' },
    { icon: Crown, label: 'Largest win', value: `+$${s.largestWin.toFixed(2)}`, sub: 'best single trade', tone: 'pos' },
    { icon: TrendingDown, label: 'Largest loss', value: `-$${s.largestLoss.toFixed(2)}`, sub: 'worst single trade', tone: 'neg' },
    { icon: Zap, label: 'Avg R multiple', value: s.avgRMultiple !== null ? `${s.avgRMultiple > 0 ? '+' : ''}${s.avgRMultiple.toFixed(2)}R` : '—', sub: `${rDist.total} w/ planned risk`, tone: (s.avgRMultiple ?? 0) >= 0 ? 'pos' : 'neg' },
    { icon: Target, label: 'Pay-off ratio', value: isFinite(s.payOffRatio) ? s.payOffRatio.toFixed(2) : '∞', sub: 'avg win ÷ avg loss', tone: 'neutral' },
  ]

  const toneColor = (tone: string) =>
    tone === 'pos'
      ? 'text-green-500'
      : tone === 'neg'
      ? 'text-red-500'
      : 'text-primary'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <Badge variant="outline" className="mb-2 border-primary/40 text-primary">
          <BarChart3 className="mr-1.5 h-3 w-3" />
          All-Portfolio Summary
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate performance across every logged trade — totals, win/loss,
          profit &amp; loss amounts, instrument/strategy/time breakdowns and risk
          metrics.
        </p>
      </div>

      {/* Empty state */}
      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 py-20 text-center">
          <Activity className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No trades yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add trades in the Portfolio view to see your analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards grid */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {stats.map((st, i) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i % 6) * 0.03 }}
              >
                <Card className="border-border/60">
                  <CardContent className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <st.icon className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium uppercase tracking-wide">
                        {st.label}
                      </span>
                    </div>
                    <div
                      className={
                        'mt-1.5 text-xl font-bold sm:text-2xl ' + toneColor(st.tone)
                      }
                    >
                      {st.value}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {st.sub}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Equity curve full width */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Cumulative Equity Curve</CardTitle>
                <CardDescription>
                  Running net P&amp;L across all {s.total} trades, in chronological order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={curve} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="index" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'trade #', position: 'insideBottom', offset: -2, style: { fill: 'var(--muted-foreground)', fontSize: 10 } }} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cumulative']} labelFormatter={(l) => `Trade #${l}`} />
                      <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="cum" name="Cumulative $" stroke="var(--gold)" strokeWidth={2.5} fill="url(#eqFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Donut + Daily P&L */}
          <div className="mb-6 grid gap-6 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Outcome Distribution</CardTitle>
                  <CardDescription>Win / break-even / loss split</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-5">
                    {/* Donut on the left with centered win-rate */}
                    <div className="relative h-44 w-44 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={outcomeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={72}
                            paddingAngle={3}
                            stroke="var(--card)"
                            strokeWidth={2}
                          >
                            {outcomeData.map((d, i) => (
                              <Cell key={i} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {s.winRate.toFixed(0)}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Win rate
                        </span>
                      </div>
                    </div>

                    {/* Legend on the right */}
                    <div className="flex-1 space-y-2.5">
                      {outcomeData.map((d) => {
                        const pct =
                          s.wins + s.losses + s.breakeven > 0
                            ? ((d.value / (s.wins + s.losses + s.breakeven)) * 100).toFixed(0)
                            : '0'
                        return (
                          <div key={d.name} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <span className="text-xs font-medium text-muted-foreground">
                                {d.name.split(' ')[0]}
                              </span>
                            </span>
                            <span className="flex items-baseline gap-1.5">
                              <span className="font-mono text-sm font-bold text-foreground">
                                {d.value}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{pct}%</span>
                            </span>
                          </div>
                        )
                      })}
                      {/* Win-rate progress bar — theme-aware (uses --primary) */}
                      <div className="pt-2">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Win rate</span>
                          <span className="font-mono font-semibold text-primary">
                            {s.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={s.winRate} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="h-full border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Net P&amp;L</CardTitle>
                  <CardDescription>
                    Net $ per trading day. Best:{' '}
                    <span className="text-green-500">
                      {s.bestDay ? `${fmtMoney(s.bestDay.net)} on ${s.bestDay.date}` : '—'}
                    </span>{' '}
                    · Worst:{' '}
                    <span className="text-red-500">
                      {s.worstDay ? `${fmtMoney(s.worstDay.net)} on ${s.worstDay.date}` : '—'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={daily} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={44} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Net']} />
                        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                        <Bar dataKey="net" radius={[6, 6, 0, 0]} maxBarSize={42}>
                          {daily.map((d, i) => (
                            <Cell key={i} fill={d.net >= 0 ? 'var(--chart-2)' : 'var(--chart-3)'} />
                          ))}
                          <LabelList dataKey="net" content={<BarValueLabel />} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Side breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Performance by Side</CardTitle>
                <CardDescription>
                  Wins vs losses split by BUY and SELL.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sideData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                        <Bar dataKey="wins" name="Wins" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="losses" name="Losses" stackId="a" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'BUY',
                        count: s.buyCount,
                        winRate: s.buyWinRate,
                        accent: 'text-green-500',
                      },
                      {
                        label: 'SELL',
                        count: s.sellCount,
                        winRate: s.sellWinRate,
                        accent: 'text-red-500',
                      },
                    ].map((sd) => (
                      <div
                        key={sd.label}
                        className="rounded-lg border border-border/50 bg-background/40 p-4"
                      >
                        <div className={'text-sm font-bold ' + sd.accent}>
                          {sd.label}
                        </div>
                        <div className="mt-2 text-2xl font-bold">
                          {sd.count}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            trades
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-muted-foreground">Win rate: </span>
                          <span className="font-semibold text-primary">
                            {sd.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="col-span-2 rounded-lg border border-border/50 bg-background/40 p-4">
                      <div className="text-xs text-muted-foreground">
                        Insight
                      </div>
                      <p className="mt-1 text-sm">
                        {s.buyWinRate > s.sellWinRate
                          ? 'BUY trades are performing better — your long-side reads are sharper right now.'
                          : s.sellWinRate > s.buyWinRate
                          ? 'SELL trades are performing better — short-side discipline is paying off.'
                          : 'Both sides are balanced — no directional edge between BUY and SELL.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* NEW — Instrument breakdown */}
          <div className="mb-6">
            <InstrumentBreakdownCard rows={instrumentRows} totalNet={s.net} />
          </div>

          {/* NEW — Strategy breakdown */}
          <div className="mb-6">
            <StrategyBreakdownCard rows={strategyRows} />
          </div>

          {/* NEW — Time analysis (hour + day of week) */}
          <div className="mb-6">
            <TimeAnalysisCard hours={hourRows} dows={dowRows} />
          </div>

          {/* NEW — Monthly performance */}
          <div className="mb-6">
            <MonthlyPerformanceCard months={monthRows} />
          </div>

          {/* NEW — Risk & drawdown metrics */}
          <RiskMetricsCard
            curve={curve}
            rBuckets={rDist.buckets}
            rTotal={rDist.total}
            rAvg={rDist.avg}
            rBest={rDist.best}
            rWorst={rDist.worst}
            maxDrawdown={s.maxDrawdown}
            currentDrawdown={s.currentDrawdown}
            maxLossStreak={s.maxLossStreak}
            recoveryFactor={s.recoveryFactor}
            sharpeLike={s.sharpeLike}
          />
        </>
      )}
    </section>
  )
}
