'use client'

import * as React from 'react'
import { AuthPage } from '@/components/auth-page'
import { usePaletteStore, getPalette } from '@/lib/palette-store'

export default function SignupPage() {
  const palette = usePaletteStore((s) => s.palette)

  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    const mode = getPalette(palette).mode
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    root.style.colorScheme = mode
  }, [palette])

  return (
    <div key="signup" className="animate-page-in-right">
      <AuthPage
        mode="signup"
        onSwitchMode={() => window.location.href = '/login'}
        onBack={() => window.location.href = '/'}
    />
    </div>
  )
}
