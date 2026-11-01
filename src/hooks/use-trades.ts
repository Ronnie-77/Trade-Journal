'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Trade, TradeInput, TradeFilters } from '@/lib/trade-types'

const BASE = '/api/trades'

function filtersToParams(f?: TradeFilters): string {
  if (!f) return ''
  const p = new URLSearchParams()
  if (f.side && f.side !== 'ALL') p.set('side', f.side)
  if (f.result && f.result !== 'ALL') p.set('result', f.result)
  if (f.fromDate) p.set('fromDate', f.fromDate)
  if (f.toDate) p.set('toDate', f.toDate)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export function useTrades(filters?: TradeFilters) {
  return useQuery<Trade[]>({
    queryKey: ['trades', filters ?? {}],
    queryFn: async () => {
      const res = await fetch(`${BASE}${filtersToParams(filters)}`)
      if (!res.ok) throw new Error('Failed to load trades')
      return res.json()
    },
  })
}

export function useAllTrades() {
  return useQuery<Trade[]>({
    queryKey: ['trades', 'all'],
    queryFn: async () => {
      const res = await fetch(BASE)
      if (!res.ok) throw new Error('Failed to load trades')
      return res.json()
    },
  })
}

export function useCreateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TradeInput) => {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to add trade')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useDeleteTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete trade')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

export function useUpdateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<TradeInput> }) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update trade')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}
