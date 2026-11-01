'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Coins, ArrowDown, ArrowUp, Activity, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border/40">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            <Coins className="mr-1.5 h-3 w-3" />
            XAUUSD · Gold Spot · 2015–2024
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            10-Year XAUUSD Analysis
            <span className="block text-gold-gradient">+ M5 Scalping Strategy</span>
          </h1>
          <p className="mt-5 text-pretty text-base text-muted-foreground sm:text-lg">
            A quantitative look at Gold&apos;s behavior across a decade, distilled into a
            high win-rate 5-minute scalping system — complete with rules, backtest
            statistics, and a copy-ready Pine Script v5 indicator.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#chart">
                <Activity className="mr-2 h-4 w-4" />
                View Live Chart
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#pine">
                Get Pine Script
              </a>
            </Button>
          </div>
        </motion.div>

        {/* quick stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: ArrowUp, label: '10-Yr Return', value: '+121%', tone: 'pos' },
            { icon: Activity, label: 'Avg Daily Range', value: '$25.6', tone: 'neutral' },
            { icon: ArrowDown, label: 'Max Drawdown', value: '-9.4%', tone: 'neg' },
            { icon: Clock, label: 'Best Session', value: 'London+NY', tone: 'neutral' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-card/60 p-4 text-left backdrop-blur"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <div
                className={
                  'mt-2 text-2xl font-bold ' +
                  (s.tone === 'pos'
                    ? 'text-green-500'
                    : s.tone === 'neg'
                    ? 'text-red-500'
                    : 'text-primary')
                }
              >
                {s.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
