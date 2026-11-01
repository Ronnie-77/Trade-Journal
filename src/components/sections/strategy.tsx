'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ListChecks,
  AlertTriangle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  backtestStats,
  longRules,
  shortRules,
  riskRules,
} from '@/lib/xauusd-data'

export function StrategySection() {
  return (
    <section id="strategy" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
          <Target className="mr-1.5 h-3 w-3" />
          The Strategy
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Golden Scalper M5 — Pullback-in-Trend
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The core idea: trade <span className="font-semibold text-foreground">with</span> the
          higher-timeframe trend, but enter only on <span className="font-semibold text-foreground">deep, RSI-confirmed pullbacks</span> on M5,
          exclusively inside the London → NY window. This filters out noise and
          revenge candles, which is where most M5 scalpers bleed.
        </p>
      </div>

      {/* Backtest stat cards */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {backtestStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Card className="border-border/60">
              <CardContent className="px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {s.sub}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Win-rate disclaimer */}
      <Card className="mb-10 border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 px-4 py-4 sm:px-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              About the 84% win rate
            </p>
            <p className="mt-1 text-muted-foreground">
              The figure reflects a rules-based backtest on M5 XAUUSD (OANDA feed,
              2015–2024) with session + news filters active. Live results will differ
              due to slippage, spread widening around news, and execution latency.
              Win rate alone is meaningless without the{' '}
              <span className="font-medium text-foreground">1.8 : 1 reward/risk</span> —
              the system stays profitable even at a 70% win rate.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rules tabs */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Entry & Exit Rules</CardTitle>
          </div>
          <CardDescription>
            Follow the steps in order. Skipping any filter invalidates the setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="long">
            <TabsList className="mb-6">
              <TabsTrigger value="long" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Long Setup
              </TabsTrigger>
              <TabsTrigger value="short" className="gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" />
                Short Setup
              </TabsTrigger>
            </TabsList>

            {(['long', 'short'] as const).map((side) => {
              const rules = side === 'long' ? longRules : shortRules
              const accent =
                side === 'long'
                  ? 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/30'
                  : 'text-rose-500 bg-rose-500/10 ring-rose-500/30'
              return (
                <TabsContent key={side} value={side} className="m-0">
                  <ol className="space-y-3">
                    {rules.map((r) => (
                      <li
                        key={r.step}
                        className="flex gap-4 rounded-lg border border-border/50 bg-background/40 p-4"
                      >
                        <div
                          className={
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ring-1 ' +
                            accent
                          }
                        >
                          {r.step}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {r.title}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {r.detail}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Risk rules */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Risk Management</CardTitle>
            </div>
            <CardDescription>
              These are non-negotiable. The strategy survives because of these, not the entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskRules.map((r) => (
              <div
                key={r.title}
                className="rounded-lg border border-border/50 bg-background/40 p-3"
              >
                <div className="text-sm font-medium text-foreground">{r.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Indicators Used</CardTitle>
            <CardDescription>
              The full toolkit. All of these are plotted by the Pine Script below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: 'EMA 20 (M5)', use: 'Pullback zone + dynamic trail' },
              { name: 'EMA 50 / EMA 200 (M5)', use: 'Trend structure on chart TF' },
              { name: 'EMA 50 / EMA 200 (H1)', use: 'Higher-timeframe bias filter' },
              { name: 'RSI 14 (M5)', use: 'Pullback depth confirmation' },
              { name: 'ATR 14 (M5)', use: 'Volatility-normalized stop loss' },
              { name: 'Session window', use: 'Restrict entries to London + NY' },
              { name: 'Candle patterns', use: 'Engulfing / hammer / star trigger' },
              { name: 'VWAP (session)', use: 'Take-profit target 2' },
            ].map((i) => (
              <div
                key={i.name}
                className="flex items-center justify-between rounded-md border border-border/50 bg-background/40 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs font-medium text-primary">
                  {i.name}
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  {i.use}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
