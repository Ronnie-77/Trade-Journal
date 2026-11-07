'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaletteKey =
  // dark
  | 'fintech-orange'
  | 'slate-gold'
  | 'carbon-orange'
  | 'lime-glow'
  // light
  | 'coral-light'
  | 'mono-light'
  | 'beige-gold'
  | 'rust-light'

export type PaletteMode = 'dark' | 'light'

export interface PaletteOption {
  key: PaletteKey
  label: string
  /** 3 swatch colors: [background, accent, semantic] for the dropdown preview */
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
    key: 'slate-gold',
    label: 'Slate Gold',
    swatch: ['#1E2126', '#FBBF24', '#4ADE80'],
    hasGlow: false,
    mode: 'dark',
  },
  {
    key: 'carbon-orange',
    label: 'Carbon Orange',
    swatch: ['#0A0A0B', '#FF6B35', '#22C55E'],
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
    key: 'mono-light',
    label: 'Mono Light',
    swatch: ['#F5F7FA', '#18181B', '#22C55E'],
    hasGlow: true,
    mode: 'light',
  },
  {
    key: 'beige-gold',
    label: 'Beige Gold',
    swatch: ['#E8E6E1', '#D4AF37', '#F59E0B'],
    hasGlow: true,
    mode: 'light',
  },
  {
    key: 'rust-light',
    label: 'Rust Light',
    swatch: ['#F3F4F6', '#C2410C', '#10B981'],
    hasGlow: true,
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
      // Default = fintech-orange (cool blue-gray + warm orange accent).
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
