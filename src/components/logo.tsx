'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Trade Journal logo — uses the exact brand SVG provided by the user.
 *
 * Three candlesticks (ascending, middle tallest) with a zigzag growth
 * arrow that weaves through them and ends in a solid arrowhead.
 *
 * Fixed candle colour + theme-aware arrow:
 *   - Candles: brand orange (#FF9D2E) — always
 *   - Arrow:   var(--foreground) → near-white in dark themes,
 *              near-black in light themes (white in dark mode,
 *              black in light mode)
 *   - Background: transparent
 *
 * The arrow stroke uses `var(--background)` so the cutout gaps where it
 * crosses the candles always match whatever surface the logo sits on,
 * preserving the signature "arrow passing through candles" look.
 */
export function Logo({
  className,
  size = 32,
  title = 'Trade Journal',
}: {
  className?: string
  size?: number
  title?: string
}) {
  return (
    <svg
      viewBox="428 312 463 509"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn(className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Candlesticks — brand orange (fixed) */}
      <g fill="#FF9D2E">
        {/* Candle 1 — left */}
        <rect x="525" y="484" width="9" height="50" />
        <rect x="499" y="531" width="61" height="211" />
        <rect x="525" y="738" width="9" height="53" />
        {/* Candle 2 — middle, tallest */}
        <rect x="634" y="377" width="9" height="58" />
        <rect x="608" y="431" width="60" height="187" />
        <rect x="634" y="614" width="9" height="22" />
        {/* Candle 3 — right */}
        <rect x="742" y="443" width="9" height="50" />
        <rect x="716" y="490" width="62" height="175" />
        <rect x="742" y="661" width="9" height="70" />
      </g>
      {/* Zigzag arrow + arrowhead — theme-aware via var(--foreground):
          white in dark mode, black in light mode.
          Stroke matches the page background so cutout gaps where the
          arrow crosses the candles stay clean on any surface. */}
      <polygon
        fill="var(--foreground)"
        stroke="var(--background)"
        strokeWidth="10"
        strokeLinejoin="miter"
        paintOrder="stroke fill"
        points="438,811 568,627 632,675 829,384 786,380 881,322 866,432 845,395 635,708 574,654"
      />
    </svg>
  )
}
