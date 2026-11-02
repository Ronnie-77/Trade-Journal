'use client'

import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/** Full footer with Risk Disclaimer — shown only on Research view */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 px-4 py-4 sm:px-6">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="text-xs leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">Risk Disclaimer</p>
              <p className="mt-1">
                Trading XAUUSD / Gold on margin carries a high level of risk and may
                not be suitable for all investors. The 84% win-rate figure is derived
                from a historical rules-based backtest and is{' '}
                <span className="font-medium text-foreground">not a guarantee</span> of
                future performance. Slippage, spread widening, broker execution and
                market regime shifts can materially affect live results. Never trade
                with capital you cannot afford to lose. This page is for educational
                and research purposes only and does not constitute financial advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
              <span className="font-mono text-[10px] font-bold text-primary">Au</span>
            </div>
            <span>© {new Date().getFullYear()} Trade Journal</span>
          </div>
          <a
            href="https://www.tradingview.com/symbols/OANDA-XAUUSD/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            XAUUSD on TradingView ↗
          </a>
        </div>
      </div>
    </footer>
  )
}

/** Minimal footer for non-Research views (no disclaimer, just copyright) */
export function MinimalFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Trade Journal
      </div>
    </footer>
  )
}
