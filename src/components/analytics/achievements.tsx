'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Target, Zap, TrendingUp, Camera, Shield, Flame,
  Award, Star, Crown, Medal, Rocket, DollarSign, Clock,
} from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { type Trade } from '@/lib/trade-types'
import { computeStats } from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  unlocked: boolean
  progress?: { current: number; target: number }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

const TIER_STYLES = {
  bronze: { color: 'text-amber-600', bg: 'from-amber-500/10 to-orange-500/10', ring: 'ring-amber-500/20', label: 'Bronze' },
  silver: { color: 'text-slate-400', bg: 'from-slate-400/10 to-slate-500/10', ring: 'ring-slate-400/20', label: 'Silver' },
  gold: { color: 'text-yellow-500', bg: 'from-yellow-400/10 to-amber-500/10', ring: 'ring-yellow-400/20', label: 'Gold' },
  platinum: { color: 'text-cyan-400', bg: 'from-cyan-400/10 to-blue-500/10', ring: 'ring-cyan-400/20', label: 'Platinum' },
}

export function Achievements({ trades }: { trades: Trade[] }) {
  const stats = computeStats(trades)

  const achievements: Achievement[] = React.useMemo(() => {
    const totalTrades = trades.length
    const wins = trades.filter((t) => t.result === 'TP').length
    const losses = trades.filter((t) => t.result === 'SL').length
    const screenshots = trades.filter((t) => t.imageUrl).length
    const withRisk = trades.filter((t) => t.plannedRisk && t.plannedRisk > 0).length
    const profitable = stats.net > 0
    const greenDays = new Set(
      trades.filter((t) => t.amount > 0).map((t) => {
        const d = new Date(t.tradeAt)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
    ).size

    return [
      // Trade count achievements
      { id: 'first-trade', icon: Rocket, title: 'First Steps', description: 'Log your first trade', unlocked: totalTrades >= 1, progress: { current: Math.min(totalTrades, 1), target: 1 }, tier: 'bronze' as const },
      { id: 'ten-trades', icon: Target, title: 'Getting Serious', description: 'Log 10 trades', unlocked: totalTrades >= 10, progress: { current: Math.min(totalTrades, 10), target: 10 }, tier: 'bronze' as const },
      { id: 'fifty-trades', icon: Target, title: 'Dedicated Trader', description: 'Log 50 trades', unlocked: totalTrades >= 50, progress: { current: Math.min(totalTrades, 50), target: 50 }, tier: 'silver' as const },
      { id: 'hundred-trades', icon: Trophy, title: 'Century Club', description: 'Log 100 trades', unlocked: totalTrades >= 100, progress: { current: Math.min(totalTrades, 100), target: 100 }, tier: 'gold' as const },
      { id: 'five-hundred', icon: Crown, title: 'Trading Machine', description: 'Log 500 trades', unlocked: totalTrades >= 500, progress: { current: Math.min(totalTrades, 500), target: 500 }, tier: 'platinum' as const },

      // Win streak achievements
      { id: 'streak-3', icon: Flame, title: 'Hot Streak', description: 'Win 3 trades in a row', unlocked: stats.maxWinStreak >= 3, progress: { current: Math.min(stats.maxWinStreak, 3), target: 3 }, tier: 'bronze' as const },
      { id: 'streak-5', icon: Flame, title: 'On Fire', description: 'Win 5 trades in a row', unlocked: stats.maxWinStreak >= 5, progress: { current: Math.min(stats.maxWinStreak, 5), target: 5 }, tier: 'silver' as const },
      { id: 'streak-10', icon: Flame, title: 'Unstoppable', description: 'Win 10 trades in a row', unlocked: stats.maxWinStreak >= 10, progress: { current: Math.min(stats.maxWinStreak, 10), target: 10 }, tier: 'gold' as const },

      // Profitability achievements
      { id: 'first-profit', icon: DollarSign, title: 'In the Green', description: 'Achieve positive net P&L', unlocked: profitable && totalTrades >= 3, progress: { current: profitable && totalTrades >= 3 ? 1 : 0, target: 1 }, tier: 'bronze' as const },
      { id: 'profit-100', icon: DollarSign, title: 'Century Profit', description: 'Reach $100 net profit', unlocked: stats.net >= 100, progress: { current: Math.min(Math.max(stats.net, 0), 100), target: 100 }, tier: 'silver' as const },
      { id: 'profit-1000', icon: DollarSign, title: 'Grand Profit', description: 'Reach $1,000 net profit', unlocked: stats.net >= 1000, progress: { current: Math.min(Math.max(stats.net, 0), 1000), target: 1000 }, tier: 'gold' as const },
      { id: 'profit-10000', icon: Crown, title: 'Profit Legend', description: 'Reach $10,000 net profit', unlocked: stats.net >= 10000, progress: { current: Math.min(Math.max(stats.net, 0), 10000), target: 10000 }, tier: 'platinum' as const },

      // Win rate achievements
      { id: 'wr-50', icon: Star, title: 'Coin Flip Beater', description: 'Achieve 50%+ win rate (min 10 trades)', unlocked: stats.winRate >= 50 && totalTrades >= 10, progress: { current: totalTrades >= 10 ? Math.min(stats.winRate, 50) : 0, target: 50 }, tier: 'bronze' as const },
      { id: 'wr-60', icon: Star, title: 'Sharp Shooter', description: 'Achieve 60%+ win rate (min 10 trades)', unlocked: stats.winRate >= 60 && totalTrades >= 10, progress: { current: totalTrades >= 10 ? Math.min(stats.winRate, 60) : 0, target: 60 }, tier: 'silver' as const },
      { id: 'wr-70', icon: Star, title: 'Elite Trader', description: 'Achieve 70%+ win rate (min 20 trades)', unlocked: stats.winRate >= 70 && totalTrades >= 20, progress: { current: totalTrades >= 20 ? Math.min(stats.winRate, 70) : 0, target: 70 }, tier: 'gold' as const },

      // Consistency achievements
      { id: 'green-days-5', icon: TrendingUp, title: 'Consistent', description: '5 profitable trading days', unlocked: greenDays >= 5, progress: { current: Math.min(greenDays, 5), target: 5 }, tier: 'bronze' as const },
      { id: 'green-days-20', icon: TrendingUp, title: 'Consistency King', description: '20 profitable trading days', unlocked: greenDays >= 20, progress: { current: Math.min(greenDays, 20), target: 20 }, tier: 'gold' as const },

      // Risk management achievements
      { id: 'risk-tracker', icon: Shield, title: 'Risk Manager', description: 'Log planned risk on 10 trades', unlocked: withRisk >= 10, progress: { current: Math.min(withRisk, 10), target: 10 }, tier: 'silver' as const },
      { id: 'risk-master', icon: Shield, title: 'Risk Master', description: 'Log planned risk on 50 trades', unlocked: withRisk >= 50, progress: { current: Math.min(withRisk, 50), target: 50 }, tier: 'gold' as const },

      // Screenshot achievements
      { id: 'screenshot-5', icon: Camera, title: 'Visual Logger', description: 'Add screenshots to 5 trades', unlocked: screenshots >= 5, progress: { current: Math.min(screenshots, 5), target: 5 }, tier: 'bronze' as const },
      { id: 'screenshot-20', icon: Camera, title: 'Chart Master', description: 'Add screenshots to 20 trades', unlocked: screenshots >= 20, progress: { current: Math.min(screenshots, 20), target: 20 }, tier: 'silver' as const },

      // Profit factor achievements
      { id: 'pf-2', icon: Award, title: 'Edge Master', description: 'Achieve profit factor of 2.0+', unlocked: stats.profitFactor >= 2 && totalTrades >= 5, progress: { current: totalTrades >= 5 ? Math.min(stats.profitFactor, 2) : 0, target: 2 }, tier: 'silver' as const },
      { id: 'pf-3', icon: Award, title: 'Edge Legend', description: 'Achieve profit factor of 3.0+', unlocked: stats.profitFactor >= 3 && totalTrades >= 10, progress: { current: totalTrades >= 10 ? Math.min(stats.profitFactor, 3) : 0, target: 3 }, tier: 'platinum' as const },
    ]
  }, [trades, stats])

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)

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
            <Trophy className="h-4 w-4 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            {unlocked.length} of {achievements.length} unlocked · {unlocked.length > 0 && 'Keep up the great work!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Unlocked achievements */}
          {unlocked.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {unlocked.map((a) => {
                const style = TIER_STYLES[a.tier]
                return (
                  <div
                    key={a.id}
                    className={cn(
                      'flex flex-col items-center rounded-xl border bg-gradient-to-b p-4 text-center ring-1',
                      style.bg, style.ring,
                      a.tier === 'gold' && 'ring-2'
                    )}
                  >
                    <a.icon className={cn('mb-2 h-8 w-8', style.color)} />
                    <div className="text-xs font-semibold text-foreground">{a.title}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{a.description}</div>
                    <div className={cn('mt-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', style.color, 'bg-background/50')}>
                      {style.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Locked achievements (progress) */}
          {locked.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {locked.slice(0, 8).map((a) => {
                const style = TIER_STYLES[a.tier]
                const progressPct = a.progress ? Math.min(100, (a.progress.current / a.progress.target) * 100) : 0
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5"
                  >
                    <a.icon className="h-5 w-5 flex-shrink-0 text-muted-foreground/40" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-muted-foreground">{a.title}</span>
                        <span className="text-[10px] text-muted-foreground/60">{style.label}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full', style.color.replace('text', 'bg'))}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground num">
                          {a.progress?.current.toFixed(0)}/{a.progress?.target.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {unlocked.length === 0 && (
            <div className="py-8 text-center">
              <Medal className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Log more trades to unlock achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
