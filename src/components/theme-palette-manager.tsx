'use client'

import * as React from 'react'
import { usePaletteStore } from '@/lib/palette-store'

/**
 * Applies the selected color palette by setting `data-palette` on <html>.
 * Includes a no-flash inline script that runs before hydration so the
 * correct palette is applied immediately on load.
 */
export function ThemePaletteManager() {
  const palette = usePaletteStore((s) => s.palette)

  React.useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
  }, [palette])

  return null
}

/**
 * Inline script — runs before React hydrates to set data-palette from
 * localStorage, preventing a flash of the wrong theme.
 */
export function PaletteScript() {
  const code = `(function(){try{var raw=localStorage.getItem('goldscalp-palette');var p=raw?JSON.parse(raw):null;var k=(p&&p.state&&p.state.palette)||'fintech-orange';document.documentElement.setAttribute('data-palette',k);}catch(e){document.documentElement.setAttribute('data-palette','fintech-orange');}})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
