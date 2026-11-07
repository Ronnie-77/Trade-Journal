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

/** Built-in instruments shown to every user — popular instruments per category. */
export const DEFAULT_INSTRUMENTS: Instrument[] = [
  // ── Metals ──
  { symbol: 'XAUUSD', name: 'Gold / US Dollar',        category: 'Metals' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar',      category: 'Metals' },
  { symbol: 'XPTUSD', name: 'Platinum / US Dollar',    category: 'Metals' },
  { symbol: 'XPDUSD', name: 'Palladium / US Dollar',   category: 'Metals' },

  // ── Indices ──
  { symbol: 'US30',   name: 'Dow Jones 30',            category: 'Indices' },
  { symbol: 'NAS100', name: 'Nasdaq 100',              category: 'Indices' },
  { symbol: 'SPX500', name: 'S&P 500',                 category: 'Indices' },
  { symbol: 'GER40',  name: 'DAX 40 (Germany)',        category: 'Indices' },
  { symbol: 'UK100',  name: 'FTSE 100 (UK)',           category: 'Indices' },
  { symbol: 'JP225',  name: 'Nikkei 225 (Japan)',      category: 'Indices' },

  // ── Energy ──
  { symbol: 'UKOIL',  name: 'Brent Crude Oil',         category: 'Energy' },
  { symbol: 'USOIL',  name: 'WTI Crude Oil',           category: 'Energy' },
  { symbol: 'XNGUSD', name: 'Natural Gas / USD',       category: 'Energy' },

  // ── Forex ──
  { symbol: 'EURUSD', name: 'Euro / US Dollar',        category: 'Forex' },
  { symbol: 'GBPUSD', name: 'British Pound / USD',     category: 'Forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', category: 'Forex' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'Forex' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Forex' },
  { symbol: 'NZDUSD', name: 'NZ Dollar / US Dollar',   category: 'Forex' },
  { symbol: 'JPYUSD', name: 'Japanese Yen / USD',      category: 'Forex' },

  // ── Crypto ──
  { symbol: 'BTC',    name: 'Bitcoin',                 category: 'Crypto' },
  { symbol: 'ETH',    name: 'Ethereum',                category: 'Crypto' },
  { symbol: 'SOL',    name: 'Solana',                  category: 'Crypto' },
  { symbol: 'XRP',    name: 'Ripple',                  category: 'Crypto' },
  { symbol: 'DOGE',   name: 'Dogecoin',                category: 'Crypto' },
  { symbol: 'LTC',    name: 'Litecoin',                category: 'Crypto' },
  { symbol: 'ADA',    name: 'Cardano',                 category: 'Crypto' },
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

/** Infer a category from a symbol string (used for user-added instruments).
 *  Crypto is checked before Forex so symbols like "SOLUSD" or "BTCUSD"
 *  are correctly identified as Crypto rather than Forex. */
export function inferCategory(symbol: string): InstrumentCategory {
  const s = symbol.toUpperCase()
  // Metals
  if (s.includes('XAU') || s.includes('XAG') || s.includes('XPT') || s.includes('XPD')) return 'Metals'
  // Crypto — check before Forex since crypto symbols often contain "USD"
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('XRP') ||
      s.includes('DOGE') || s.includes('LTC') || s.includes('ADA') || s.includes('AVAX') ||
      s.includes('DOT') || s.includes('LINK') || s.includes('MATIC') || s.includes('BNB')) return 'Crypto'
  // Forex
  if (s.includes('USD') || s.includes('EUR') || s.includes('GBP') || s.includes('JPY') ||
      s.includes('AUD') || s.includes('NZD') || s.includes('CAD') || s.includes('CHF')) return 'Forex'
  // Indices
  if (s.includes('US30') || s.includes('NAS') || s.includes('SPX') || s.includes('GER') ||
      s.includes('UK100') || s.includes('JP225') || s.includes('HK50') || s.includes('FRA') ||
      s.includes('US2000') || s.includes('VIX')) return 'Indices'
  // Energy
  if (s.includes('OIL') || s.includes('WTI') || s.includes('BRENT') || s.includes('NGAS') ||
      s.includes('XNG')) return 'Energy'
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
