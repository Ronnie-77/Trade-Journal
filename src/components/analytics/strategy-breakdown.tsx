'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
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
  type StrategyBreakdown,
  fmtMoney,
} from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface Props {
  rows: StrategyBreakdown[]
}

export function StrategyBreakdownCard({ rows }: Props) {
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
            <Target className="h-4 w-4 text-primary" />
            Performance by Strategy
          </CardTitle>
          <CardDescription>
            Which setups make you money? Wins, losses and net P&amp;L grouped by
            the strategy tag you logged on each trade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No strategy data yet — tag your trades with a strategy to see this.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">W / L</TableHead>
                    <TableHead className="text-right">Win %</TableHead>
                    <TableHead className="text-right">Avg $</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const netTone =
                      r.net > 0
                        ? 'text-emerald-500'
                        : r.net < 0
                        ? 'text-rose-500'
                        : 'text-muted-foreground'
                    const winTone =
                      r.winRate >= 60
                        ? 'text-emerald-500'
                        : r.winRate >= 40
                        ? 'text-primary'
                        : 'text-rose-500'
                    return (
                      <TableRow key={r.strategy} className="border-border/40">
                        <TableCell className="text-xs font-medium">
                          {r.strategy}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.trades}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <span className="text-emerald-500">{r.wins}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-rose-500">{r.losses}</span>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-xs font-semibold',
                            winTone
                          )}
                        >
                          {r.winRate.toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {r.avgAmount >= 0 ? '+' : '-'}$
                          {Math.abs(r.avgAmount).toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-xs font-semibold',
                            netTone
                          )}
                        >
                          {fmtMoney(r.net)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {rows.length > 1 && (
            <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-500">
                {rows[0].strategy}
              </span>{' '}
              is your most profitable setup ·{' '}
              <span className="font-semibold text-rose-500">
                {rows[rows.length - 1].strategy}
              </span>{' '}
              needs review
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
