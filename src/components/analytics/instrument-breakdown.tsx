'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
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
  type InstrumentBreakdown,
  fmtMoney,
  fmtMoneyCompact,
} from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface Props {
  rows: InstrumentBreakdown[]
  totalNet: number
}

/** Inline horizontal bar showing each instrument's contribution to total P&L.
 *  Green for positive, red for negative — sized relative to the largest abs net. */
function NetBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (Math.abs(value) / max) * 100 : 0
  const pos = value >= 0
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'absolute top-0 h-full rounded-full',
          pos ? 'left-1/2 bg-emerald-500' : 'right-1/2 bg-rose-500'
        )}
        style={{ width: `${Math.max(2, pct / 2)}%` }}
      />
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
    </div>
  )
}

export function InstrumentBreakdownCard({ rows }: Props) {
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.net)))

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
            <BarChart3 className="h-4 w-4 text-primary" />
            Performance by Instrument
          </CardTitle>
          <CardDescription>
            Win rate, net P&amp;L and profit factor per symbol — sorted by
            contribution to total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No instrument data yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead className="w-[90px]">Symbol</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">W / L</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      PF
                    </TableHead>
                    <TableHead className="hidden w-[120px] md:table-cell">
                      Contribution
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const pfLabel = isFinite(r.profitFactor)
                      ? r.profitFactor.toFixed(2)
                      : '∞'
                    const pfTone =
                      r.profitFactor >= 1
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    const netTone =
                      r.net > 0
                        ? 'text-emerald-500'
                        : r.net < 0
                        ? 'text-rose-500'
                        : 'text-muted-foreground'
                    return (
                      <TableRow key={r.symbol} className="border-border/40">
                        <TableCell className="font-mono text-xs font-bold">
                          {r.symbol}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.trades}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <span className="text-emerald-500">{r.wins}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-rose-500">{r.losses}</span>
                          {r.breakeven > 0 && (
                            <span className="text-muted-foreground">
                              {' '}
                              · {r.breakeven}BE
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.winRate.toFixed(0)}%
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-xs font-semibold',
                            netTone
                          )}
                        >
                          {fmtMoney(r.net)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'hidden text-right font-mono text-xs sm:table-cell',
                            pfTone
                          )}
                        >
                          {pfLabel}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <NetBar value={r.net} max={maxAbs} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary insight */}
          {rows.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                {rows.length} instrument{rows.length === 1 ? '' : 's'} ·
                best:{' '}
                <span className="font-semibold text-emerald-500">
                  {rows[0].symbol} ({fmtMoneyCompact(rows[0].net)})
                </span>
              </span>
              {rows.length > 1 && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  worst:{' '}
                  <span className="font-semibold text-rose-500">
                    {rows[rows.length - 1].symbol} (
                    {fmtMoneyCompact(rows[rows.length - 1].net)})
                  </span>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
