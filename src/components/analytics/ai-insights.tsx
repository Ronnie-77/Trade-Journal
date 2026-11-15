'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Clock, Target, AlertTriangle, Zap, Check } from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { type Trade } from '@/lib/trade-types'
import { computeStats, byHour, byDayOfWeek, byInstrument, byStrategy } from '@/lib/trade-stats'
import { cn } from '@/lib/utils'

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  icon: React.ComponentType<{ className?: string }>
  title: string
  detail: string
}

export function AIInsights({ trades }: { trades: Trade[] }) {
  const insights = React.useMemo(() => {
    if (trades.length < 3) return []
    const list: Insight[] = []
    const stats = computeStats(trades)

    // 1. Best trading hour
    const hours = byHour(trades).filter((h) => h.trades > 0)
    if (hours.length > 0) {
      const bestHour = [...hours].sort((a, b) => b.net - a.net)[0]
      const worstHour = [...hours].sort((a, b) => a.net - b.net)[0]
      if (bestHour.net > 0) {
        list.push({
          type: 'positive',
          icon: Clock,
          title: `Best trading hour: ${bestHour.label}:00`,
          detail: `You've made ${bestHour.net > 0 ? '+' : ''}$${bestHour.net.toFixed(2)} from ${bestHour.trades} trades at this hour. Win rate: ${bestHour.winRate.toFixed(0)}%.`,
        })
      }
      if (worstHour.net < 0 && worstHour.trades >= 2) {
        list.push({
          type: 'warning',
          icon: Clock,
          title: `Avoid trading at ${worstHour.label}:00`,
          detail: `You've lost $${Math.abs(worstHour.net).toFixed(2)} from ${worstHour.trades} trades at this hour. Consider skipping this time slot.`,
        })
      }
    }

    // 2. Best day of week
    const dows = byDayOfWeek(trades).filter((d) => d.trades > 0)
    if (dows.length > 0) {
      const bestDay = [...dows].sort((a, b) => b.net - a.net)[0]
      if (bestDay.net > 0) {
        list.push({
          type: 'positive',
          icon: TrendingUp,
          title: `${bestDay.label} is your best day`,
          detail: `${bestDay.net > 0 ? '+' : ''}$${bestDay.net.toFixed(2)} net with ${bestDay.winRate.toFixed(0)}% win rate across ${bestDay.trades} trades.`,
        })
      }
    }

    // 3. Most profitable instrument
    const instruments = byInstrument(trades)
    if (instruments.length > 0 && instruments[0].net > 0) {
      list.push({
        type: 'positive',
        icon: Target,
        title: `Top instrument: ${instruments[0].symbol}`,
        detail: `${instruments[0].net > 0 ? '+' : ''}$${instruments[0].net.toFixed(2)} net from ${instruments[0].trades} trades. Profit factor: ${isFinite(instruments[0].profitFactor) ? instruments[0].profitFactor.toFixed(2) : '∞'}.`,
      })
    }

    // 4. Best strategy
    const strategies = byStrategy(trades)
    if (strategies.length > 0 && strategies[0].net > 0) {
      list.push({
        type: 'positive',
        icon: Zap,
        title: `"${strategies[0].strategy}" is working well`,
        detail: `${strategies[0].net > 0 ? '+' : ''}$${strategies[0].net.toFixed(2)} net with ${strategies[0].winRate.toFixed(0)}% win rate. Keep using this setup.`,
      })
    }

    // 5. Win rate insight
    if (stats.winRate >= 60) {
      list.push({
        type: 'positive',
        icon: Check,
        title: `Strong win rate: ${stats.winRate.toFixed(1)}%`,
        detail: `You're winning more than 6 out of 10 trades. Focus on quality over quantity to maintain this.`,
      })
    } else if (stats.winRate < 40 && stats.total >= 5) {
      list.push({
        type: 'warning',
        icon: AlertTriangle,
        title: `Win rate needs attention: ${stats.winRate.toFixed(1)}%`,
        detail: `Less than 40% win rate. Consider reviewing your entry criteria or reducing trade frequency.`,
      })
    }

    // 6. Profit factor insight
    if (stats.profitFactor > 2) {
      list.push({
        type: 'positive',
        icon: TrendingUp,
        title: `Excellent profit factor: ${isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : '∞'}`,
        detail: `Your profits are more than double your losses. This is a sustainable trading approach.`,
      })
    } else if (stats.profitFactor < 1 && stats.total >= 5) {
      list.push({
        type: 'negative',
        icon: TrendingDown,
        title: `Profit factor below 1: ${stats.profitFactor.toFixed(2)}`,
        detail: `You're losing more than you're making. Focus on cutting losses early or improving entry quality.`,
      })
    }

    // 7. Max drawdown insight
    if (stats.maxDrawdown > 0) {
      list.push({
        type: stats.maxDrawdown > 200 ? 'warning' : 'neutral',
        icon: TrendingDown,
        title: `Max drawdown: $${stats.maxDrawdown.toFixed(2)}`,
        detail: `Your largest peak-to-trough drop was $${stats.maxDrawdown.toFixed(2)}. Recovery factor: ${isFinite(stats.recoveryFactor) ? stats.recoveryFactor.toFixed(2) : '∞'}.`,
      })
    }

    // 8. Streak insight
    if (stats.maxWinStreak >= 3) {
      list.push({
        type: 'positive',
        icon: Zap,
        title: `${stats.maxWinStreak} win streak achieved`,
        detail: `Your longest winning streak is ${stats.maxWinStreak} trades. Currently: ${stats.currentStreak > 0 ? `${stats.currentStreak} wins` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)} losses` : 'no streak'}.`,
      })
    }

    // 9. Expectancy insight
    if (stats.expectancy > 0) {
      list.push({
        type: 'positive',
        icon: TrendingUp,
        title: `Positive expectancy: $${stats.expectancy.toFixed(2)}/trade`,
        detail: `On average, you earn $${stats.expectancy.toFixed(2)} per trade. Over 100 trades, that's $${(stats.expectancy * 100).toFixed(2)}.`,
      })
    }

    // 10. Risk management insight
    const tradesWithRisk = trades.filter((t) => t.plannedRisk && t.plannedRisk > 0)
    const riskUsage = trades.length > 0 ? (tradesWithRisk.length / trades.length) * 100 : 0
    if (riskUsage < 50 && trades.length >= 10) {
      list.push({
        type: 'warning',
        icon: AlertTriangle,
        title: `Risk tracking: only ${riskUsage.toFixed(0)}% of trades`,
        detail: `You're not logging planned risk on most trades. Tracking R multiples helps identify your true edge.`,
      })
    } else if (riskUsage >= 80) {
      list.push({
        type: 'positive',
        icon: Check,
        title: `Disciplined risk tracking: ${riskUsage.toFixed(0)}%`,
        detail: `You consistently log planned risk. This helps calculate R multiples and evaluate trade quality.`,
      })
    }

    return list
  }, [trades])

  if (insights.length === 0) {
    return null
  }

  const typeStyles = {
    positive: { icon: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    negative: { icon: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/20' },
    warning: { icon: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    neutral: { icon: 'text-primary', bg: 'bg-muted/20', border: 'border-border/40' },
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
            <Brain className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Pattern analysis from your trading data — {insights.length} insights found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type]
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-4 py-3',
                  style.bg, style.border
                )}
              >
                <insight.icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', style.icon)} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    {insight.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {insight.detail}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
