'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { CandlestickChart, Maximize2 } from 'lucide-react'
import { TradingViewChart } from '@/components/tradingview-chart'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export function ChartSection() {
  const [interval, setInterval] = React.useState('5')

  return (
    <section id="chart" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
            <CandlestickChart className="mr-1.5 h-3 w-3" />
            Live · TradingView
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            XAUUSD — OANDA Spot Gold
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Embedded TradingView advanced chart. Switch the interval below to
            inspect the 5-minute structure the strategy is built for.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={interval} onValueChange={setInterval}>
            <TabsList>
              <TabsTrigger value="5">M5</TabsTrigger>
              <TabsTrigger value="15">M15</TabsTrigger>
              <TabsTrigger value="60">H1</TabsTrigger>
              <TabsTrigger value="D">1D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl border border-border/60 bg-card p-2 shadow-sm sm:p-3"
      >
        <TradingViewChart
          symbol="OANDA:XAUUSD"
          interval={interval}
          height={560}
        />
        <div className="pointer-events-none absolute right-4 top-4 hidden items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur sm:flex">
          <Maximize2 className="h-3 w-3" />
          drag / zoom supported
        </div>
      </motion.div>
    </section>
  )
}
