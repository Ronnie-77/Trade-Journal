'use client'

import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InstrumentCategory =
  | 'Metals'
  | 'Indices'
  | 'Energy'
  | 'Forex'
  | 'Crypto'
  | 'Other'

export interface Instrument {
  symbol: string
  name: string
  category: InstrumentCategory
}

/** Built-in instruments shown to every user. */
export const DEFAULT_INSTRUMENTS: Instrument[] = [
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Metals' },
  { symbol: 'US30',   name: 'Dow Jones 30',     category: 'Indices' },
  { symbol: 'UKOIL',  name: 'Brent Crude Oil',  category: 'Energy' },
  { symbol: 'JPYUSD', name: 'Japanese Yen / USD', category: 'Forex' },
  { symbol: 'BTC',    name: 'Bitcoin',          category: 'Crypto' },
  { symbol: 'ETH',    name: 'Ethereum',         category: 'Crypto' },
]

/** A stable order for rendering categories. */
export const CATEGORY_ORDER: InstrumentCategory[] = [
  'Metals',
  'Indices',
  'Energy',
  'Forex',
  'Crypto',
  'Other',
]

/** Infer a category from a symbol string (used for user-added instruments). */
export function inferCategory(symbol: string): InstrumentCategory {
  const s = symbol.toUpperCase()
  if (s.includes('XAU') || s.includes('XAG') || s.includes('XPT') || s.includes('XPD')) return 'Metals'
  if (s.includes('USD') || s.includes('EUR') || s.includes('GBP') || s.includes('JPY') ||
      s.includes('AUD') || s.includes('NZD') || s.includes('CAD') || s.includes('CHF')) return 'Forex'
  if (s.includes('US30') || s.includes('NAS') || s.includes('SPX') || s.includes('GER') ||
      s.includes('UK100') || s.includes('JP225') || s.includes('HK50')) return 'Indices'
  if (s.includes('OIL') || s.includes('WTI') || s.includes('BRENT') || s.includes('NGAS')) return 'Energy'
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('XRP') ||
      s.includes('DOGE') || s.includes('LTC') || s.includes('ADA')) return 'Crypto'
  return 'Other'
}

interface InstrumentState {
  /** User-added instruments persisted across sessions. */
  custom: Instrument[]
  /** Add a new custom instrument (de-duped, upper-cased). */
  addCustom: (symbol: string, name?: string, category?: InstrumentCategory) => string
  /** Remove a custom instrument by symbol. */
  removeCustom: (symbol: string) => void
}

export const useInstrumentsStore = create<InstrumentState>()(
  persist(
    (set) => ({
      custom: [],
      addCustom: (rawSymbol, name, category) => {
        const symbol = rawSymbol.trim().toUpperCase().replace(/\s+/g, '').slice(0, 16)
        if (!symbol) return ''
        const finalName = (name?.trim() || symbol).slice(0, 48)
        const finalCat = category ?? inferCategory(symbol)
        set((state) => {
          const exists = state.custom.some((i) => i.symbol === symbol) ||
            DEFAULT_INSTRUMENTS.some((i) => i.symbol === symbol)
          if (exists) return state
          return {
            custom: [...state.custom, { symbol, name: finalName, category: finalCat }],
          }
        })
        return symbol
      },
      removeCustom: (symbol) =>
        set((state) => ({
          custom: state.custom.filter(
            (i) => i.symbol !== symbol.toUpperCase()
          ),
        })),
    }),
    { name: 'goldscalp-instruments' }
  )
)

/** Hook: returns defaults + custom instruments merged (defaults first).
 *  Memoized on `custom` so the returned array reference is stable across
 *  renders unless the user actually adds/removes a custom instrument. */
export function useAllInstruments(): Instrument[] {
  const custom = useInstrumentsStore((s) => s.custom)
  return React.useMemo(() => {
    const seen = new Set<string>()
    const out: Instrument[] = []
    for (const i of [...DEFAULT_INSTRUMENTS, ...custom]) {
      if (seen.has(i.symbol)) continue
      seen.add(i.symbol)
      out.push(i)
    }
    return out
  }, [custom])
}

/** Non-hook version for one-off reads. */
export function readAllInstruments(): Instrument[] {
  if (typeof window === 'undefined') return DEFAULT_INSTRUMENTS
  try {
    const raw = localStorage.getItem('goldscalp-instruments')
    const parsed = raw ? JSON.parse(raw) : null
    const custom: Instrument[] = parsed?.state?.custom ?? []
    const seen = new Set<string>()
    const out: Instrument[] = []
    for (const i of [...DEFAULT_INSTRUMENTS, ...custom]) {
      if (seen.has(i.symbol)) continue
      seen.add(i.symbol)
      out.push(i)
    }
    return out
  } catch {
    return DEFAULT_INSTRUMENTS
  }
}
