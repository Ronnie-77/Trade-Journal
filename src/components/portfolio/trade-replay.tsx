'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipForward, SkipBack, ChevronRight, X, RotateCcw,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { type Trade } from '@/lib/trade-types'
import { fmtMoney } from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface Props {
  trades: Trade[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TradeReplay({ trades, open, onOpenChange }: Props) {
  // Sort trades chronologically
  const sortedTrades = React.useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.tradeAt).getTime() - new Date(b.tradeAt).getTime()
    )
  }, [trades])

  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [cumulative, setCumulative] = React.useState(0)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when opened
  React.useEffect(() => {
    if (open) {
      setCurrentIdx(0)
      setCumulative(0)
      setPlaying(false)
    }
  }, [open])

  // Auto-play
  React.useEffect(() => {
    if (!playing || !open) return

    if (currentIdx >= sortedTrades.length - 1) {
      setPlaying(false)
      return
    }

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= sortedTrades.length - 1) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing, open, sortedTrades.length])

  // Update cumulative when index changes
  React.useEffect(() => {
    let cum = 0
    for (let i = 0; i <= currentIdx && i < sortedTrades.length; i++) {
      cum += sortedTrades[i].amount
    }
    setCumulative(cum)
  }, [currentIdx, sortedTrades])

  const currentTrade = sortedTrades[currentIdx]
  const total = sortedTrades.length
  const progress = total > 0 ? ((currentIdx + 1) / total) * 100 : 0

  const handleNext = () => {
    if (currentIdx < total - 1) setCurrentIdx((p) => p + 1)
  }
  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((p) => p - 1)
  }
  const handleReset = () => {
    setCurrentIdx(0)
    setCumulative(0)
    setPlaying(false)
  }

  if (total === 0) return null

  function fmtDate(iso: string): string {
    const d = new Date(iso)
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const sideColor = currentTrade?.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'
  const resultBg =
    currentTrade?.result === 'TP' ? 'bg-emerald-500 text-white' :
    currentTrade?.result === 'SL' ? 'bg-rose-500 text-white' :
    'bg-muted-foreground text-white'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Trade Replay
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Trade {currentIdx + 1} of {total}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current trade card */}
        <div className="px-5 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentTrade && (
                <div className="space-y-3">
                  {/* Trade header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold">{currentTrade.instrument}</span>
                      <span className={cn('text-sm font-semibold', sideColor)}>{currentTrade.side}</span>
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', resultBg)}>
                        {currentTrade.result}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground num">{fmtDate(currentTrade.tradeAt)}</span>
                  </div>

                  {/* P&L */}
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                    <span className="text-xs text-muted-foreground">This trade</span>
                    <span
                      className={cn(
                        'font-mono text-xl font-bold',
                        currentTrade.amount > 0 ? 'text-emerald-500' :
                        currentTrade.amount < 0 ? 'text-rose-500' : 'text-muted-foreground'
                      )}
                    >
                      {fmtMoney(currentTrade.amount)}
                    </span>
                  </div>

                  {/* Cumulative */}
                  <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Cumulative P&L</span>
                    <span
                      className={cn(
                        'font-mono text-xl font-bold',
                        cumulative > 0 ? 'text-emerald-500' :
                        cumulative < 0 ? 'text-rose-500' : 'text-muted-foreground'
                      )}
                    >
                      {fmtMoney(cumulative)}
                    </span>
                  </div>

                  {/* Trade details */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border border-border/40 bg-muted/10 px-2 py-2">
                      <div className="text-[10px] text-muted-foreground uppercase">Lot</div>
                      <div className="text-sm font-mono">{currentTrade.lotSize ?? '—'}</div>
                    </div>
                    <div className="rounded-md border border-border/40 bg-muted/10 px-2 py-2">
                      <div className="text-[10px] text-muted-foreground uppercase">Risk</div>
                      <div className="text-sm font-mono">
                        {currentTrade.plannedRisk ? `$${currentTrade.plannedRisk}` : '—'}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/40 bg-muted/10 px-2 py-2">
                      <div className="text-[10px] text-muted-foreground uppercase">R:R</div>
                      <div className="text-sm font-mono">
                        {currentTrade.plannedRisk && currentTrade.plannedRisk > 0
                          ? `${(currentTrade.amount / currentTrade.plannedRisk).toFixed(2)}R`
                          : '—'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Strategy & comment */}
                  {(currentTrade.strategy || currentTrade.comment) && (
                    <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-2">
                      {currentTrade.strategy && (
                        <span className="text-xs text-primary font-medium">{currentTrade.strategy}</span>
                      )}
                      {currentTrade.comment && (
                        <p className="text-xs text-muted-foreground mt-1">{currentTrade.comment}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 border-t border-border/40 px-5 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={currentIdx === 0 && !playing}
            className="h-9 w-9"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={() => setPlaying((p) => !p)}
            disabled={currentIdx >= total - 1}
            className="h-10 w-10 rounded-full"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIdx >= total - 1}
            className="h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-xs text-muted-foreground">
            {playing ? 'Playing...' : 'Paused'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
