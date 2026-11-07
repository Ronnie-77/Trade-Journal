'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarRange, TrendingUp, TrendingDown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type MonthPoint,
  fmtMoney,
  fmtMoneyCompact,
} from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
}

interface Props {
  months: MonthPoint[]
}

function MonthLabel(props: {
  x?: number
  y?: number
  width?: number
  value?: number
  height?: number
}) {
  const { x = 0, y = 0, width = 0, value } = props
  if (value == null || value === 0) return null
  const isPos = value >= 0
  return (
    <text
      x={x + width / 2}
      y={isPos ? y - 4 : y + 12}
      fill={isPos ? 'var(--chart-2)' : 'var(--chart-3)'}
      fontSize={10}
      fontWeight={600}
      textAnchor="middle"
    >
      {fmtMoneyCompact(value)}
    </text>
  )
}

export function MonthlyPerformanceCard({ months }: Props) {
  const totalNet = months.reduce((s, m) => s + m.net, 0)
  const greenMonths = months.filter((m) => m.net > 0).length
  const redMonths = months.filter((m) => m.net < 0).length
  const bestMonth = months.length > 0
    ? [...months].sort((a, b) => b.net - a.net)[0]
    : null
  const worstMonth = months.length > 0
    ? [...months].sort((a, b) => a.net - b.net)[0]
    : null

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
            <CalendarRange className="h-4 w-4 text-primary" />
            Monthly Performance
          </CardTitle>
          <CardDescription>
            Net P&amp;L per month. {greenMonths} green · {redMonths} red month
            {redMonths === 1 ? '' : 's'} · cumulative{' '}
            <span
              className={
                totalNet >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }
            >
              {fmtMoney(totalNet)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {months.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No monthly data yet.
            </p>
          ) : (
            <>
              {/* Bar chart */}
              <div className="mb-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={months}
                    margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
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
                      tickFormatter={(v) => fmtMoneyCompact(v)}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'var(--muted)' }}
                      formatter={(v: number, _n, p) => [
                        `${fmtMoney(v)} · ${
                          p?.payload?.trades ?? 0
                        } trades · ${(p?.payload?.winRate ?? 0).toFixed(0)}% WR`,
                        'Net',
                      ]}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                    />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      {months.map((m, i) => (
                        <Cell
                          key={i}
                          fill={
                            m.net >= 0 ? 'var(--chart-2)' : 'var(--chart-3)'
                          }
                        />
                      ))}
                      <LabelList dataKey="net" content={<MonthLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Trades</TableHead>
                      <TableHead className="text-right">W / L</TableHead>
                      <TableHead className="text-right">Win %</TableHead>
                      <TableHead className="text-right">Peak</TableHead>
                      <TableHead className="text-right">Trough</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...months].reverse().map((m) => (
                      <TableRow key={m.key} className="border-border/40">
                        <TableCell className="text-xs font-medium">
                          {m.label}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {m.trades}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <span className="text-emerald-500">{m.wins}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-rose-500">{m.losses}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {m.winRate.toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-500">
                          {m.peak !== 0 ? fmtMoney(m.peak) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-rose-500">
                          {m.trough !== 0 ? fmtMoney(m.trough) : '—'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-xs font-semibold',
                            m.net > 0
                              ? 'text-emerald-500'
                              : m.net < 0
                              ? 'text-rose-500'
                              : 'text-muted-foreground'
                          )}
                        >
                          {fmtMoney(m.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer insight */}
              {bestMonth && worstMonth && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">Best month:</span>
                    <span className="font-semibold text-emerald-500">
                      {bestMonth.label} ({fmtMoney(bestMonth.net)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs">
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                    <span className="text-muted-foreground">Worst month:</span>
                    <span className="font-semibold text-rose-500">
                      {worstMonth.label} ({fmtMoney(worstMonth.net)})
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
