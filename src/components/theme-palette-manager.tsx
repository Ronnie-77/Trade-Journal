'use client'

import * as React from 'react'
import { usePaletteStore, getPalette } from '@/lib/palette-store'

/**
 * Applies the selected color palette by setting BOTH:
 *   - `data-palette` on <html>  (selects the palette block)
 *   - `.dark` class on <html>    (selects dark vs light neutrals)
 *
 * The dark palettes are authored as `[data-palette="X"].dark`, so BOTH
 * attributes are required for them to apply. Without this, dark palettes
 * would silently fall back to the light `:root` defaults whenever
 * next-themes / system preference resolved to light.
 */
export function ThemePaletteManager() {
  const palette = usePaletteStore((s) => s.palette)

  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    const mode = getPalette(palette).mode
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = mode
  }, [palette])

  return null
}

/**
 * Inline script — runs before React hydrates to set data-palette + .dark
 * from localStorage, preventing a flash of the wrong theme.
 */
export function PaletteScript() {
  const code = `(function(){try{var raw=localStorage.getItem('goldscalp-palette');var p=raw?JSON.parse(raw):null;var k=(p&&p.state&&p.state.palette)||'fintech-orange';var MODES={'fintech-orange':'dark','slate-gold':'dark','carbon-orange':'dark','lime-glow':'dark','coral-light':'light','mono-light':'light','beige-gold':'light','rust-light':'light'};var m=MODES[k]||'dark';var r=document.documentElement;r.setAttribute('data-palette',k);if(m==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}r.style.colorScheme=m;}catch(e){document.documentElement.setAttribute('data-palette','fintech-orange');document.documentElement.classList.add('dark');}})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
