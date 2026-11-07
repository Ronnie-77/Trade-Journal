'use client'

import * as React from 'react'
import { UploadCloud, X, ExternalLink } from 'lucide-react'
import { SegmentedControl, MoneyInput, Chips } from '@/components/portfolio/journal-primitives'
import { InstrumentSelect } from '@/components/portfolio/instrument-select'
import {
  type TradeSide,
  type TradeResult,
  type ImageKind,
  signedAmount,
  STRATEGY_OPTIONS,
} from '@/lib/trade-types'

export interface TradeEntryValues {
  dateStr: string
  timeStr: string
  instrument: string
  lotSize: string
  side: TradeSide
  result: TradeResult
  magnitude: string
  plannedRisk: string
  strategy: string
  mood: string
  comment: string
  imageUrl: string
  imageKind: ImageKind
  shotMode: 'link' | 'upload'
}

interface Props {
  values: TradeEntryValues
  onChange: (patch: Partial<TradeEntryValues>) => void
  amountError?: string
}

export function TradeEntryBody({ values, onChange, amountError }: Props) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [uploadErr, setUploadErr] = React.useState<string | null>(null)

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    setUploadErr(null)
    if (!file.type.startsWith('image/')) {
      setUploadErr('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('File too large (max 5 MB).')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Upload failed')
      }
      const data = await res.json()
      onChange({ imageUrl: data.url, imageKind: 'upload' })
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    onChange({ imageUrl: '', imageKind: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      {/* WHEN */}
      <section className="j-section">
        <h2>When</h2>
        <div className="row r2" style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label htmlFor="te-date">Date</label>
            <input
              id="te-date"
              type="date"
              value={values.dateStr}
              onChange={(e) => onChange({ dateStr: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="te-time">Time</label>
            <input
              id="te-time"
              type="time"
              step={60}
              value={values.timeStr}
              onChange={(e) => onChange({ timeStr: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* POSITION */}
      <section className="j-section">
        <h2>Position</h2>
        <div className="row r2" style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>
          <div>
            <label htmlFor="te-sym">Instrument</label>
            <InstrumentSelect
              value={values.instrument}
              onChange={(sym) => onChange({ instrument: sym })}
              placeholder="e.g. XAUUSD"
            />
          </div>
          <div>
            <label htmlFor="te-lot">
              Lot size <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="te-lot"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.10"
              className="num"
              value={values.lotSize}
              onChange={(e) => onChange({ lotSize: e.target.value })}
            />
          </div>
        </div>
        <div className="row r2" style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <span className="lbl">Side</span>
            <SegmentedControl
              options={[
                { value: 'BUY', label: 'Buy' },
                { value: 'SELL', label: 'Sell' },
              ]}
              value={values.side}
              onChange={(v) => onChange({ side: v as TradeSide })}
            />
          </div>
          <div>
            <span className="lbl">Result</span>
            <SegmentedControl
              options={[
                { value: 'TP', label: 'Take profit' },
                { value: 'SL', label: 'Stop loss' },
                { value: 'BE', label: 'Break even' },
              ]}
              value={values.result}
              onChange={(v) => onChange({ result: v as TradeResult })}
            />
          </div>
        </div>
      </section>

      {/* RISK & REWARD */}
      <section className="j-section">
        <h2>Risk &amp; reward</h2>
        <div className="row r2" style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label htmlFor="te-amt">Amount</label>
            <MoneyInput
              id="te-amt"
              value={values.result === 'BE' ? '0' : values.magnitude}
              onChange={(v) => onChange({ magnitude: v })}
              disabled={values.result === 'BE'}
            />
            {amountError ? (
              <div className="err" role="alert">
                {amountError}
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="te-risk">
              Planned risk <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <MoneyInput
              id="te-risk"
              value={values.plannedRisk}
              onChange={(v) => onChange({ plannedRisk: v })}
            />
            <div className="hint">
              <span>Used to calculate R multiple</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEXT */}
      <section className="j-section">
        <h2>
          Context <span>optional</span>
        </h2>
        <span className="lbl">Strategy</span>
        <div>
          <Chips
            options={[...STRATEGY_OPTIONS]}
            value={values.strategy}
            onChange={(v) => onChange({ strategy: v })}
          />
        </div>
      </section>

      {/* NOTES */}
      <section className="j-section">
        <h2>Notes</h2>
        <label htmlFor="te-notes" className="lbl" style={{ position: 'absolute', left: -9999 }}>
          Notes
        </label>
        <textarea
          id="te-notes"
          maxLength={600}
          placeholder="What did you see? Why did you enter? What was the outcome?"
          value={values.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
        />
        <div className="hint">
          <span>Tip: write one thing you would repeat and one you would change.</span>
          <span className="num">{values.comment.length}/600</span>
        </div>
      </section>

      {/* SCREENSHOT */}
      <section className="j-section">
        <h2>
          Chart screenshot <span>optional</span>
        </h2>
        <SegmentedControl
          className="shotMode"
          options={[
            { value: 'link', label: 'Link' },
            { value: 'upload', label: 'Upload' },
          ]}
          value={values.shotMode}
          onChange={(v) =>
            onChange({ shotMode: v as 'link' | 'upload' })
          }
        />
        <div style={{ maxWidth: 220, marginBottom: 12 }} />
        {values.shotMode === 'link' ? (
          <input
            type="url"
            placeholder="https://example.com/chart-screenshot.png"
            value={values.imageKind === 'link' ? values.imageUrl : ''}
            onChange={(e) =>
              onChange({ imageUrl: e.target.value, imageKind: 'link' })
            }
          />
        ) : (
          <div
            className={'drop' + (dragOver ? ' drag' : '')}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFile(e.dataTransfer.files?.[0])
            }}
            style={{ marginTop: 0, marginBottom: uploading || uploadErr ? 8 : 0 }}
          >
            {uploading
              ? 'Uploading…'
              : 'Click to choose an image (PNG, JPG, WEBP · max 5 MB)'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        )}
        {uploadErr && <div className="err">{uploadErr}</div>}
        {values.imageUrl && (
          <div className="shot">
            <img src={values.imageUrl} alt="Chart screenshot preview" />
            <button type="button" onClick={removeImage}>
              <X style={{ width: 12, height: 12, verticalAlign: -2, marginRight: 4 }} />
              Remove
            </button>
          </div>
        )}
        {values.imageUrl && values.imageKind === 'link' && (
          <div className="hint">
            <a
              href={values.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--j-acc)', display: 'inline-flex', gap: 4, alignItems: 'center' }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
              opens in new tab
            </a>
          </div>
        )}
      </section>
    </>
  )
}

/** helper: compute signed amount from values */
export function entrySigned(v: TradeEntryValues): number {
  return signedAmount(v.result, parseFloat(v.magnitude) || 0)
}
