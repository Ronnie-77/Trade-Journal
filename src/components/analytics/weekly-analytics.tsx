'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { CalendarRange, TrendingUp, TrendingDown } from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { type Trade } from '@/lib/trade-types'
import { fmtMoney } from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WeekRow {
  weekLabel: string
  days: number[] // 7 values, one per weekday
  total: number
  trades: number
}

export function WeeklyAnalytics({ trades }: { trades: Trade[] }) {
  // Build 10-week breakdown
  const { weeks, stats } = React.useMemo(() => {
    // Group trades by ISO week + weekday
    const weekMap = new Map<string, Map<number, { net: number; trades: number }>>()

    for (const t of trades) {
      const d = new Date(t.tradeAt)
      // ISO week number calculation
      const target = new Date(d.valueOf())
      const dayNr = (d.getDay() + 6) % 7 // 0 = Monday
      target.setDate(target.getDate() - dayNr + 3) // Thursday of this week
      const firstThursday = new Date(target.getFullYear(), 0, 4)
      const weekDiff = Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const weekNum = Math.max(1, weekDiff + 1)
      const weekKey = `${target.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
      const weekday = d.getDay() // 0=Sun

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, new Map())
      }
      const dayMap = weekMap.get(weekKey)!
      const cur = dayMap.get(weekday) ?? { net: 0, trades: 0 }
      cur.net += t.amount
      cur.trades++
      dayMap.set(weekday, cur)
    }

    // Get last 10 weeks
    const allWeeks = [...weekMap.keys()].sort().reverse().slice(0, 10).reverse()
    const weekRows: WeekRow[] = allWeeks.map((weekKey) => {
      const dayMap = weekMap.get(weekKey)!
      const days = Array(7).fill(0)
      let total = 0
      let tradeCount = 0
      for (let i = 0; i < 7; i++) {
        const data = dayMap.get(i)
        if (data) {
          days[i] = data.net
          total += data.net
          tradeCount += data.trades
        }
      }
      return { weekLabel: weekKey, days, total, trades: tradeCount }
    })

    // Overall stats
    let totalNet = 0
    let greenWeeks = 0
    let redWeeks = 0
    let totalTrades = 0
    for (const w of weekRows) {
      totalNet += w.total
      totalTrades += w.trades
      if (w.total > 0) greenWeeks++
      else if (w.total < 0) redWeeks++
    }
    const avgPerWeek = weekRows.length > 0 ? totalNet / weekRows.length : 0

    return {
      weeks: weekRows,
      stats: { totalNet, greenWeeks, redWeeks, totalTrades, avgPerWeek, weekCount: weekRows.length },
    }
  }, [trades])

  if (weeks.length === 0) {
    return null
  }

  function cellColor(value: number) {
    if (value === 0) return 'text-muted-foreground/30'
    return value > 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
  }

  function totalColor(value: number) {
    if (value === 0) return 'text-muted-foreground'
    return value > 0 ? 'text-emerald-500' : 'text-rose-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarRange className="h-4 w-4 text-primary" />
            Weekly Analytics
          </CardTitle>
          <CardDescription>
            Last {stats.weekCount} weeks · {stats.greenWeeks} green · {stats.redWeeks} red · Avg{' '}
            <span className={stats.avgPerWeek >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
              {fmtMoney(stats.avgPerWeek)}/wk
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats summary */}
          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total P&L</div>
              <div className={cn('mt-0.5 font-mono text-base font-bold sm:text-lg', totalColor(stats.totalNet))}>
                {fmtMoney(stats.totalNet)}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Trades</div>
              <div className="mt-0.5 font-mono text-base font-bold sm:text-lg text-foreground">
                {stats.totalTrades}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg / Week</div>
              <div className={cn('mt-0.5 font-mono text-base font-bold sm:text-lg', totalColor(stats.avgPerWeek))}>
                {fmtMoney(stats.avgPerWeek)}
              </div>
            </div>
          </div>

          {/* Weekly table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-2 pr-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">Week</th>
                  {WEEKDAY_LABELS.map((d) => (
                    <th key={d} className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs sm:px-2">{d}</th>
                  ))}
                  <th className="py-2 pl-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs sm:pl-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week.weekLabel} className="border-b border-border/20">
                    <td className="py-2 pr-2 font-mono text-[10px] text-muted-foreground sm:text-xs">{week.weekLabel}</td>
                    {week.days.map((val, i) => (
                      <td key={i} className="px-1 py-1.5 text-center sm:px-2">
                        <span className={cn('inline-block rounded px-1 py-0.5 font-mono text-[10px] sm:text-xs', cellColor(val))}>
                          {val !== 0 ? (val > 0 ? '+' : '') + val.toFixed(0) : '–'}
                        </span>
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-right sm:pl-3">
                      <span className={cn('font-mono text-[11px] font-bold sm:text-sm', totalColor(week.total))}>
                        {week.total !== 0 ? fmtMoney(week.total) : '–'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground sm:text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500/20" /> Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-rose-500/20" /> Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-muted/30" /> No trades
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
