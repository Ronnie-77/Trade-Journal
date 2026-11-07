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
import { Clock, CalendarDays, Sunrise, Sun, Moon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type HourPoint,
  type DayOfWeekPoint,
  fmtMoney,
  fmtMoneyCompact,
} from '@/lib/trade-stats'

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
}

interface Props {
  hours: HourPoint[]
  dows: DayOfWeekPoint[]
}

function NetLabel(props: {
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
      fontSize={9}
      fontWeight={600}
      textAnchor="middle"
    >
      {fmtMoneyCompact(value)}
    </text>
  )
}

/** Hour bucket label with a session icon (Asia / London / NY overlap). */
function sessionIcon(h: number) {
  // Rough FX session map (UTC local-ish). Just for visual variety.
  if (h >= 0 && h < 6) return { icon: Moon, label: 'Asia' }
  if (h >= 6 && h < 12) return { icon: Sunrise, label: 'London' }
  if (h >= 12 && h < 17) return { icon: Sun, label: 'NY' }
  return { icon: Moon, label: 'Late' }
}

export function TimeAnalysisCard({ hours, dows }: Props) {
  // Only show hours that have at least one trade
  const activeHours = hours.filter((h) => h.trades > 0)
  const activeDows = dows.filter((d) => d.trades > 0)

  const bestHour = activeHours.length > 0
    ? [...activeHours].sort((a, b) => b.net - a.net)[0]
    : null
  const worstHour = activeHours.length > 0
    ? [...activeHours].sort((a, b) => a.net - b.net)[0]
    : null
  const bestDow = activeDows.length > 0
    ? [...activeDows].sort((a, b) => b.net - a.net)[0]
    : null
  const worstDow = activeDows.length > 0
    ? [...activeDows].sort((a, b) => a.net - b.net)[0]
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
            <Clock className="h-4 w-4 text-primary" />
            Time Analysis
          </CardTitle>
          <CardDescription>
            When do you trade best? Net P&amp;L grouped by hour of day and day of
            week to surface your edge windows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hour-of-day */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  By hour of day
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {activeHours.length} active hours
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeHours}
                    margin={{ top: 18, right: 4, left: 0, bottom: 0 }}
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
                        `${fmtMoney(v)} · ${p?.payload?.trades ?? 0} trades · ${
                          (p?.payload?.winRate ?? 0).toFixed(0)
                        }% WR`,
                        'Net',
                      ]}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                    />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {activeHours.map((h, i) => (
                        <Cell
                          key={i}
                          fill={h.net >= 0 ? 'var(--chart-2)' : 'var(--chart-3)'}
                        />
                      ))}
                      <LabelList dataKey="net" content={<NetLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {bestHour && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    Best:{' '}
                    <span className="font-semibold text-emerald-500">
                      {bestHour.label}:00 · {fmtMoney(bestHour.net)}
                    </span>
                  </span>
                  {worstHour && worstHour.hour !== bestHour.hour && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      Worst:{' '}
                      <span className="font-semibold text-rose-500">
                        {worstHour.label}:00 · {fmtMoney(worstHour.net)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Day-of-week */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  By day of week
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {activeDows.length} active days
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeDows}
                    margin={{ top: 18, right: 4, left: 0, bottom: 0 }}
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
                        `${fmtMoney(v)} · ${p?.payload?.trades ?? 0} trades · ${
                          (p?.payload?.winRate ?? 0).toFixed(0)
                        }% WR`,
                        'Net',
                      ]}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                    />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={42}>
                      {activeDows.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.net >= 0 ? 'var(--chart-2)' : 'var(--chart-3)'}
                        />
                      ))}
                      <LabelList dataKey="net" content={<NetLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {bestDow && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    Best:{' '}
                    <span className="font-semibold text-emerald-500">
                      {bestDow.label} · {fmtMoney(bestDow.net)}
                    </span>
                  </span>
                  {worstDow && worstDow.dow !== bestDow.dow && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      Worst:{' '}
                      <span className="font-semibold text-rose-500">
                        {worstDow.label} · {fmtMoney(worstDow.net)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
