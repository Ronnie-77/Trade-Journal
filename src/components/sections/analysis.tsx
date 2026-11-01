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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from 'recharts'
import { BarChart3, Clock4, CalendarRange, Gauge } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  yearlyStats,
  sessionStats,
  monthlyReturns,
} from '@/lib/xauusd-data'

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
}

export function AnalysisSection() {
  return (
    <section
      id="analysis"
      className="border-y border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
            <BarChart3 className="mr-1.5 h-3 w-3" />
            10-Year Behavioral Study
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            What 10 Years of XAUUSD Tells Us
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gold moved from <span className="font-semibold text-foreground">$1,184 (2015)</span> to{' '}
            <span className="font-semibold text-foreground">$2,624 (2024)</span> — a{' '}
            <span className="font-semibold text-green-500">+121%</span> move.
            But the real edge lives in <em>how</em> it moves, not where it ends.
          </p>
        </div>

        {/* Key observations */}
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: 'Volatility clusters',
              detail:
                '2020 + 2024 were outlier volatility years (avg daily range $34–38). Ranging setups fail here; trend-following shines.',
            },
            {
              icon: Clock4,
              title: 'Session matters most',
              detail:
                'The London→NY overlap (13:00–15:00) produces ~3× the range of the Asian session. Most tradable edge lives here.',
            },
            {
              icon: CalendarRange,
              title: 'Seasonality is real',
              detail:
                'July averages +2.1% (positive 8 of 10 years). September averages −0.6% — the worst month for longs.',
            },
          ].map((o) => (
            <Card key={o.title} className="border-border/60">
              <CardHeader>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                  <o.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="mt-2 text-base">{o.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {o.detail}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Yearly price + range chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Yearly Close & Average Daily Range</CardTitle>
              <CardDescription>
                Gold price (left axis, USD) overlaid with average daily range
                (right axis, USD). Note volatility expansion in 2020 & 2024.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="price" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="range" orientation="right" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      name="Close (USD)"
                      stroke="var(--gold)"
                      strokeWidth={2}
                      fill="url(#goldPrice)"
                    />
                    <Bar
                      yAxisId="range"
                      dataKey="avgDailyRange"
                      name="Avg Daily Range"
                      fill="var(--chart-3)"
                      opacity={0.55}
                      radius={[3, 3, 0, 0]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session + volatility radar / monthly */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Session Profile (M5)</CardTitle>
                <CardDescription>
                  Range, trendiness and reversal rate per session. The overlap
                  is where momentum + follow-through are highest.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={sessionStats} outerRadius="75%">
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="session" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                      <Radar name="Trendiness" dataKey="trendiness" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.4} />
                      <Radar name="Reversal rate" dataKey="reversalRate" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.25} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {sessionStats.map((s) => (
                    <div
                      key={s.session}
                      className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-medium">{s.session}</span>
                        <span className="ml-2 text-muted-foreground">{s.window}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-muted-foreground">
                          range {s.avgRangePips}¢
                        </span>
                        <span className="text-primary">{s.trendiness}% trend</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="h-full border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Seasonality (avg %)</CardTitle>
                <CardDescription>
                  Average monthly return over 10 years. Green = positive,
                  red = negative. July is the standout month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReturns} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                      <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                        {monthlyReturns.map((m, i) => (
                          <Cell
                            key={i}
                            fill={m.avg >= 0 ? 'var(--chart-2)' : 'var(--chart-3)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:grid-cols-4">
                  {monthlyReturns.map((m) => (
                    <div
                      key={m.month}
                      className="rounded-md border border-border/50 bg-background/50 px-2 py-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.month}</span>
                        <span
                          className={
                            'font-mono ' +
                            (m.avg >= 0 ? 'text-green-500' : 'text-red-500')
                          }
                        >
                          {m.avg >= 0 ? '+' : ''}
                          {m.avg}%
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {m.winYears}/10 win
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
