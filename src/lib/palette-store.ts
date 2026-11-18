'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaletteKey =
  // dark
  | 'fintech-orange'
  | 'lime-glow'
  // light
  | 'coral-light'
  | 'trader-light'

export type PaletteMode = 'dark' | 'light'

export interface PaletteOption {
  key: PaletteKey
  label: string
  swatch: [string, string, string]
  hasGlow: boolean
  mode: PaletteMode
}

export const PALETTES: PaletteOption[] = [
  // --- Dark ---
  {
    key: 'fintech-orange',
    label: 'Fintech Orange',
    swatch: ['#1E2126', '#FF7A2D', '#22C55E'],
    hasGlow: false,
    mode: 'dark',
  },
  {
    key: 'lime-glow',
    label: 'Lime Glow',
    swatch: ['#0A0B0D', '#84CC16', '#22C55E'],
    hasGlow: true,
    mode: 'dark',
  },
  // --- Light ---
  {
    key: 'coral-light',
    label: 'Coral Light',
    swatch: ['#F5F5F7', '#F05238', '#10B981'],
    hasGlow: true,
    mode: 'light',
  },
  {
    key: 'trader-light',
    label: 'Trader Light',
    swatch: ['#FAFBFC', '#0F766E', '#F59E0B'],
    hasGlow: false,
    mode: 'light',
  },
]

interface PaletteState {
  palette: PaletteKey
  setPalette: (p: PaletteKey) => void
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set) => ({
      palette: 'fintech-orange',
      setPalette: (palette) => set({ palette }),
    }),
    { name: 'goldscalp-palette' }
  )
)

/** Look up a palette option by key. Falls back to fintech-orange (default). */
export function getPalette(key: PaletteKey): PaletteOption {
  return PALETTES.find((p) => p.key === key) ?? PALETTES.find((p) => p.key === 'fintech-orange') ?? PALETTES[0]
}
