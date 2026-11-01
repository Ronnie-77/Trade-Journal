// Shared trade types used across client + server.

export type TradeSide = 'BUY' | 'SELL'
export type TradeResult = 'TP' | 'SL' | 'BE'

export type ImageKind = 'link' | 'upload' | ''

export interface Trade {
  id: string
  tradeAt: string // ISO string
  side: TradeSide
  result: TradeResult
  amount: number
  comment: string
  imageUrl: string | null
  imageKind: string | null
  instrument: string
  lotSize: number | null
  plannedRisk: number | null
  strategy: string | null
  mood: string | null
  createdAt: string
}

export interface TradeInput {
  tradeAt: string // ISO string
  side: TradeSide
  result: TradeResult
  amount: number
  comment?: string
  imageUrl?: string | null
  imageKind?: ImageKind
  instrument?: string
  lotSize?: number | null
  plannedRisk?: number | null
  strategy?: string | null
  mood?: string | null
}

export interface TradeFilters {
  side?: TradeSide | 'ALL'
  result?: TradeResult | 'ALL'
  fromDate?: string // YYYY-MM-DD
  toDate?: string // YYYY-MM-DD
}

/**
 * Returns the signed amount for a trade based on its result.
 * TP -> +magnitude, SL -> -magnitude, BE -> 0.
 */
export function signedAmount(
  result: TradeResult,
  magnitude: number
): number {
  if (result === 'TP') return Math.abs(magnitude)
  if (result === 'SL') return -Math.abs(magnitude)
  return 0
}

export const SIDE_OPTIONS: TradeSide[] = ['BUY', 'SELL']
export const RESULT_OPTIONS: TradeResult[] = ['TP', 'SL', 'BE']

export const STRATEGY_OPTIONS = [
  'Breakout',
  'Pullback',
  'Reversal',
  'News',
  'Range',
  'Scalp Indicator',
] as const

export const RESULT_LABEL: Record<TradeResult, string> = {
  TP: 'Take profit',
  SL: 'Stop loss',
  BE: 'Break even',
}

/**
 * R multiple = signed amount / planned risk.
 * Returns null if plannedRisk is missing or zero.
 */
export function rMultiple(amount: number, plannedRisk: number | null | undefined): number | null {
  if (!plannedRisk || plannedRisk <= 0) return null
  return amount / plannedRisk
}
