'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewKey = 'portfolio' | 'analytics' | 'research' | 'account'

interface ViewState {
  view: ViewKey
  setView: (v: ViewKey) => void
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      view: 'portfolio',
      setView: (v) => set({ view: v }),
    }),
    { name: 'goldscalp-view' }
  )
)
