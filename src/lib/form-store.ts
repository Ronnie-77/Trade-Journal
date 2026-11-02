'use client'

import { create } from 'zustand'

interface FormState {
  formOpen: boolean
  toggleForm: () => void
  setFormOpen: (v: boolean) => void
}

export const useFormStore = create<FormState>((set) => ({
  formOpen: false,
  toggleForm: () => set((s) => ({ formOpen: !s.formOpen })),
  setFormOpen: (v) => set({ formOpen: v }),
}))
