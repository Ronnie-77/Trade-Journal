'use client'

import * as React from 'react'
import { Loader2, Plus, X, Upload } from 'lucide-react'
import { TradeForm } from '@/components/portfolio/trade-form'
import { TradeFilters } from '@/components/portfolio/trade-filters'
import { TradesTable } from '@/components/portfolio/trades-table'
import { useTrades, useAllTrades } from '@/hooks/use-trades'
import { useFormStore } from '@/lib/form-store'
import { type TradeFilters as TFilters } from '@/lib/trade-types'
import { computeStats, fmtMoney } from '@/lib/trade-stats'
import { useToast } from '@/hooks/use-toast'

export function PortfolioSection() {
  const [filters, setFilters] = React.useState<TFilters>({
    side: 'ALL',
    result: 'ALL',
    instrument: 'ALL',
    fromDate: undefined,
    toDate: undefined,
  })
  const formOpen = useFormStore((s) => s.formOpen)
  const toggleForm = useFormStore((s) => s.toggleForm)
  const { toast } = useToast()
  const fileRef = React.useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, error } = useTrades(filters)
  const { data: allTrades } = useAllTrades()

  const stats = React.useMemo(
    () => (allTrades ? computeStats(allTrades) : null),
    [allTrades]
  )

  const netColor =
    stats && stats.net > 0
      ? 'var(--j-win)'
      : stats && stats.net < 0
      ? 'var(--j-loss)'
      : 'var(--j-ink)'

  const handleRestoreClick = () => {
    fileRef.current?.click()
  }

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.trades || !Array.isArray(data.trades)) {
        toast({ title: 'Invalid backup file', variant: 'destructive' })
        return
      }

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        toast({
          title: 'Restore complete',
          description: `${result.imported} trades imported, ${result.skipped} skipped`,
        })
        // Refresh trades list
        window.location.reload()
      } else {
        toast({ title: 'Restore failed', description: result.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Invalid file', description: 'Please select a valid backup JSON file', variant: 'destructive' })
    }

    // Reset input so same file can be selected again
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="journal relative pb-16 sm:pb-0">
      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7">
        {/* Header — New Entry button + stats */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          {/* New Entry + Export buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={toggleForm}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {formOpen ? <X style={{ width: 15, height: 15 }} /> : <Plus style={{ width: 15, height: 15 }} />}
              {formOpen ? 'Close' : 'New Entry'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleRestoreFile}
            />
          </div>

          {/* Stats — KPI cards row */}
          <div className="grid w-full grid-cols-3 gap-3 sm:w-auto sm:gap-4">
            <div className="rounded-xl border border-border/40 bg-card/60 p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                Net P&amp;L
              </div>
              <div
                className="mt-1 font-mono text-lg font-bold sm:text-2xl"
                style={{ color: netColor }}
              >
                {stats ? fmtMoney(stats.net) : '–'}
              </div>
              {stats && stats.net !== 0 && (
                <div
                  className="mt-0.5 text-[10px] font-medium"
                  style={{ color: stats.net > 0 ? 'var(--j-win)' : 'var(--j-loss)' }}
                >
                  {stats.net > 0 ? '↑' : '↓'} {stats.totalProfit > 0 || stats.totalLoss > 0 ? `${Math.abs((stats.net / Math.max(stats.totalProfit + stats.totalLoss, 1)) * 100).toFixed(0)}%` : ''}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                Win Rate
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-foreground sm:text-2xl">
                {stats && (stats.wins + stats.losses) > 0
                  ? `${Math.round(stats.winRate)}%`
                  : '–'}
              </div>
              {stats && (stats.wins + stats.losses) > 0 && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {stats.wins}W · {stats.losses}L
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                Trades
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-foreground sm:text-2xl">
                {stats ? stats.total : 0}
              </div>
              {stats && stats.tradingDays > 0 && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {stats.tradingDays} days
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Form + sidebar (expand/collapse) */}
        {formOpen && <TradeForm />}

        {/* Filters + table */}
        <div className="px-0 sm:px-3 lg:px-6" style={{ marginTop: formOpen ? 28 : 8 }}>
          <div style={{ marginBottom: 16 }}>
            <TradeFilters
              filters={filters}
              onChange={setFilters}
              resultCount={data?.length ?? 0}
            />
          </div>

          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 0',
              }}
            >
              <Loader2
                className="animate-spin"
                style={{ width: 24, height: 24, color: 'var(--j-mute)' }}
              />
            </div>
          ) : isError ? (
            <div
              style={{
                borderRadius: 12,
                border: '1px solid var(--j-loss)',
                background: 'var(--j-loss-bg)',
                padding: 24,
                textAlign: 'center',
                color: 'var(--j-loss)',
                fontSize: 14,
              }}
            >
              Failed to load trades:{' '}
              {error instanceof Error ? error.message : 'unknown error'}
            </div>
          ) : (
            <TradesTable trades={data ?? []} />
          )}
        </div>
      </section>
    </div>
  )
}
