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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import {
  Trophy,
  Activity,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Scale,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  liveSummary,
  dailyResults,
  comparison,
  gapReasons,
  improvements,
} from '@/lib/live-results'

const tooltipStyle = {
  backgroundColor: 'rgba(248, 248, 250, 0.97)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: '0.5rem',
  color: '#18181b',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}

const impactColor: Record<string, string> = {
  high: 'text-red-500 bg-red-500/10 ring-red-500/30',
  medium: 'text-amber-500 bg-amber-500/10 ring-amber-500/30',
  low: 'text-muted-foreground bg-muted ring-border',
}

const outcomeData = [
  { name: 'Wins', value: liveSummary.wins, color: 'var(--chart-2)' },
  { name: 'Break-even', value: liveSummary.breakeven, color: 'var(--muted-foreground)' },
  { name: 'Losses', value: liveSummary.losses, color: 'var(--chart-3)' },
]

export function LiveResultsSection() {
  return (
    <section
      id="live-results"
      className="border-y border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
            <Trophy className="mr-1.5 h-3 w-3" />
            Your Live Results · Oct 20–30
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            97 Trades, 9 Days — What Actually Happened
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You reported <span className="font-semibold text-foreground">69 wins</span>,{' '}
            <span className="font-semibold text-foreground">2 break-even</span>, and{' '}
            <span className="font-semibold text-foreground">26 losses</span>. That&apos;s a{' '}
            <span className="font-semibold text-primary">72.6% win rate</span> (BE excluded) —
            below the 84% backtest, but with RR 1:1.8 the account is still{' '}
            <span className="font-semibold text-green-500">deeply profitable</span>.
          </p>
        </div>

        {/* Top stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { icon: Trophy, label: 'Win Rate', value: `${liveSummary.winRateExclBE}%`, sub: 'BE excluded', tone: 'primary' },
            { icon: Scale, label: 'Profit Factor', value: `${liveSummary.profitFactor}`, sub: 'gross P / gross L', tone: 'pos' },
            { icon: Activity, label: 'Net Result', value: `+${liveSummary.netR}R`, sub: 'over 9 days', tone: 'pos' },
            { icon: Gauge, label: 'Expectancy', value: `${liveSummary.expectancyR}R`, sub: 'per trade', tone: 'pos' },
            { icon: TrendingUp, label: 'Trades/Day', value: `${liveSummary.avgTradesPerDay}`, sub: 'cap is 5', tone: 'neg' },
            { icon: AlertTriangle, label: 'Losses', value: `${liveSummary.losses}`, sub: `${liveSummary.lossRate}% of total`, tone: 'neg' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className="border-border/60">
                <CardContent className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <s.icon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium uppercase tracking-wide">
                      {s.label}
                    </span>
                  </div>
                  <div
                    className={
                      'mt-1.5 text-xl font-bold sm:text-2xl ' +
                      (s.tone === 'pos'
                        ? 'text-green-500'
                        : s.tone === 'neg'
                        ? 'text-red-500'
                        : 'text-primary')
                    }
                  >
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Donut + Equity curve */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          {/* Outcome donut */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Outcome Breakdown</CardTitle>
                <CardDescription>
                  97 trades total · BE excluded from win-rate calc
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={2}
                        stroke="var(--background)"
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
                    <span className="text-3xl font-bold text-primary">
                      {liveSummary.winRateExclBE}%
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Win rate
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {outcomeData.map((d) => (
                    <div
                      key={d.name}
                      className="rounded-md border border-border/50 bg-background/40 px-2 py-2"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {d.name}
                        </span>
                      </div>
                      <div className="mt-1 text-lg font-bold">{d.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Equity curve */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="h-full border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Cumulative R-Curve</CardTitle>
                <CardDescription>
                  Modeled daily distribution summing exactly to your reported
                  totals. Win = +1.8R · BE = 0R · Loss = -1R.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyResults} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}R`, 'Cumulative']} />
                      <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                      <Area
                        type="monotone"
                        dataKey="cumR"
                        name="Cumulative R"
                        stroke="var(--gold)"
                        strokeWidth={2.5}
                        fill="url(#equityFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-md border border-border/50 bg-background/40 px-2 py-1.5">
                    <div className="text-muted-foreground">Best day</div>
                    <div className="mt-0.5 font-bold text-green-500">+14.2R · Oct 30</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background/40 px-2 py-1.5">
                    <div className="text-muted-foreground">Worst day</div>
                    <div className="mt-0.5 font-bold text-amber-500">+7.8R · Oct 24</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background/40 px-2 py-1.5">
                    <div className="text-muted-foreground">Total</div>
                    <div className="mt-0.5 font-bold text-primary">+{liveSummary.netR}R</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Backtest vs Actual comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-8 border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Backtest vs Your Live Results</CardTitle>
              <CardDescription>
                Lower win rate, but higher profit factor — because you let winners
                run (1.8R) while cutting losses (1R). The system is working.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparison}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="metric" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                    <Bar dataKey="backtest" name="Backtest (10y)" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} opacity={0.55} />
                    <Bar dataKey="actual" name="Your live (Oct)" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                {comparison.map((c) => {
                  const diff = c.actual - c.backtest
                  const better = c.metric === 'Trades / day' ? diff < 0 : diff > 0
                  return (
                    <div
                      key={c.metric}
                      className="rounded-md border border-border/50 bg-background/40 px-3 py-2"
                    >
                      <div className="text-muted-foreground">{c.metric}</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="font-bold text-foreground">
                          {c.actual}
                          {c.unit}
                        </span>
                        <span className="text-muted-foreground">
                          vs {c.backtest}
                          {c.unit}
                        </span>
                      </div>
                      <div
                        className={
                          'mt-0.5 text-[11px] font-medium ' +
                          (better ? 'text-green-500' : 'text-red-500')
                        }
                      >
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}
                        {c.unit} {better ? 'better' : 'worse'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gap analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Why 72% Instead of 84%?</CardTitle>
              </div>
              <CardDescription>
                The 12-point gap is almost entirely explained below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gapReasons.map((g) => (
                <div
                  key={g.title}
                  className="rounded-lg border border-border/50 bg-background/40 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{g.title}</span>
                    <span
                      className={
                        'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ' +
                        impactColor[g.impact]
                      }
                    >
                      {g.impact}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{g.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">How to Push Back to 84%+</CardTitle>
              </div>
              <CardDescription>
                Apply these and re-measure for the next 9-day window.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {improvements.map((im, i) => (
                <div
                  key={im.title}
                  className="flex gap-3 rounded-lg border border-border/50 bg-background/40 p-3"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary ring-1 ring-primary/30">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{im.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{im.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom-line verdict */}
        <Card className="mt-6 border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-start gap-3 px-4 py-4 sm:px-6">
            <Trophy className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <div className="text-sm">
              <p className="font-semibold text-green-500 dark:text-emerald-400">
                Bottom line: profitable despite the gap
              </p>
              <p className="mt-1 text-muted-foreground">
                Even at 72.6% win rate, your profit factor of{' '}
                <span className="font-medium text-foreground">{liveSummary.profitFactor}</span>{' '}
                and expectancy of{' '}
                <span className="font-medium text-foreground">
                  {liveSummary.expectancyR}R/trade
                </span>{' '}
                are <span className="font-medium text-foreground">better than the backtest</span>.
                That means your loss-cutting discipline is solid. Fix the overtrading
                and the win rate climbs back toward 84% while profit factor stays high.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
