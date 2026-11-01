'use client'

import * as React from 'react'
import { Plus, Loader2, Eraser } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateTrade, useAllTrades } from '@/hooks/use-trades'
import {
  type TradeSide,
  type TradeResult,
  type ImageKind,
  signedAmount,
  rMultiple,
  RESULT_LABEL,
} from '@/lib/trade-types'
import {
  TradeEntryBody,
  entrySigned,
  type TradeEntryValues,
} from '@/components/portfolio/trade-entry-body'

function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}
function nowHHMM(): string {
  const d = new Date()
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function fmt(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(2)}`
}
function cls(v: number): 'w' | 'l' | 'b' {
  return v > 0 ? 'w' : v < 0 ? 'l' : 'b'
}

const EMPTY: TradeEntryValues = {
  dateStr: todayISODate(),
  timeStr: nowHHMM(),
  instrument: 'XAUUSD',
  lotSize: '',
  side: 'BUY',
  result: 'TP',
  magnitude: '',
  plannedRisk: '',
  strategy: '',
  mood: '',
  comment: '',
  imageUrl: '',
  imageKind: '',
  shotMode: 'link',
}

export function TradeForm() {
  const { toast } = useToast()
  const create = useCreateTrade()
  const { data: trades } = useAllTrades()

  const [values, setValues] = React.useState<TradeEntryValues>(EMPTY)
  const [amountError, setAmountError] = React.useState('')

  const patch = (p: Partial<TradeEntryValues>) => {
    setValues((v) => ({ ...v, ...p }))
    if (p.result || p.magnitude) setAmountError('')
  }

  const signed = entrySigned(values)
  const rMult = rMultiple(signed, parseFloat(values.plannedRisk) || null)

  const summary = `${values.side === 'BUY' ? 'Buy' : 'Sell'} · ${RESULT_LABEL[values.result]} · ${fmt(signed)}`

  const handleAdd = async () => {
    if (values.result !== 'BE' && (parseFloat(values.magnitude) || 0) <= 0) {
      setAmountError('Enter the amount you made or lost.')
      return
    }
    if (!values.dateStr || !values.timeStr) {
      toast({ title: 'Missing date or time', variant: 'destructive' })
      return
    }
    const iso = new Date(`${values.dateStr}T${values.timeStr}:00`).toISOString()
    if (Number.isNaN(new Date(iso).getTime())) {
      toast({ title: 'Invalid date/time', variant: 'destructive' })
      return
    }

    try {
      await create.mutateAsync({
        tradeAt: iso,
        side: values.side,
        result: values.result,
        amount: signed,
        comment: values.comment.trim(),
        imageUrl: values.imageUrl || null,
        imageKind: values.imageKind || undefined,
        instrument: values.instrument.trim() || 'XAUUSD',
        lotSize: values.lotSize ? parseFloat(values.lotSize) : null,
        plannedRisk: values.plannedRisk ? parseFloat(values.plannedRisk) : null,
        strategy: values.strategy || null,
        mood: values.mood || null,
      })
      toast({ title: 'Trade added', description: summary })
      // reset volatile fields, keep instrument/side/result for batch entry
      setValues((v) => ({
        ...EMPTY,
        instrument: v.instrument,
        side: v.side,
        result: v.result,
        dateStr: todayISODate(),
        timeStr: nowHHMM(),
      }))
      setAmountError('')
    } catch (err) {
      toast({
        title: 'Could not add trade',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const handleClear = () => {
    setValues({ ...EMPTY, dateStr: todayISODate(), timeStr: nowHHMM() })
    setAmountError('')
  }

  // recent trades (last 5, newest first)
  const recent = React.useMemo(() => {
    if (!trades) return []
    return [...trades]
      .sort(
        (a, b) =>
          new Date(b.tradeAt).getTime() - new Date(a.tradeAt).getTime()
      )
      .slice(0, 5)
  }, [trades])

  return (
    <div className="j-grid">
      {/* LEFT: form card */}
      <form
        className="j-card"
        onSubmit={(e) => {
          e.preventDefault()
          handleAdd()
        }}
      >
        <TradeEntryBody values={values} onChange={patch} amountError={amountError} />

        {/* bottom bar */}
        <div className="j-bar">
          <span className="j-sub">{summary}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn ghost" onClick={handleClear}>
              <Eraser style={{ width: 14, height: 14 }} />
              Clear form
            </button>
            <button type="submit" className="btn" disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
              ) : (
                <Plus style={{ width: 15, height: 15 }} />
              )}
              Add trade
            </button>
          </div>
        </div>
      </form>

      {/* RIGHT: sidebar */}
      <aside className="j-aside">
        {/* ticket */}
        <div className="j-card ticket">
          <span className={'tag ' + cls(signed)}>
            {RESULT_LABEL[values.result]}
          </span>
          <div className={'pl num ' + cls(signed)}>{fmt(signed)}</div>
          <p className="j-sub">Signed result for this entry</p>
          <dl>
            <dt>Instrument</dt>
            <dd>{values.instrument.toUpperCase() || '–'}</dd>
            <dt>Side</dt>
            <dd>{values.side === 'BUY' ? 'Buy' : 'Sell'}</dd>
            <dt>When</dt>
            <dd className="num">
              {values.dateStr && values.timeStr
                ? `${values.dateStr} ${values.timeStr}`
                : '–'}
            </dd>
            <dt>R multiple</dt>
            <dd className="num">
              {rMult === null
                ? '–'
                : `${rMult > 0 ? '+' : ''}${rMult.toFixed(2)}R`}
            </dd>
          </dl>
        </div>

        {/* recent trades */}
        <div className="j-card recent">
          <h2>Recent trades</h2>
          {recent.length === 0 ? (
            <p className="empty">
              Nothing logged yet. Your last five entries show up here.
            </p>
          ) : (
            <div>
              {recent.map((t) => {
                const v = t.amount
                return (
                  <div className="item" key={t.id}>
                    <div>
                      <b>{t.instrument || 'Trade'}</b>{' '}
                      <span className="j-sub">
                        {t.side === 'BUY' ? 'Buy' : 'Sell'}
                      </span>
                      <small className="num">
                        {(() => {
                          const d = new Date(t.tradeAt)
                          const y = d.getFullYear()
                          const m = (d.getMonth() + 1)
                            .toString()
                            .padStart(2, '0')
                          const day = d.getDate().toString().padStart(2, '0')
                          const h = d.getHours().toString().padStart(2, '0')
                          const mi = d.getMinutes().toString().padStart(2, '0')
                          return `${y}-${m}-${day} ${h}:${mi}`
                        })()}
                      </small>
                    </div>
                    <b
                      className="num"
                      style={{
                        color:
                          v > 0
                            ? 'var(--j-win)'
                            : v < 0
                            ? 'var(--j-loss)'
                            : 'var(--j-be)',
                      }}
                    >
                      {fmt(v)}
                    </b>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
