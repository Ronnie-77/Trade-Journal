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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ShieldAlert,
  Activity,
  Zap,
  TrendingDown,
  Waves,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type EquityPoint,
  type RMultipleBucket,
  fmtMoney,
} from '@/lib/trade-stats'

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
}

interface Props {
  curve: EquityPoint[]
  rBuckets: RMultipleBucket[]
  rTotal: number
  rAvg: number | null
  rBest: number | null
  rWorst: number | null
  maxDrawdown: number
  currentDrawdown: number
  maxLossStreak: number
  recoveryFactor: number
  sharpeLike: number
}

/** Map an R-multiple bucket midpoint to a color (red→green gradient). */
function rBucketColor(mid: number): string {
  if (mid <= -2.5) return '#dc2626' // -3R and worse — strong red
  if (mid <= -1.5) return '#f87171' // -2 to -3R — red
  if (mid <= -0.5) return '#fb923c' // -1 to -2R — orange
  if (mid <= 0.5) return '#a3a3a3' // -1 to +1R — neutral
  if (mid <= 1.5) return '#86efac' // 1 to 2R — light green
  if (mid <= 2.5) return '#22c55e' // 2 to 3R — green
  return '#15803d' // 3R+ — strong green
}

function MetricRow({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone?: 'pos' | 'neg' | 'neutral'
  hint?: string
}) {
  const toneCls =
    tone === 'pos'
      ? 'text-emerald-500'
      : tone === 'neg'
      ? 'text-rose-500'
      : 'text-foreground'
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          {hint && (
            <div className="truncate text-[10px] text-muted-foreground/80">
              {hint}
            </div>
          )}
        </div>
      </div>
      <div className={'font-mono text-sm font-bold ' + toneCls}>{value}</div>
    </div>
  )
}

export function RiskMetricsCard({
  curve,
  rBuckets,
  rTotal,
  rAvg,
  rBest,
  rWorst,
  maxDrawdown,
  currentDrawdown,
  maxLossStreak,
  recoveryFactor,
  sharpeLike,
}: Props) {
  const ddData = curve.map((c) => ({
    index: c.index,
    drawdown: -c.drawdown, // negative for the underwater chart
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Risk &amp; Drawdown
          </CardTitle>
          <CardDescription>
            Underwater equity curve, max losing streak, recovery factor and
            R-multiple distribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Underwater drawdown chart */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Waves className="h-3.5 w-3.5" />
                Underwater equity (drawdown)
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={ddData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--chart-3)"
                          stopOpacity={0.05}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-3)"
                          stopOpacity={0.45}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="index"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${Math.abs(v).toFixed(0)}`}
                      width={44}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number) => [
                        fmtMoney(v),
                        'Drawdown',
                      ]}
                      labelFormatter={(l) => `Trade #${l}`}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                    />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      name="Drawdown"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      fill="url(#ddFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Risk metric pills */}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <MetricRow
                  icon={TrendingDown}
                  label="Max drawdown"
                  value={fmtMoney(-maxDrawdown)}
                  tone="neg"
                  hint="largest peak-to-trough drop"
                />
                <MetricRow
                  icon={Activity}
                  label="Current DD"
                  value={fmtMoney(-currentDrawdown)}
                  tone={currentDrawdown > 0 ? 'neg' : 'neutral'}
                  hint="from equity peak"
                />
                <MetricRow
                  icon={ShieldAlert}
                  label="Max loss streak"
                  value={`${maxLossStreak} loss${maxLossStreak === 1 ? '' : 'es'}`}
                  tone={maxLossStreak >= 3 ? 'neg' : 'neutral'}
                  hint="consecutive SL in a row"
                />
                <MetricRow
                  icon={Zap}
                  label="Recovery factor"
                  value={isFinite(recoveryFactor)
                    ? recoveryFactor.toFixed(2)
                    : '∞'}
                  tone={recoveryFactor >= 1 ? 'pos' : 'neg'}
                  hint="net ÷ max drawdown"
                />
              </div>
            </div>

            {/* R-multiple distribution */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  R-multiple distribution
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {rTotal} trade{rTotal === 1 ? '' : 's'} with planned risk
                </span>
              </div>

              {rBuckets.length === 0 ? (
                <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-border/40 text-center text-xs text-muted-foreground">
                  Fill in &ldquo;Planned risk&rdquo; on your trades to see the
                  R-multiple distribution.
                </div>
              ) : (
                <>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rBuckets}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          stroke="var(--muted-foreground)"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={36}
                        />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          width={28}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ fill: 'var(--muted)' }}
                          formatter={(v: number) => [`${v} trades`, 'Count']}
                        />
                        <ReferenceLine
                          y={0}
                          stroke="var(--muted-foreground)"
                        />
                        <Bar
                          dataKey="count"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={36}
                        >
                          {rBuckets.map((b, i) => (
                            <Cell key={i} fill={rBucketColor(b.mid)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-border/40 bg-muted/20 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Avg R
                      </div>
                      <div
                        className={
                          'mt-0.5 font-mono text-sm font-bold ' +
                          ((rAvg ?? 0) >= 0
                            ? 'text-emerald-500'
                            : 'text-rose-500')
                        }
                      >
                        {rAvg !== null
                          ? `${rAvg > 0 ? '+' : ''}${rAvg.toFixed(2)}R`
                          : '—'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/20 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Best R
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-bold text-emerald-500">
                        {rBest !== null
                          ? `+${rBest.toFixed(2)}R`
                          : '—'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/20 px-2 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Worst R
                      </div>
                      <div className="mt-0.5 font-mono text-sm font-bold text-rose-500">
                        {rWorst !== null
                          ? `${rWorst.toFixed(2)}R`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <MetricRow
                  icon={Activity}
                  label="Sharpe-like"
                  value={sharpeLike.toFixed(2)}
                  tone={sharpeLike > 0 ? 'pos' : 'neg'}
                  hint="mean ÷ std of trade $"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
