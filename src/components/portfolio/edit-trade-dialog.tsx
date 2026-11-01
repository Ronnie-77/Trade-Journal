'use client'

import * as React from 'react'
import { Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useUpdateTrade } from '@/hooks/use-trades'
import {
  type Trade,
  type TradeSide,
  type TradeResult,
  type ImageKind,
  signedAmount,
} from '@/lib/trade-types'
import {
  TradeEntryBody,
  entrySigned,
  type TradeEntryValues,
} from '@/components/portfolio/trade-entry-body'

function toMagnitude(amount: number, result: string): string {
  if (result === 'BE') return '0'
  return Math.abs(amount).toString()
}

interface Props {
  trade: Trade
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function EditTradeDialog({ trade, open, onOpenChange }: Props) {
  const { toast } = useToast()
  const update = useUpdateTrade()

  const buildValues = (t: Trade): TradeEntryValues => {
    const d = new Date(t.tradeAt)
    const ds = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    const ts = `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    return {
      dateStr: ds,
      timeStr: ts,
      instrument: t.instrument || 'XAUUSD',
      lotSize: t.lotSize != null ? String(t.lotSize) : '',
      side: t.side,
      result: t.result,
      magnitude: toMagnitude(t.amount, t.result),
      plannedRisk: t.plannedRisk != null ? String(t.plannedRisk) : '',
      strategy: t.strategy || '',
      mood: t.mood || '',
      comment: t.comment,
      imageUrl: t.imageUrl || '',
      imageKind: (t.imageKind as ImageKind) || '',
      shotMode:
        t.imageKind === 'upload' ? 'upload' : t.imageUrl ? 'link' : 'link',
    }
  }

  const [values, setValues] = React.useState<TradeEntryValues>(() =>
    buildValues(trade)
  )
  const [amountError, setAmountError] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setValues(buildValues(trade))
      setAmountError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade, open])

  const patch = (p: Partial<TradeEntryValues>) => {
    setValues((v) => ({ ...v, ...p }))
    if (p.result || p.magnitude) setAmountError('')
  }

  const signed = entrySigned(values)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
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
      await update.mutateAsync({
        id: trade.id,
        input: {
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
        },
      })
      toast({ title: 'Trade updated' })
      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Could not update trade',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  const d = new Date(trade.tradeAt)
  const detail = `${trade.side} · ${trade.result} · ${d.getFullYear()}-${(
    d.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="journal max-w-[640px] border-[var(--j-line)] bg-[var(--j-bg)] p-0 sm:p-0">
        <form onSubmit={handleSave}>
          {/* header band */}
          <div
            className="j-bar"
            style={{
              borderRadius: '14px 14px 0 0',
              borderTop: 0,
              borderBottom: '1px solid var(--j-line)',
              paddingTop: 14,
              paddingBottom: 14,
            }}
          >
            <div>
              <DialogTitle className="j-title" style={{ fontSize: 18 }}>
                Edit trade
              </DialogTitle>
              <DialogDescription className="j-sub" style={{ fontSize: 12 }}>
                {detail}
              </DialogDescription>
            </div>
          </div>

          {/* body — the journal card styling */}
          <div className="j-card" style={{ border: 0, borderRadius: 0 }}>
            <TradeEntryBody
              values={values}
              onChange={patch}
              amountError={amountError}
            />
          </div>

          {/* footer */}
          <div className="j-bar" style={{ borderRadius: '0 0 14px 14px' }}>
            <span className="j-sub">
              {values.side === 'BUY' ? 'Buy' : 'Sell'} ·{' '}
              {values.result === 'TP'
                ? 'Take profit'
                : values.result === 'SL'
                ? 'Stop loss'
                : 'Break even'}{' '}
              ·{' '}
              {signed >= 0
                ? `+$${signed.toFixed(2)}`
                : `-$${Math.abs(signed).toFixed(2)}`}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="button"
                className="btn ghost"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--j-mute)',
                  padding: '11px 8px',
                }}
              >
                Cancel
              </Button>
              <button type="submit" className="btn" disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2
                    style={{
                      width: 15,
                      height: 15,
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                ) : (
                  <Save
                    style={{
                      width: 15,
                      height: 15,
                    }}
                  />
                )}
                Save changes
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
