'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { type Trade } from '@/lib/trade-types'
import { fmtMoney } from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface DayCell {
  date: string
  net: number
  trades: number
  day: number
  month: number
  year: number
  weekday: number
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarHeatmap({ trades }: { trades: Trade[] }) {
  // Aggregate trades by day
  const dayMap = React.useMemo(() => {
    const map = new Map<string, { net: number; trades: number }>()
    for (const t of trades) {
      const d = new Date(t.tradeAt)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      const cur = map.get(key) ?? { net: 0, trades: 0 }
      cur.net += t.amount
      cur.trades++
      map.set(key, cur)
    }
    return map
  }, [trades])

  // Build calendar grid for last ~6 months
  const cells = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 180) // ~6 months

    // Adjust to start on a Sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1)
    }

    const arr: DayCell[] = []
    const cur = new Date(startDate)
    while (cur <= today) {
      const key = `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, '0')}-${cur.getDate().toString().padStart(2, '0')}`
      const data = dayMap.get(key)
      arr.push({
        date: key,
        net: data?.net ?? 0,
        trades: data?.trades ?? 0,
        day: cur.getDate(),
        month: cur.getMonth(),
        year: cur.getFullYear(),
        weekday: cur.getDay(),
      })
      cur.setDate(cur.getDate() + 1)
    }
    return arr
  }, [dayMap])

  // Group into weeks (columns of 7)
  const weeks = React.useMemo(() => {
    const w: DayCell[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7))
    }
    return w
  }, [cells])

  // Find max abs net for color scaling
  const maxAbs = React.useMemo(() => {
    let max = 0
    for (const c of cells) {
      if (Math.abs(c.net) > max) max = Math.abs(c.net)
    }
    return Math.max(max, 1)
  }, [cells])

  // Stats
  const greenDays = cells.filter((c) => c.net > 0).length
  const redDays = cells.filter((c) => c.net < 0).length
  const totalNet = cells.reduce((s, c) => s + c.net, 0)

  function getColor(net: number, trades: number) {
    if (trades === 0) return 'bg-muted/30'
    const intensity = Math.min(1, Math.abs(net) / maxAbs)
    if (net > 0) {
      if (intensity > 0.66) return 'bg-emerald-500'
      if (intensity > 0.33) return 'bg-emerald-500/70'
      return 'bg-emerald-500/40'
    }
    if (net < 0) {
      if (intensity > 0.66) return 'bg-rose-500'
      if (intensity > 0.33) return 'bg-rose-500/70'
      return 'bg-rose-500/40'
    }
    return 'bg-muted/40'
  }

  // Month labels
  const monthLabels = React.useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, col) => {
      const firstDay = week[0]
      if (firstDay && firstDay.month !== lastMonth) {
        labels.push({ label: MONTH_LABELS[firstDay.month], col })
        lastMonth = firstDay.month
      }
    })
    return labels
  }, [weeks])

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
            <CalendarDays className="h-4 w-4 text-primary" />
            Trade Calendar
          </CardTitle>
          <CardDescription>
            Last 6 months · {greenDays} green · {redDays} red · Total{' '}
            <span className={totalNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
              {fmtMoney(totalNet)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Calendar grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
              {/* Month labels row */}
              <div className="flex gap-[3px] pl-8">
                {weeks.map((_, col) => {
                  const label = monthLabels.find((m) => m.col === col)
                  return (
                    <div
                      key={col}
                      className="w-[14px] text-[9px] text-muted-foreground text-center"
                    >
                      {label ? label.label : ''}
                    </div>
                  )
                })}
              </div>

              {/* Weeks + weekday labels */}
              <div className="flex gap-[3px]">
                {/* Weekday labels */}
                <div className="flex flex-col gap-[3px]">
                  {WEEKDAY_LABELS.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-[14px] text-[9px] text-muted-foreground flex items-center',
                        i % 2 === 0 ? 'opacity-70' : 'opacity-0'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                {weeks.map((week, col) => (
                  <div key={col} className="flex flex-col gap-[3px]">
                    {week.map((cell) => (
                      <div
                        key={cell.date}
                        className={cn(
                          'h-[14px] w-[14px] rounded-[2px] transition-all hover:scale-125 hover:z-10 hover:ring-1 hover:ring-border cursor-pointer',
                          getColor(cell.net, cell.trades)
                        )}
                        title={`${cell.date}: ${cell.trades} trades, ${fmtMoney(cell.net)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] bg-rose-500/40" />
              Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] bg-muted/30" />
              No trades
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] bg-emerald-500/40" />
              Profit
            </span>
            <span className="ml-auto flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {greenDays} days
              <TrendingDown className="h-3 w-3 text-rose-500 ml-2" />
              {redDays} days
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
