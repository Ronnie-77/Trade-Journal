'use client'

import * as React from 'react'
import { Loader2, Plus, ChevronDown } from 'lucide-react'
import { TradeForm } from '@/components/portfolio/trade-form'
import { TradeFilters } from '@/components/portfolio/trade-filters'
import { TradesTable } from '@/components/portfolio/trades-table'
import { useTrades, useAllTrades } from '@/hooks/use-trades'
import { type TradeFilters as TFilters } from '@/lib/trade-types'
import { computeStats, fmtMoney } from '@/lib/trade-stats'

export function PortfolioSection() {
  const [filters, setFilters] = React.useState<TFilters>({
    side: 'ALL',
    result: 'ALL',
    fromDate: undefined,
    toDate: undefined,
  })
  const [formOpen, setFormOpen] = React.useState(false)

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
            alignItems: 'flex-end',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div>
            <h1 className="j-title">Portfolio</h1>
            <p className="j-sub">Your trading journal</p>
          </div>
          <div className="stats">
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

        {/* Add New Trade toggle button */}
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="btn"
          style={{
            width: '100%',
            marginBottom: formOpen ? 16 : 20,
            justifyContent: 'center',
            padding: '10px 18px',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          {formOpen ? 'Close Entry Form' : 'Add New Trade Entry'}
        </button>

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
