'use client'

import * as React from 'react'
import { Loader2, Plus } from 'lucide-react'
import { TradeForm } from '@/components/portfolio/trade-form'
import { TradeFilters } from '@/components/portfolio/trade-filters'
import { TradesTable } from '@/components/portfolio/trades-table'
import { useTrades, useAllTrades } from '@/hooks/use-trades'
import { useFormStore } from '@/lib/form-store'
import { type TradeFilters as TFilters } from '@/lib/trade-types'
import { computeStats, fmtMoney } from '@/lib/trade-stats'

export function PortfolioSection() {
  const [filters, setFilters] = React.useState<TFilters>({
    side: 'ALL',
    result: 'ALL',
    fromDate: undefined,
    toDate: undefined,
  })
  const formOpen = useFormStore((s) => s.formOpen)
  const toggleForm = useFormStore((s) => s.toggleForm)

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

  return (
    <div className="journal relative pb-16 sm:pb-0">
      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7">
        {/* Header — stats only */}
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
          <div>
            <h1 className="j-title">Portfolio</h1>
            <p className="j-sub">Your trading journal</p>
          </div>
          {/* Stats — centered row on mobile, inline on desktop */}
          <div className="stats flex w-full justify-center sm:w-auto sm:justify-end">
            <div className="stat">
              <small>Net P&amp;L</small>
              <b className="num" style={{ color: netColor }}>
                {stats ? fmtMoney(stats.net) : '–'}
              </b>
            </div>
            <div className="stat">
              <small>Win rate</small>
              <b className="num">
                {stats && (stats.wins + stats.losses) > 0
                  ? `${Math.round(stats.winRate)}%`
                  : '–'}
              </b>
            </div>
            <div className="stat">
              <small>Trades</small>
              <b className="num">{stats ? stats.total : 0}</b>
            </div>
          </div>
        </header>

        {/* Mobile-only New Entry button (nav has it on desktop) */}
        <div className="mb-4 flex justify-center sm:hidden">
          <button
            onClick={toggleForm}
            className="btn"
            style={{ padding: '8px 20px' }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            {formOpen ? 'Close' : 'New Entry'}
          </button>
        </div>

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
